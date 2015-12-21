(function () {
    var moduleDefinitions = { };

    window.DefineModule = function (moduleName, moduleDefinition) {
        console.log('registering ' + moduleName);

        if (moduleDefinitions[ moduleName ]) {
            throw "Duplicate module definition: " + moduleName;
        }

        moduleDefinitions[ moduleName ] = moduleDefinition;
    };
}());
