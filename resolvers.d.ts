/**
 * 🚀 SELENE SONG CORE GRAPHQL RESOLVERS
 * Resolvers GraphQL optimizados para lazy loading
 */
export declare const resolvers: {
    Query: {
        health: () => string;
        heapDiagnostic: () => any;
        modules: () => any;
        serverStatus: () => any;
        poetryDashboard: () => Promise<any>;
        generatePoetry: (_: any, { domain, context, claims }: any) => Promise<any>;
        cyberpunkVerses: () => Promise<any>;
    };
    Mutation: {
        triggerGarbageCollection: () => string;
        resetServer: () => string;
        awakenDigitalSoul: (_: any, { nodeId }: any) => Promise<string>;
        harmonizeDigitalSoul: (_: any, { nodeId }: any) => Promise<string>;
    };
};
//# sourceMappingURL=resolvers.d.ts.map
