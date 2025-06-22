export interface AgentMetadata {
    name: string;
    version?: string;
    description?: string;
    role?: string;
    specialization?: string;
    capabilities?: string[];
    coding_languages?: string[];
    frameworks?: string[];
    tools?: string[];
    technologies?: string[];
    industries?: string[];
    skills?: string[];
    domains?: string[];
    languages?: string[];
    model_requirements?: {
        min_context?: number;
        max_tokens?: number;
        preferred_models?: string[];
        temperature?: number;
    };
    parameters?: {
        max_iterations?: number;
        confidence_threshold?: number;
        [key: string]: any;
    };
    author?: string;
    organization?: string;
    email?: string;
    license?: string;
    created?: string;
    updated?: string;
    maintainers?: string[];
    tags?: string[];
    keywords?: string[];
    category?: string;
    subcategory?: string;
    use_cases?: string[];
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    dependencies?: string[];
    integrations?: string[];
    apis?: string[];
    requires_internet?: boolean;
}
export interface AgentFile {
    metadata: AgentMetadata;
    content: string;
    rawContent: string;
    filePath?: string;
}
export interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
}
export interface ValidationError {
    field: string;
    message: string;
    value?: any;
}
export interface ValidationWarning {
    field: string;
    message: string;
    suggestion?: string;
}
//# sourceMappingURL=agent.d.ts.map