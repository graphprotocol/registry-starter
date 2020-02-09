import { DocumentNode } from 'graphql';
export declare const getDirectiveNames: (doc: DocumentNode) => string[];
export declare const getUniqueMutations: (doc: DocumentNode, resolverNames: string[]) => string[];
export declare const hasDirectives: (names: string[], doc: DocumentNode) => boolean;
