/**
 * Type definitions for Prompt Manager MCP Server
 */

/**
 * Role enumeration - Primary user role categories
 */
export enum Role {
  DEVELOPER = 'developer',
  ARCHITECT = 'architect',
  TESTER = 'tester',
  SECURITY_SPECIALIST = 'security-specialist'
}

/**
 * Task Type enumeration - Task categories within each role
 */
export enum TaskType {
  CODE_GENERATION = 'code-generation',
  REFACTORING = 'refactoring',
  TESTING = 'testing',
  DEBUGGING = 'debugging',
  DOCUMENTATION = 'documentation',
  ARCHITECTURE_REVIEW = 'architecture-review'
}

/**
 * Module enumeration - CMS module categories
 */
export enum Module {
  CASHIERING = 'cashiering',
  GAMING_OPS = 'gaming-ops',
  MEMBERSHIP = 'membership',
  REPORTING = 'reporting',
  SECURITY = 'security',
  SHARED = 'shared',
  CONFIG = 'config',
  INTERVIEWS = 'interviews',
  RESEARCH = 'research',
  SCAFFOLDS = 'scaffolds',
  TRANSCRIPTS = 'transcripts'
}

/**
 * YAML frontmatter tags structure
 */
export interface YamlTags {
  title?: string;
  description?: string;
  version?: string;
  author?: string;
  created?: string;
  tags?: {
    role?: string[];
    'task-type'?: string[];
    module?: string[];
    compliance?: string[];
    complexity?: string[];
    'ai-agent-persona'?: string[];
  };
}

/**
 * Prompt metadata structure
 */
export interface PromptMetadata {
  id: string;                    // UUID
  name: string;                  // Human-readable name
  description: string;           // Detailed description
  role: Role;                    // Primary role category
  taskType: TaskType;            // Task type category
  module: Module;                // CMS module category
  tags: string[];                // Searchable keywords
  createdAt: string;             // ISO 8601 timestamp
  updatedAt: string;             // ISO 8601 timestamp
  version: number;               // Version number (starts at 1)
  yamlTags?: YamlTags;           // Optional YAML frontmatter tags
}

/**
 * Complete prompt structure
 */
export interface Prompt {
  metadata: PromptMetadata;
  content: string;               // Markdown content
  filePath: string;              // File system path
}

/**
 * Search criteria for finding prompts
 */
export interface SearchCriteria {
  role?: Role;
  taskType?: TaskType;
  module?: Module;
  keywords?: string;             // Space-separated keywords
  tags?: string[];               // Tag filter
  maxResults?: number;           // Maximum results to return (default: 20)
}

/**
 * Search result with relevance scoring
 */
export interface SearchResult {
  prompt: Prompt;
  score: number;                 // Relevance score
  matches: {
    field: string;               // Field that matched
    snippet?: string;            // Context snippet
  }[];
}

/**
 * List options for browsing prompts
 */
export interface ListOptions {
  role?: Role;
  taskType?: TaskType;
  module?: Module;
  format?: 'tree' | 'table' | 'detailed';  // Output format
}

/**
 * Parameters for adding a new prompt
 */
export interface AddPromptParams {
  name: string;
  description: string;
  role: Role;
  taskType: TaskType;
  module: Module;
  tags: string[];
  content: string;
}

/**
 * Parameters for updating an existing prompt
 */
export interface UpdatePromptParams {
  id: string;
  name?: string;
  description?: string;
  role?: Role;
  taskType?: TaskType;
  module?: Module;
  tags?: string[];
  content?: string;
}

/**
 * Tool response structure
 */
export interface ToolResponse {
  content: Array<{
    type: 'text';
    text: string;
  }>;
  isError?: boolean;
}

/**
 * Custom error types
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class FileSystemError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FileSystemError';
  }
}

export class HierarchyValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'HierarchyValidationError';
  }
}
