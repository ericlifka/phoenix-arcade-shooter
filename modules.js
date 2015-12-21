(function () {
    var moduleDefinitions = { };
    var evaluatedModules = { };
    var evaluationStack = [ ];

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
