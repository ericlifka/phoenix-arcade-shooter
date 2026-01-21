export default function collectEntities(node, matcherFn, collection) {
    collection = collection || [];

    if (node) {
        if (matcherFn(node)) {
            collection.push(node);
        }

        if (node.children && node.children.length) {
            for (let i = 0; i < node.children.length; i++) {
                collectEntities(node.children[i], matcherFn, collection);
            }
        }
    }

    return collection;
}
