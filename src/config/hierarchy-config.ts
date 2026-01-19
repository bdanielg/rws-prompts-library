/**
 * Hierarchy configuration for valid role/task type combinations
 */

import { Role, TaskType } from '../models/types.js';

/**
 * Valid combinations of Role and TaskType
 * This configuration defines which task types are valid for each role
 */
export const VALID_COMBINATIONS: Record<Role, TaskType[]> = {
  [Role.DEVELOPER]: [
    TaskType.CODE_GENERATION,
    TaskType.REFACTORING,
    TaskType.DEBUGGING,
    TaskType.TESTING,
    TaskType.DOCUMENTATION
  ],
  [Role.ARCHITECT]: [
    TaskType.ARCHITECTURE_REVIEW,
    TaskType.DOCUMENTATION,
    TaskType.CODE_GENERATION,
    TaskType.REFACTORING
  ],
  [Role.TESTER]: [
    TaskType.TESTING,
    TaskType.DEBUGGING,
    TaskType.DOCUMENTATION
  ],
  [Role.SECURITY_SPECIALIST]: [
    TaskType.ARCHITECTURE_REVIEW,
    TaskType.CODE_GENERATION,
    TaskType.TESTING,
    TaskType.DOCUMENTATION
  ]
};

/**
 * Validate if a role/task type combination is valid
 */
export function isValidCombination(role: Role, taskType: TaskType): boolean {
  const validTaskTypes = VALID_COMBINATIONS[role];
  return validTaskTypes.includes(taskType);
}

/**
 * Get valid task types for a given role
 */
export function getValidTaskTypes(role: Role): TaskType[] {
  return VALID_COMBINATIONS[role] || [];
}

/**
 * Get all roles that support a given task type
 */
export function getRolesForTaskType(taskType: TaskType): Role[] {
  return Object.entries(VALID_COMBINATIONS)
    .filter(([_, taskTypes]) => taskTypes.includes(taskType))
    .map(([role, _]) => role as Role);
}

/**
 * Get a formatted error message for invalid combinations
 */
export function getInvalidCombinationMessage(role: Role, taskType: TaskType): string {
  const validTaskTypes = getValidTaskTypes(role);
  return `Invalid combination: ${role} cannot have task type ${taskType}. ` +
    `Valid task types for ${role} are: ${validTaskTypes.join(', ')}`;
}
