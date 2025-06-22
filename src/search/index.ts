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

export class AgentSearchEngine {
  private agents: Map<string, AgentMetadata> = new Map();
  private searchIndex: SearchIndex = new SearchIndex();

  /**
   * Add an agent to the search index
   */
  addAgent(agentId: string, metadata: AgentMetadata): void {
    this.agents.set(agentId, metadata);
    this.searchIndex.addDocument(agentId, metadata);
  }

  /**
   * Remove an agent from the search index
   */
  removeAgent(agentId: string): void {
    this.agents.delete(agentId);
    this.searchIndex.removeDocument(agentId);
  }

  /**
   * Search for agents based on criteria
   */
  search(options: SearchOptions): SearchResult {
    let results = Array.from(this.agents.values());

    // Text search if query provided
    if (options.query) {
      const searchIds = this.searchIndex.search(options.query);
      results = results.filter(agent => 
        searchIds.includes(this.getAgentId(agent))
      );
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
  findByCapability(capability: string): AgentMetadata[] {
    return Array.from(this.agents.values()).filter(agent =>
      agent.capabilities?.includes(capability)
    );
  }

  findByLanguage(language: string): AgentMetadata[] {
    return Array.from(this.agents.values()).filter(agent =>
      agent.coding_languages?.includes(language)
    );
  }

  findByCategory(category: string): AgentMetadata[] {
    return Array.from(this.agents.values()).filter(agent =>
      agent.category === category
    );
  }

  /**
   * Get recommended agents based on use case
   */
  getRecommendations(useCase: string, limit: number = 5): AgentMetadata[] {
    const scores = new Map<AgentMetadata, number>();

    for (const agent of this.agents.values()) {
      let score = 0;

      // Check use cases
      if (agent.use_cases?.some(uc => 
        uc.toLowerCase().includes(useCase.toLowerCase())
      )) {
        score += 10;
      }

      // Check capabilities
      if (agent.capabilities?.some(cap => 
        cap.toLowerCase().includes(useCase.toLowerCase())
      )) {
        score += 5;
      }

      // Check description
      if (agent.description?.toLowerCase().includes(useCase.toLowerCase())) {
        score += 3;
      }

      // Check tags
      if (agent.tags?.some(tag => 
        tag.toLowerCase().includes(useCase.toLowerCase())
      )) {
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

  private applyFilters(agents: AgentMetadata[], filters: SearchFilters): AgentMetadata[] {
    return agents.filter(agent => {
      // Capability filter
      if (filters.capabilities?.length) {
        const hasCapability = filters.capabilities.some(cap =>
          agent.capabilities?.includes(cap)
        );
        if (!hasCapability) return false;
      }

      // Language filter
      if (filters.coding_languages?.length) {
        const hasLanguage = filters.coding_languages.some(lang =>
          agent.coding_languages?.includes(lang)
        );
        if (!hasLanguage) return false;
      }

      // Framework filter
      if (filters.frameworks?.length) {
        const hasFramework = filters.frameworks.some(fw =>
          agent.frameworks?.includes(fw)
        );
        if (!hasFramework) return false;
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

  private sortResults(agents: AgentMetadata[], sort: SortOption): AgentMetadata[] {
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

  private getAgentId(agent: AgentMetadata): string {
    return `${agent.name}-${agent.version || 'latest'}`;
  }
}

/**
 * Simple in-memory search index
 */
class SearchIndex {
  private index: Map<string, Set<string>> = new Map();
  private documents: Map<string, AgentMetadata> = new Map();

  addDocument(id: string, metadata: AgentMetadata): void {
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
      this.index.get(token)!.add(id);
    }
  }

  removeDocument(id: string): void {
    this.documents.delete(id);
    
    // Remove from index
    for (const [token, ids] of this.index.entries()) {
      ids.delete(id);
      if (ids.size === 0) {
        this.index.delete(token);
      }
    }
  }

  search(query: string): string[] {
    const tokens = query.toLowerCase().split(/\s+/);
    const results = new Map<string, number>();

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