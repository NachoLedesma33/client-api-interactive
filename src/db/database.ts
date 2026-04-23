// Stub database - in static mode, use browser's localStorage via React components
export const getDb = () => {
  return {
    requests: {
      put: async () => '',
      update: async () => 0,
      delete: async () => {},
      toArray: async () => [],
      count: async () => 0,
      orderBy: () => ({ reverse: () => ({ filter: () => ({ limit: () => ({ toArray: async () => [] }) }) }) }),
      clear: async () => {},
    },
    responses: {
      put: async () => '',
      toArray: async () => [],
      clear: async () => {},
    },
    collections: {
      put: async () => '',
      delete: async () => {},
      toArray: async () => [],
      clear: async () => {},
    },
    environments: {
      put: async () => '',
      delete: async () => {},
      toArray: async () => [],
      toCollection: () => ({ modify: async () => {} }),
      clear: async () => {},
    },
    saveRequest: async () => '',
    saveResponse: async () => '',
    saveCollection: async () => '',
    saveEnvironment: async () => '',
    getAllRequests: async () => [],
    getRecentRequests: async () => [],
    getResponsesForRequest: async () => [],
    getCollections: async () => [],
    deleteRequest: async () => {},
  };
};