import ArrowShip from '../sprites/arrow-ship.js';
import Bullet from '../components/bullet.js';
import EventedInput from '../models/evented-input.js';
import GameObject from '../models/game-object.js';
import TextDisplay from '../components/text-display.js';
import UpgradeProgressOrbs from '../components/upgrade-progress-orbs.js';
import PlayerControlledShip, { BASE_MAX_LIFE } from '../ships/player-controlled-ship.js';
import {
    playerShipDef,
    playerShipDefs,
    type PlayerShipId
} from '../balance/player-ships.js';
import type { PlayerShipProfile } from '../ships/player-ship-profile.js';
import type { GameForHangar } from '../types/levels.js';
import { MAX_COMBO_UPGRADES } from '../balance/shop.js';

const TAB_Y = 22;
const SHIP_TAB_START_X = 100;
const SHIP_TAB_STRIDE = 22;
const STAT_BASE_Y = 40;
const STAT_ROW_STRIDE = 12;
const STAT_LABEL_X = 40;
const PROGRESS_RIGHT_X = 182;
const SELECT_Y = 120;
const SELECT_LABEL_X = 50;
const SELECTOR_X = 20;

interface HangarTabChrome {
    shipId: PlayerShipId;
    shipIcon: GameObject;
    leftBracket: TextDisplay;
    rightBracket: TextDisplay;
}

interface HangarStatRow {
    label: TextDisplay;
    progressOrbs: UpgradeProgressOrbs;
}

/**
 * Pre-run ship picker. Shop-style ship tabs with permanent-stat readout;
 * Select confirms the active tab. Skips entirely until Hangar Bay is owned;
 * once owned, always shows (even with a single ship).
 */
export default class Hangar extends GameObject {
    isShop = true;
    index = 1;
    disabledColor = '#777';

    game: GameForHangar;
    player: GameForHangar['player'];
    input: EventedInput;

    titleText!: TextDisplay;
    selectText!: TextDisplay;
    selectorShip!: GameObject;
    tabChrome: HangarTabChrome[] = [];
    statRows: HangarStatRow[] = [];
    activeTabIndex = 0;
    timeSinceSelected = 0;
    selecting = false;
    isDone = false;
    private interactive = false;

    constructor(parent: GameObject | null | undefined, game: GameForHangar) {
        super(parent);

        this.game = game;
        this.player = game.player;

        this.input = new EventedInput({
            onLeft: this.onLeft.bind(this),
            onRight: this.onRight.bind(this),
            onSelect: this.onSelect.bind(this)
        });

        this.reset();
    }

    reset(): void {
        super.reset();

        this.input.reset();
        this.isDone = false;
        this.selecting = false;
        this.interactive = false;
        this.activeTabIndex = 0;
        this.tabChrome = [];
        this.statRows = [];

        this.createTitle();
        this.createTabChrome();
        this.createSelectRow();
        this.createSelectorShip();
        this.addChild(this.input as unknown as GameObject);
    }

    start(): void {
        this.input.reset();
        this.isDone = false;
        this.selecting = false;
        this.clearStatRows();

        if (!this.player.technologies.hangarBay) {
            this.interactive = false;
            this.hideChrome();
            this.isDone = true;
            return;
        }

        this.createTabChrome();
        this.interactive = true;
        this.showChrome();

        const unlocked = this.unlockedShipIds();
        const activeIndex = unlocked.findIndex(
            (id) => id === this.player.activeShipId
        );
        this.activeTabIndex = activeIndex >= 0 ? activeIndex : 0;
        this.refreshTabChrome();
        this.rebuildStatsForActiveTab();
        this.refreshSelectRow();
    }

    checkIfLevelComplete(): boolean {
        return this.isDone;
    }

    update(dtime: number): void {
        super.update(dtime);

        if (!this.interactive) {
            return;
        }

        this.timeSinceSelected += dtime;
        if (this.selecting && this.timeSinceSelected > 595) {
            this.propagateSelection();
        }
    }

    private unlockedShipIds(): PlayerShipId[] {
        return playerShipDefs
            .filter((def) => this.player.isShipUnlocked(def.id))
            .map((def) => def.id);
    }

    private activeShipId(): PlayerShipId {
        const unlocked = this.unlockedShipIds();
        return unlocked[this.activeTabIndex] || unlocked[0] || 'starter';
    }

