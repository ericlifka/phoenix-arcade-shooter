(function () {
    var moduleDefinitions = {};
    var evaluatedModules = {};
    var evaluationStack = [];

    function require(moduleName) {
        if (evaluationStack.indexOf(moduleName) > -1) {
            throw "Circular dependencies not supported: " + moduleName
            + " required while still being evaluated";
        }

        var module = evaluatedModules[ moduleName ];
        if (module) {
            return module;
        }

        var moduleDefinition = moduleDefinitions[ moduleName ];
        if (moduleDefinition) {
            evaluationStack.push(moduleName);
            module = evaluatedModules[ moduleName ] = moduleDefinition(require);
            evaluationStack.pop();

            return module;
        }
        else {
            throw "No module found: " + moduleName;
        }
    }

    function mixIn(_class, properties) {
        Object.keys(properties).forEach(function (key) {
            _class.prototype[ key ] = properties[ key ];
        });
    }

    window.DefineClass = function (Base, definition) {
        if (typeof Base === "object" && !definition) {
            definition = Base;
            Base = function () {
            };
        }

        function Constructor() {
            if (typeof this.constructor === "function") {
                this.constructor.apply(this, arguments);
            }
        }

        Constructor.prototype = new Base();
        mixIn(Constructor, definition);
        mixIn(Constructor, {
            super: function (name, args) {
                // WARNING: this is known to only work for one level of base class
                // if the base class has a parent and uses a super call it won't work
                if (typeof Base.prototype[ name ] === "function") {
                    Base.prototype[ name ].apply(this, args);
                }
            }
        });

        return Constructor;
    };

    window.DefineModule = function (moduleName, moduleDefinition) {
        if (moduleDefinitions[ moduleName ]) {
            throw "Duplicate module definition: " + moduleName;
        }

        moduleDefinitions[ moduleName ] = moduleDefinition;
    };

    window.addEventListener('load', function () {
        require('main');
    });

}());
