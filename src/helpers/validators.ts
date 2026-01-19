/**
 * Validation utilities for prompt management
 */

import { Role, TaskType, Module, HierarchyValidationError } from '../models/types.js';
import { isValidCombination, getInvalidCombinationMessage } from '../config/hierarchy-config.js';
import { sanitizeString, isValidUUID } from '../models/schemas.js';

/**
 * Validate if a role is valid
 */
export function validateRole(role: string): role is Role {
  return Object.values(Role).includes(role as Role);
}

/**
 * Validate if a task type is valid
 */
export function validateTaskType(taskType: string): taskType is TaskType {
  return Object.values(TaskType).includes(taskType as TaskType);
}

/**
 * Validate if a module is valid
 */
export function validateModule(module: string): module is Module {
  return Object.values(Module).includes(module as Module);
}

/**
 * Validate role/task type combination
 * Throws HierarchyValidationError if invalid
 */
export function validateCombination(role: Role, taskType: TaskType): void {
  if (!isValidCombination(role, taskType)) {
    throw new HierarchyValidationError(getInvalidCombinationMessage(role, taskType));
  }
}

/**
 * Validate and sanitize user input string
 */
export function sanitizeInput(input: string): string {
  return sanitizeString(input);
}

/**
 * Validate UUID format
 */
export function validateUUID(id: string): boolean {
  return isValidUUID(id);
}

/**
 * Validate tags array
 */
export function validateTags(tags: string[]): string[] {
  return tags
    .filter(tag => tag && tag.trim().length > 0)
    .map(tag => sanitizeString(tag.toLowerCase()))
    .filter((tag, index, self) => self.indexOf(tag) === index); // Remove duplicates
}

/**
 * Validate and normalize keywords
 */
export function normalizeKeywords(keywords: string): string[] {
  return keywords
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 2)
    .map(word => sanitizeString(word));
}

/**
 * Validate content length
 */
export function validateContentLength(content: string, min: number = 50, max: number = 50000): boolean {
  const length = content.trim().length;
  return length >= min && length <= max;
}

/**
 * Validate name length
 */
export function validateNameLength(name: string, min: number = 3, max: number = 100): boolean {
  const length = name.trim().length;
  return length >= min && length <= max;
}

/**
 * Validate description length
 */
export function validateDescriptionLength(description: string, min: number = 10, max: number = 500): boolean {
  const length = description.trim().length;
  return length >= min && length <= max;
}
