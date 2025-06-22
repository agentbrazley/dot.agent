import type { AgentMetadata } from '../types/agent';
export interface SearchOptions {
    query?: string;
    filters?: SearchFilters;
    sort?: SortOption;
    limit?: number;
    offset?: number;
}
export interface SearchFilters {
    capabilities?: string[];
    coding_languages?: string[];
    frameworks?: string[];
    industries?: string[];
    tags?: string[];
    category?: string;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    author?: string;
    organization?: string;
    requires_internet?: boolean;
}
export interface SortOption {
    field: 'name' | 'version' | 'created' | 'updated' | 'relevance';
    order: 'asc' | 'desc';
}
export interface SearchResult {
    agents: AgentMetadata[];
    total: number;
    page: number;
    pageSize: number;
}
export declare class AgentSearchEngine {
    private agents;
    private searchIndex;
    /**
     * Add an agent to the search index
     */
    addAgent(agentId: string, metadata: AgentMetadata): void;
    /**
     * Remove an agent from the search index
     */
    removeAgent(agentId: string): void;
    /**
     * Search for agents based on criteria
     */
    search(options: SearchOptions): SearchResult;
    /**
     * Get agents by specific criteria
     */
    findByCapability(capability: string): AgentMetadata[];
    findByLanguage(language: string): AgentMetadata[];
    findByCategory(category: string): AgentMetadata[];
    /**
     * Get recommended agents based on use case
     */
    getRecommendations(useCase: string, limit?: number): AgentMetadata[];
    private applyFilters;
    private sortResults;
    private getAgentId;
}
//# sourceMappingURL=index.d.ts.map