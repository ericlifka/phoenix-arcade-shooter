(function () {
    var moduleDefinitions = { };
    var evaluatedModules = { };

    function require(moduleName) {
        var module = evaluatedModules[ moduleName ];
        if (module) {
            return module;
        }

        var moduleDefinition = moduleDefinitions[ moduleName ];
        if (moduleDefinition) {
            evaluatedModules[ moduleName ] = moduleDefinition(require);
        }
        else {
            throw "No module found: " + moduleName;
        }
    }

    window.DefineModule = function (moduleName, moduleDefinition) {
        console.log('registering ' + moduleName);

        if (moduleDefinitions[ moduleName ]) {
            throw "Duplicate module definition: " + moduleName;
        }

        moduleDefinitions[ moduleName ] = moduleDefinition;
    };

    window.addEventListener('load', function () {
        var main = moduleDefinitions[ 'main' ];
        if (main) {
            main(require);
        }
    });
}());