    private createTitle(): void {
        this.titleText = new TextDisplay(this, {
            font: 'arcade',
            message: 'Hangar',
            position: { x: 70, y: 8 },
            color: this.game.interfaceColor
        });
        this.addChild(this.titleText);
    }

    private clearTabChrome(): void {
        this.tabChrome.forEach((tab) => {
            this.removeChild(tab.shipIcon);
            this.removeChild(tab.leftBracket);
            this.removeChild(tab.rightBracket);
        });
        this.tabChrome = [];
    }

    private createTabChrome(): void {
        this.clearTabChrome();
        const unlocked = this.unlockedShipIds();

        this.tabChrome = unlocked.map((shipId, index) => {
            const sprite = PlayerControlledShip.spriteForShipId(shipId);
            const x = SHIP_TAB_START_X + index * SHIP_TAB_STRIDE;

            const shipIcon = new GameObject();
            shipIcon.sprite = sprite;
            shipIcon.position = { x, y: TAB_Y - 2 };
            shipIcon.index = 2;
            this.addChild(shipIcon);

            const leftBracket = new TextDisplay(this, {
                font: 'arcade-small',
                message: '[',
                position: { x: x - 5, y: TAB_Y },
                color: this.game.interfaceColor
            });
            const rightBracket = new TextDisplay(this, {
                font: 'arcade-small',
                message: ']',
                position: { x: x + sprite.width + 1, y: TAB_Y },
                color: this.game.interfaceColor
            });
            this.addChild(leftBracket);
            this.addChild(rightBracket);

            return { shipId, shipIcon, leftBracket, rightBracket };
        });

        this.refreshTabChrome();
    }

    private refreshTabChrome(): void {
        this.tabChrome.forEach((tab, index) => {
            const active = index === this.activeTabIndex;

            tab.shipIcon.sprite = PlayerControlledShip.spriteForShipId(tab.shipId);

            tab.leftBracket.changeMessage(active ? '[' : ' ');
            tab.rightBracket.changeMessage(active ? ']' : ' ');
            tab.leftBracket.updateColor(this.game.interfaceColor);
            tab.rightBracket.updateColor(this.game.interfaceColor);
        });
    }

    private createSelectRow(): void {
        this.selectText = new TextDisplay(this, {
            font: 'arcade-small',
            message: 'Select',
            position: { x: SELECT_LABEL_X, y: SELECT_Y },
            color: this.game.interfaceColor,
            isPhysicalEntity: true
        });
        this.addChild(this.selectText);
    }

    private createSelectorShip(): void {
        this.selectorShip = new GameObject();
        this.selectorShip.sprite = ArrowShip();
        this.selectorShip.position = { x: SELECTOR_X, y: SELECT_Y };
        this.addChild(this.selectorShip);
    }

    private refreshSelectRow(): void {
        const unlocked = this.player.isShipUnlocked(this.activeShipId());
        this.selectText.updateColor(
            unlocked ? this.game.interfaceColor : this.disabledColor
        );
    }

    private hideChrome(): void {
        if (this.titleText.position) {
            this.titleText.position.y = -100;
        }
        if (this.selectorShip.position) {
            this.selectorShip.position.y = -100;
        }
        if (this.selectText.position) {
            this.selectText.position.y = -100;
        }
        this.tabChrome.forEach((tab) => {
            if (tab.shipIcon.position) {
                tab.shipIcon.position.y = -100;
            }
            if (tab.leftBracket.position) {
                tab.leftBracket.position.y = -100;
            }
            if (tab.rightBracket.position) {
                tab.rightBracket.position.y = -100;
            }
        });
    }

    private showChrome(): void {
        if (this.titleText.position) {
            this.titleText.position.y = 8;
        }
        if (this.selectorShip.position) {
            this.selectorShip.position.y = SELECT_Y;
        }
        if (this.selectText.position) {
            this.selectText.position.y = SELECT_Y;
        }
        this.tabChrome.forEach((tab) => {
            if (tab.shipIcon.position) {
                tab.shipIcon.position.y = TAB_Y - 2;
            }
            if (tab.leftBracket.position) {
                tab.leftBracket.position.y = TAB_Y;
            }
            if (tab.rightBracket.position) {
                tab.rightBracket.position.y = TAB_Y;
            }
        });
    }

