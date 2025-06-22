"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentSearchEngine = void 0;
class AgentSearchEngine {
    agents = new Map();
    searchIndex = new SearchIndex();
    /**
     * Add an agent to the search index
     */
    addAgent(agentId, metadata) {
        this.agents.set(agentId, metadata);
        this.searchIndex.addDocument(agentId, metadata);
    }
    /**
     * Remove an agent from the search index
     */
    removeAgent(agentId) {
        this.agents.delete(agentId);
        this.searchIndex.removeDocument(agentId);
    }
    /**
     * Search for agents based on criteria
     */
    search(options) {
        let results = Array.from(this.agents.values());
        // Text search if query provided
        if (options.query) {
            const searchIds = this.searchIndex.search(options.query);
            results = results.filter(agent => searchIds.includes(this.getAgentId(agent)));
        }
        // Apply filters
        if (options.filters) {
            results = this.applyFilters(results, options.filters);
        }
        // Sort results
        if (options.sort) {
            results = this.sortResults(results, options.sort);
        }
        // Pagination
        const offset = options.offset || 0;
        const limit = options.limit || 20;
        const paginatedResults = results.slice(offset, offset + limit);
        return {
            agents: paginatedResults,
            total: results.length,
            page: Math.floor(offset / limit) + 1,
            pageSize: limit
        };
    }
    /**
     * Get agents by specific criteria
     */
    findByCapability(capability) {
        return Array.from(this.agents.values()).filter(agent => agent.capabilities?.includes(capability));
    }
    findByLanguage(language) {
        return Array.from(this.agents.values()).filter(agent => agent.coding_languages?.includes(language));
    }
    findByCategory(category) {
        return Array.from(this.agents.values()).filter(agent => agent.category === category);
    }
    /**
     * Get recommended agents based on use case
     */
    getRecommendations(useCase, limit = 5) {
        const scores = new Map();
        for (const agent of this.agents.values()) {
            let score = 0;
            // Check use cases
            if (agent.use_cases?.some(uc => uc.toLowerCase().includes(useCase.toLowerCase()))) {
                score += 10;
            }
            // Check capabilities
            if (agent.capabilities?.some(cap => cap.toLowerCase().includes(useCase.toLowerCase()))) {
                score += 5;
            }
            // Check description
            if (agent.description?.toLowerCase().includes(useCase.toLowerCase())) {
                score += 3;
            }
            // Check tags
            if (agent.tags?.some(tag => tag.toLowerCase().includes(useCase.toLowerCase()))) {
                score += 2;
            }
            if (score > 0) {
                scores.set(agent, score);
            }
        }
        return Array.from(scores.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([agent]) => agent);
    }
    applyFilters(agents, filters) {
        return agents.filter(agent => {
            // Capability filter
            if (filters.capabilities?.length) {
                const hasCapability = filters.capabilities.some(cap => agent.capabilities?.includes(cap));
                if (!hasCapability)
                    return false;
            }
            // Language filter
            if (filters.coding_languages?.length) {
                const hasLanguage = filters.coding_languages.some(lang => agent.coding_languages?.includes(lang));
                if (!hasLanguage)
                    return false;
            }
            // Framework filter
            if (filters.frameworks?.length) {
                const hasFramework = filters.frameworks.some(fw => agent.frameworks?.includes(fw));
                if (!hasFramework)
                    return false;
            }
            // Category filter
            if (filters.category && agent.category !== filters.category) {
                return false;
            }
            // Difficulty filter
            if (filters.difficulty && agent.difficulty !== filters.difficulty) {
                return false;
            }
            // Internet requirement filter
            if (filters.requires_internet !== undefined &&
                agent.requires_internet !== filters.requires_internet) {
                return false;
            }
            return true;
        });
    }
    sortResults(agents, sort) {
        const sorted = [...agents];
        sorted.sort((a, b) => {
            let comparison = 0;
            switch (sort.field) {
                case 'name':
                    comparison = (a.name || '').localeCompare(b.name || '');
                    break;
                case 'created':
                    comparison = (a.created || '').localeCompare(b.created || '');
                    break;
                case 'updated':
                    comparison = (a.updated || '').localeCompare(b.updated || '');
                    break;
                case 'version':
                    comparison = (a.version || '').localeCompare(b.version || '');
                    break;
            }
            return sort.order === 'asc' ? comparison : -comparison;
        });
        return sorted;
    }
    getAgentId(agent) {
        return `${agent.name}-${agent.version || 'latest'}`;
    }
}
exports.AgentSearchEngine = AgentSearchEngine;
/**
 * Simple in-memory search index
 */
class SearchIndex {
    index = new Map();
    documents = new Map();
    addDocument(id, metadata) {
        this.documents.set(id, metadata);
        // Index searchable fields
        const searchableText = [
            metadata.name,
            metadata.description,
            metadata.role,
            metadata.specialization,
            ...(metadata.capabilities || []),
            ...(metadata.tags || []),
            ...(metadata.keywords || []),
            ...(metadata.use_cases || [])
        ].filter(Boolean).join(' ').toLowerCase();
        // Simple tokenization
        const tokens = searchableText.split(/\s+/);
        for (const token of tokens) {
            if (!this.index.has(token)) {
                this.index.set(token, new Set());
            }
            this.index.get(token).add(id);
        }
    }
    removeDocument(id) {
        this.documents.delete(id);
        // Remove from index
        for (const [token, ids] of this.index.entries()) {
            ids.delete(id);
            if (ids.size === 0) {
                this.index.delete(token);
            }
        }
    }
    search(query) {
        const tokens = query.toLowerCase().split(/\s+/);
        const results = new Map();
        for (const token of tokens) {
            // Exact match
            const exactMatches = this.index.get(token);
            if (exactMatches) {
                for (const id of exactMatches) {
                    results.set(id, (results.get(id) || 0) + 2);
                }
            }
            // Partial match
            for (const [indexToken, ids] of this.index.entries()) {
                if (indexToken.includes(token)) {
                    for (const id of ids) {
                        results.set(id, (results.get(id) || 0) + 1);
                    }
                }
            }
        }
        // Sort by relevance score
        return Array.from(results.entries())
            .sort((a, b) => b[1] - a[1])
            .map(([id]) => id);
    }
}
//# sourceMappingURL=index.js.map