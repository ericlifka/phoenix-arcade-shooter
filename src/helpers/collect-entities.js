DefineModule('helpers/collect-entities', function () {
    return function visitNode(node, collection) {
        collection = collection || [];

        if (node) {
            if (node.isPhysicalEntity) {
                collection.push(node);
            }

            if (node.children && node.children.length) {
                for (var i = 0; i < node.children.length; i++) {
                    visitNode(node.children[i], collection);
                }
            }
        }

        return collection;
    };
});
