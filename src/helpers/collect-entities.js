DefineModule('helpers/collect-entities', function () {
    return function visitNode(node, matcherFn, collection) {
        collection = collection || [];

        if (node) {
            if (matcherFn(node)) {
                collection.push(node);
            }

            if (node.children && node.children.length) {
                for (var i = 0; i < node.children.length; i++) {
                    visitNode(node.children[i], matcherFn, collection);
                }
            }
        }

        return collection;
    };
});
