import { GameObjectLike } from '../types/game';

/**
 * Recursively collect entities from a game object tree that match a predicate
 * @param node - Root node to start searching from
 * @param matcherFn - Predicate function that returns true for entities to collect
 * @param collection - Accumulator array (optional, used for recursion)
 * @returns Array of entities matching the predicate
 */
export default function collectEntities<T extends GameObjectLike>(
    node: T | null | undefined,
    matcherFn: (node: T) => boolean,
    collection?: T[]
): T[] {
    collection = collection || [];

    if (node) {
        if (matcherFn(node)) {
            collection.push(node);
        }

        if (node.children && node.children.length) {
            for (let i = 0; i < node.children.length; i++) {
                collectEntities(node.children[i] as T, matcherFn, collection);
            }
        }
    }

    return collection;
}
