"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const array_1 = require("./array");
const visitor_1 = require("graphql/language/visitor");
exports.getDirectiveNames = (doc) => {
    const names = [];
    visitor_1.visit(doc, {
        Directive(node) {
            names.push(node.name.value);
        }
    });
    return names;
};
exports.getUniqueMutations = (doc, resolverNames) => {
    let names = [];
    visitor_1.visit(doc, {
        OperationDefinition(node) {
            node.selectionSet.selections.reduce((result, selection) => {
                if (selection.kind === 'Field' && resolverNames.includes(selection.name.value)) {
                    result.push(selection.name.value);
                }
                return result;
            }, names);
        },
    });
    return array_1.makeRepeatedUnique(names);
};
exports.hasDirectives = (names, doc) => exports.getDirectiveNames(doc).some((name) => names.indexOf(name) > -1);
//# sourceMappingURL=schemaParsing.js.map