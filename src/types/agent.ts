export interface AgentMetadata {
  // Required
  name: string;
  
  // Strongly Recommended
  version?: string;
  
  // Core Identity
  description?: string;
  role?: string;
  specialization?: string;
  
  // Technical Capabilities
  capabilities?: string[];
  coding_languages?: string[];
  frameworks?: string[];
  tools?: string[];
  technologies?: string[];
  
  // Domain Expertise
  industries?: string[];
  skills?: string[];
  domains?: string[];
  languages?: string[];
  
  // Model & Configuration
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
  
  // Authorship & Governance
  author?: string;
  organization?: string;
  email?: string;
  license?: string;
  created?: string; // ISO8601
  updated?: string; // ISO8601
  maintainers?: string[];
  
  // Discovery & Classification
  tags?: string[];
  keywords?: string[];
  category?: string;
  subcategory?: string;
  use_cases?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  
  // Dependencies & Integration
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