    private clearStatRows(): void {
        this.statRows.forEach((row) => {
            this.removeChild(row.label);
            this.removeChild(row.progressOrbs);
        });
        this.statRows = [];
    }

    private rebuildStatsForActiveTab(): void {
        this.clearStatRows();

        const shipId = this.activeShipId();
        if (!this.player.isShipUnlocked(shipId)) {
            return;
        }

        const profile = this.player.profileFor(shipId);
        const def = playerShipDef(shipId);
        const stats = this.statDescriptors(profile, def, shipId);

        this.statRows = stats.map((stat, index) => {
            const y = STAT_BASE_Y + index * STAT_ROW_STRIDE;
            const label = new TextDisplay(this, {
                font: 'arcade-small',
                message: stat.text,
                position: { x: STAT_LABEL_X, y },
                color: this.game.interfaceColor
            });
            this.addChild(label);

            const progressOrbs = new UpgradeProgressOrbs(this, PROGRESS_RIGHT_X, y);
            progressOrbs.setProgress(stat.owned, stat.max);
            this.addChild(progressOrbs);

            return { label, progressOrbs };
        });
    }

    private statDescriptors(
        profile: PlayerShipProfile,
        def: ReturnType<typeof playerShipDef>,
        shipId: PlayerShipId
    ): { text: string; owned: number; max: number }[] {
        const tech = this.player.technologies;
        const health = BASE_MAX_LIFE + profile.maxHealthRanks * 5;
        const rows: { text: string; owned: number; max: number }[] = [
            {
                text: 'Hull: ' + health,
                owned: profile.maxHealthRanks,
                max: def.maxHealth
            }
        ];

        if (tech.armorRiveter) {
            rows.push({
                text: 'Armor: ' + profile.armorRanks,
                owned: profile.armorRanks,
                max: def.maxArmor
            });
        }

        if (tech.bombFabricator) {
            const bombs = this.player.bombCapacityFor(shipId);
            rows.push({
                text: 'Bombs: ' + bombs,
                owned: profile.bombCapacityRanks,
                max: def.maxBombCapacity
            });
        }

        if (tech.fuelMixingTank) {
            rows.push({
                text: 'Ship Speed: +' + profile.shipSpeedRanks * 10 + '%',
                owned: profile.shipSpeedRanks,
                max: def.maxShipSpeed
            });
        }

        if (tech.thermalCooling) {
            rows.push({
                text: 'Fire Rate: +' + profile.fireSpeedRanks * 10 + '%',
                owned: profile.fireSpeedRanks,
                max: def.maxFireSpeed
            });
        }

        if (tech.focalLenseGrinder) {
            rows.push({
                text: 'Damage: ' + (1 + profile.damageRanks),
                owned: profile.damageRanks,
                max: def.maxDamage
            });
        }

        return rows;
    }

    private setActiveTab(index: number): void {
        const unlocked = this.unlockedShipIds();
        if (
            index < 0 ||
            index >= unlocked.length ||
            index === this.activeTabIndex ||
            this.selecting
        ) {
            return;
        }

        this.activeTabIndex = index;
        this.refreshTabChrome();
        this.rebuildStatsForActiveTab();
        this.refreshSelectRow();
    }

    onLeft(): void {
        if (!this.interactive || this.selecting) {
            return;
        }
        this.setActiveTab(this.activeTabIndex - 1);
    }

    onRight(): void {
        if (!this.interactive || this.selecting) {
            return;
        }
        this.setActiveTab(this.activeTabIndex + 1);
    }

    onSelect(): void {
        if (!this.interactive || this.selecting) {
            return;
        }

        if (!this.player.isShipUnlocked(this.activeShipId())) {
            return;
        }

        this.selecting = true;
        this.timeSinceSelected = 0;

        const x1 = this.selectorShip.position!.x + this.selectorShip.sprite.width;
        const y =
            this.selectorShip.position!.y +
            Math.floor(this.selectorShip.sprite.height / 2);

        this.addChild(new Bullet(this, {
            team: 2,
            position: { x: x1, y: y },
            velocity: { x: 50, y: 0 }
        }));
    }

    private propagateSelection(): void {
        const shipId = this.activeShipId();
        if (this.player.isShipUnlocked(shipId)) {
            this.player.selectShipForRun(shipId);
            this.game.comboGauge.syncFromPlayer();
        }

        this.selecting = false;
        this.isDone = true;
    }
}
