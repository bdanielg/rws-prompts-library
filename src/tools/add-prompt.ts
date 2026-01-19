/**
 * Add Prompt Tool - Create new prompts
 */

import { ToolResponse } from '../models/types.js';
import { addPromptSchema } from '../models/schemas.js';
import { PromptService } from '../services/prompt-service.js';
import { createLogger } from '../helpers/logger.js';

const logger = createLogger('add-prompt-tool');

export function registerAddPromptTool(promptService: PromptService) {
  return {
    name: 'add-prompt',
    description: 'Create a new prompt with specified role, task type, module, tags, and content. Validates hierarchy and creates necessary directory structure.',
    inputSchema: addPromptSchema,
    handler: async (args: unknown): Promise<ToolResponse> => {
      try {
        // Validate input
        const params = addPromptSchema.parse(args);

        logger.info('Adding new prompt:', {
          name: params.name,
          role: params.role,
          taskType: params.taskType,
          module: params.module
        });

        // Add prompt
        const prompt = await promptService.addPrompt(params);

        // Format success response
        let markdown = '# ✅ Prompt Created Successfully\n\n';
        markdown += `A new prompt has been created and saved to the library.\n\n`;

        markdown += `## Prompt Details\n\n`;
        markdown += `**Name:** ${prompt.metadata.name}\n\n`;
        markdown += `**ID:** \`${prompt.metadata.id}\`\n\n`;

        markdown += `**Hierarchy:**\n`;
        markdown += `- **Role:** ${prompt.metadata.role}\n`;
        markdown += `- **Task Type:** ${prompt.metadata.taskType}\n`;
        markdown += `- **Module:** ${prompt.metadata.module}\n\n`;

        markdown += `**Metadata:**\n`;
        markdown += `- **Description:** ${prompt.metadata.description}\n`;
        markdown += `- **Tags:** ${prompt.metadata.tags.join(', ')}\n`;
        markdown += `- **Version:** ${prompt.metadata.version}\n`;
        markdown += `- **Created:** ${new Date(prompt.metadata.createdAt).toLocaleString()}\n\n`;

        markdown += `**File Location:**\n`;
        markdown += `\`${prompt.filePath}\`\n\n`;

        markdown += `**Content Length:** ${prompt.content.length} characters\n\n`;

        markdown += `---\n\n`;
        markdown += `**Next Steps:**\n`;
        markdown += `- Use \`search-prompts\` to find this prompt\n`;
        markdown += `- Use \`update-prompt\` to modify it\n`;
        markdown += `- Use \`list-prompts\` to see it in the library\n`;

        logger.info(`Prompt created successfully: ${prompt.metadata.id}`);

        return {
          content: [{
            type: 'text',
            text: markdown
          }]
        };

      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.error(`Failed to add prompt: ${message}`);

        let markdown = '# ❌ Failed to Create Prompt\n\n';
        markdown += `**Error:** ${message}\n\n`;

        // Provide helpful guidance based on error type
        if (message.includes('Invalid combination')) {
          markdown += `**Hint:** This role/task type combination is not allowed. `;
          markdown += `Use valid combinations according to the hierarchy configuration.\n\n`;
          markdown += `**Common Valid Combinations:**\n`;
          markdown += `- **developer:** code-generation, refactoring, debugging, testing, documentation\n`;
          markdown += `- **architect:** architecture-review, documentation, code-generation, refactoring\n`;
          markdown += `- **tester:** testing, debugging, documentation\n`;
          markdown += `- **security-specialist:** architecture-review, code-generation, testing, documentation\n`;
        } else if (message.includes('validation')) {
          markdown += `**Hint:** Please check that all required fields are provided and meet the validation rules:\n`;
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
