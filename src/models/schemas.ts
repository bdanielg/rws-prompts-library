/**
 * Zod validation schemas for Prompt Manager MCP Server
 */

import { z } from 'zod';
import { Role, TaskType, Module } from './types.js';

/**
 * Role schema
 */
export const roleSchema = z.nativeEnum(Role, {
  message: 'Invalid role. Must be one of: developer, architect, tester, security-specialist'
});

/**
 * Task Type schema
 */
export const taskTypeSchema = z.nativeEnum(TaskType, {
  message: 'Invalid task type. Must be one of: code-generation, refactoring, testing, debugging, documentation, architecture-review'
});

/**
 * Module schema
 */
export const moduleSchema = z.nativeEnum(Module, {
  message: 'Invalid module. Must be one of: cashiering, gaming-ops, membership, reporting, security, shared, config, interviews, research, scaffolds, transcripts'
});

/**
 * Prompt metadata schema
 */
export const promptMetadataSchema = z.object({
  id: z.string().uuid('Prompt ID must be a valid UUID'),
  name: z.string()
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name must not exceed 100 characters'),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must not exceed 500 characters'),
  role: roleSchema,
  taskType: taskTypeSchema,
  module: moduleSchema,
  tags: z.array(z.string())
    .min(1, 'At least one tag is required')
    .max(10, 'Maximum 10 tags allowed'),
  createdAt: z.string().datetime('Created timestamp must be ISO 8601 format'),
  updatedAt: z.string().datetime('Updated timestamp must be ISO 8601 format'),
  version: z.number().int().positive('Version must be a positive integer')
});

/**
 * Search criteria schema
 */
export const searchCriteriaSchema = z.object({
  role: roleSchema.optional(),
  taskType: taskTypeSchema.optional(),
  module: moduleSchema.optional(),
  keywords: z.string().optional(),
  tags: z.array(z.string()).optional(),
  maxResults: z.number()
    .int()
    .min(1, 'Max results must be at least 1')
    .max(100, 'Max results cannot exceed 100')
    .default(20)
    .optional()
}).refine(
  data => data.role || data.taskType || data.module || data.keywords || data.tags,
  { message: 'At least one search criterion must be provided' }
);

/**
 * List options schema
 */
export const listOptionsSchema = z.object({
  role: roleSchema.optional(),
  taskType: taskTypeSchema.optional(),
  module: moduleSchema.optional(),
  format: z.enum(['tree', 'table', 'detailed']).default('tree').optional()
});

/**
 * Add prompt schema
 */
export const addPromptSchema = z.object({
  name: z.string()
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name must not exceed 100 characters'),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must not exceed 500 characters'),
  role: roleSchema,
  taskType: taskTypeSchema,
  module: moduleSchema,
  tags: z.array(z.string())
    .min(1, 'At least one tag is required')
    .max(10, 'Maximum 10 tags allowed'),
  content: z.string()
    .min(50, 'Content must be at least 50 characters')
    .max(50000, 'Content must not exceed 50,000 characters')
});

/**
 * Update prompt schema
 */
export const updatePromptSchema = z.object({
  id: z.string().uuid('Prompt ID must be a valid UUID'),
  name: z.string()
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name must not exceed 100 characters')
    .optional(),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must not exceed 500 characters')
    .optional(),
  role: roleSchema.optional(),
  taskType: taskTypeSchema.optional(),
  module: moduleSchema.optional(),
  tags: z.array(z.string())
    .min(1, 'At least one tag is required')
    .max(10, 'Maximum 10 tags allowed')
    .optional(),
  content: z.string()
    .min(50, 'Content must be at least 50 characters')
    .max(50000, 'Content must not exceed 50,000 characters')
    .optional()
}).refine(
  data => data.name || data.description || data.role || data.taskType || 
          data.module || data.tags || data.content,
  { message: 'At least one field must be provided for update' }
);

/**
 * Helper function to validate and sanitize string input
 */
export function sanitizeString(input: string): string {
  // Remove potential HTML/script tags
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim();
}

/**
 * Helper function to validate UUID format
 */
export function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}
