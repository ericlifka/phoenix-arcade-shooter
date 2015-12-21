(function () {
    var moduleDefinitions = { };

    function require(moduleName) {
        var moduleDefinition = moduleDefinitions[ moduleName ];
        if (moduleDefinition) {
            return moduleDefinition(require);
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
