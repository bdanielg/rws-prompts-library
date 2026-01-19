/**
 * Update Prompt Tool - Modify existing prompts
 */

import { ToolResponse } from '../models/types.js';
import { updatePromptSchema } from '../models/schemas.js';
import { PromptService } from '../services/prompt-service.js';
import { createLogger } from '../helpers/logger.js';

const logger = createLogger('update-prompt-tool');

export function registerUpdatePromptTool(promptService: PromptService) {
  return {
    name: 'update-prompt',
    description: 'Update an existing prompt. Can modify metadata, content, or hierarchy. Files are moved if hierarchy changes.',
    inputSchema: updatePromptSchema,
    handler: async (args: unknown): Promise<ToolResponse> => {
      try {
        // Validate input
        const params = updatePromptSchema.parse(args);

        logger.info('Updating prompt:', {
          id: params.id,
          fields: Object.keys(params).filter(k => k !== 'id' && params[k as keyof typeof params] !== undefined)
        });

        // Get current prompt first to show changes
        const beforePrompt = await promptService.getPrompt(params.id);

        // Update prompt
        const afterPrompt = await promptService.updatePrompt(params);

        // Detect what changed
        const changes: string[] = [];
        const hierarchyChanged = 
          beforePrompt.metadata.role !== afterPrompt.metadata.role ||
          beforePrompt.metadata.taskType !== afterPrompt.metadata.taskType ||
          beforePrompt.metadata.module !== afterPrompt.metadata.module;

        if (params.name) changes.push('name');
        if (params.description) changes.push('description');
        if (params.role || params.taskType || params.module) changes.push('hierarchy');
        if (params.tags) changes.push('tags');
        if (params.content) changes.push('content');

        // Format success response
        let markdown = '# ✅ Prompt Updated Successfully\n\n';
        markdown += `The prompt has been updated. Version incremented to **${afterPrompt.metadata.version}**.\n\n`;

        markdown += `## Updated Prompt Details\n\n`;
        markdown += `**Name:** ${afterPrompt.metadata.name}\n`;
        markdown += `**ID:** \`${afterPrompt.metadata.id}\`\n\n`;

        markdown += `**Current Hierarchy:**\n`;
        markdown += `- **Role:** ${afterPrompt.metadata.role}\n`;
        markdown += `- **Task Type:** ${afterPrompt.metadata.taskType}\n`;
        markdown += `- **Module:** ${afterPrompt.metadata.module}\n\n`;

        markdown += `**Metadata:**\n`;
        markdown += `- **Description:** ${afterPrompt.metadata.description}\n`;
        markdown += `- **Tags:** ${afterPrompt.metadata.tags.join(', ')}\n`;
        markdown += `- **Version:** ${afterPrompt.metadata.version}\n`;
        markdown += `- **Updated:** ${new Date(afterPrompt.metadata.updatedAt).toLocaleString()}\n\n`;

        if (hierarchyChanged) {
          markdown += `**⚠️ Hierarchy Changed:**\n`;
          markdown += `Files have been moved to the new location.\n\n`;
          markdown += `**Before:**\n`;
          markdown += `- Role: ${beforePrompt.metadata.role}\n`;
          markdown += `- Task Type: ${beforePrompt.metadata.taskType}\n`;
          markdown += `- Module: ${beforePrompt.metadata.module}\n\n`;
          markdown += `**After:**\n`;
          markdown += `- Role: ${afterPrompt.metadata.role}\n`;
          markdown += `- Task Type: ${afterPrompt.metadata.taskType}\n`;
          markdown += `- Module: ${afterPrompt.metadata.module}\n\n`;
        }

        markdown += `**New File Location:**\n`;
        markdown += `\`${afterPrompt.filePath}\`\n\n`;

        markdown += `**Changes Applied:** ${changes.join(', ')}\n\n`;

        if (params.content) {
          markdown += `**Content Length:** ${afterPrompt.content.length} characters\n\n`;
        }

        markdown += `---\n\n`;
        markdown += `**Change Summary:**\n`;
        
        if (params.name && params.name !== beforePrompt.metadata.name) {
          markdown += `- Name: "${beforePrompt.metadata.name}" → "${afterPrompt.metadata.name}"\n`;
        }
        
        if (params.description && params.description !== beforePrompt.metadata.description) {
          markdown += `- Description updated\n`;
        }

        if (params.tags) {
          const addedTags = afterPrompt.metadata.tags.filter(t => !beforePrompt.metadata.tags.includes(t));
          const removedTags = beforePrompt.metadata.tags.filter(t => !afterPrompt.metadata.tags.includes(t));
          if (addedTags.length > 0) markdown += `- Tags added: ${addedTags.join(', ')}\n`;
          if (removedTags.length > 0) markdown += `- Tags removed: ${removedTags.join(', ')}\n`;
        }

        if (params.content) {
          const sizeDiff = afterPrompt.content.length - beforePrompt.content.length;
          markdown += `- Content updated (${sizeDiff > 0 ? '+' : ''}${sizeDiff} characters)\n`;
        }

        logger.info(`Prompt updated successfully: ${params.id}`);

        return {
          content: [{
            type: 'text',
            text: markdown
          }]
        };

      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.error(`Failed to update prompt: ${message}`);

        let markdown = '# ❌ Failed to Update Prompt\n\n';
        markdown += `**Error:** ${message}\n\n`;

        // Provide helpful guidance based on error type
        if (message.includes('not found')) {
          markdown += `**Hint:** The prompt with the specified ID does not exist. `;
          markdown += `Use \`search-prompts\` or \`list-prompts\` to find valid prompt IDs.\n`;
        } else if (message.includes('Invalid combination')) {
          markdown += `**Hint:** The new role/task type combination is not allowed. `;
          markdown += `Use valid combinations according to the hierarchy configuration.\n\n`;
          markdown += `**Common Valid Combinations:**\n`;
          markdown += `- **developer:** code-generation, refactoring, debugging, testing, documentation\n`;
          markdown += `- **architect:** architecture-review, documentation, code-generation, refactoring\n`;
          markdown += `- **tester:** testing, debugging, documentation\n`;
          markdown += `- **security-specialist:** architecture-review, code-generation, testing, documentation\n`;
        } else if (message.includes('validation')) {
          markdown += `**Hint:** Please check that updated fields meet the validation rules:\n`;
          markdown += `- Name: 3-100 characters\n`;
          markdown += `- Description: 10-500 characters\n`;
          markdown += `- Tags: 1-10 tags\n`;
          markdown += `- Content: 50-50,000 characters\n`;
        }

        return {
          content: [{
            type: 'text',
            text: markdown
          }],
          isError: true
        };
      }
    }
  };
}
