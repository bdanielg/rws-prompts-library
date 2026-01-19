/**
 * Path builder utilities for hierarchical prompt storage
 */

import path from 'path';
import { fileURLToPath } from 'url';
import { Role, TaskType, Module } from '../models/types.js';

/**
 * Get the base path for prompts storage
 * Uses absolute path from project root to ensure files are found regardless of cwd
 */
export function getPromptsBasePath(): string {
  if (process.env.PROMPTS_BASE_PATH) {
    return process.env.PROMPTS_BASE_PATH;
  }
  
  // Get the directory where this file is located (build/helpers)
  // Then go up to project root and into prompts directory
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  
  // From build/helpers -> go up 2 levels to project root, then into prompts
  return path.join(__dirname, '..', '..', 'prompts');
}

/**
 * Normalize a path segment to be filesystem-safe
 */
export function normalizePathSegment(segment: string): string {
  return segment
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Build hierarchical directory path for a prompt
 * Format: {basePath}/{role}/{taskType}/{module}
 */
export function buildHierarchicalPath(role: Role, taskType: TaskType, module: Module): string {
  const basePath = getPromptsBasePath();
  return path.join(basePath, role, taskType, module);
}

/**
 * Build full file path for a prompt content file
 * Format: {hierarchicalPath}/{promptId}.md
 */
export function buildPromptFilePath(role: Role, taskType: TaskType, module: Module, promptId: string): string {
  const dirPath = buildHierarchicalPath(role, taskType, module);
  return path.join(dirPath, `${promptId}.md`);
}

/**
 * Build full file path for a prompt metadata file
 * Format: {hierarchicalPath}/{promptId}.metadata.json
 */
export function buildMetadataFilePath(role: Role, taskType: TaskType, module: Module, promptId: string): string {
  const dirPath = buildHierarchicalPath(role, taskType, module);
  return path.join(dirPath, `${promptId}.metadata.json`);
}

/**
 * Parse hierarchy information from a file path
 */
export interface ParsedPath {
  role?: Role;
  taskType?: TaskType;
  module?: Module;
  promptId?: string;
  isValid: boolean;
}

export function parsePromptPath(filePath: string): ParsedPath {
  const basePath = getPromptsBasePath();
  const relativePath = path.relative(basePath, filePath);
  const segments = relativePath.split(path.sep);

  if (segments.length < 4) {
    return { isValid: false };
  }

  const [roleSegment, taskTypeSegment, moduleSegment, fileSegment] = segments;

  // Extract prompt ID from filename (remove .md or .metadata.json)
  const promptId = fileSegment
    .replace('.metadata.json', '')
    .replace('.md', '');

  return {
    role: roleSegment as Role,
    taskType: taskTypeSegment as TaskType,
    module: moduleSegment as Module,
    promptId,
    isValid: true
  };
}

/**
 * Get all possible role directories
 */
export function getRoleDirectories(): string[] {
  const basePath = getPromptsBasePath();
  return Object.values(Role).map(role => path.join(basePath, role));
}

/**
 * Get all possible task type directories for a role
 */
export function getTaskTypeDirectories(role: Role): string[] {
  const basePath = getPromptsBasePath();
  return Object.values(TaskType).map(taskType => 
    path.join(basePath, role, taskType)
  );
}

/**
 * Get all possible module directories for a role and task type
 */
export function getModuleDirectories(role: Role, taskType: TaskType): string[] {
  const basePath = getPromptsBasePath();
  return Object.values(Module).map(module => 
    path.join(basePath, role, taskType, module)
  );
}
