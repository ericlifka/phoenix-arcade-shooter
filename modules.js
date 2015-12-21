(function () {
    var moduleDefinitions = { };

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
            main();
        }
    });
}());
