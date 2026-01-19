/**
 * Get Prompt Tool - Retrieve a single prompt by ID
 */

import { ToolResponse } from '../models/types.js';
import { z } from 'zod';
import { PromptService } from '../services/prompt-service.js';
import { createLogger } from '../helpers/logger.js';

const logger = createLogger('get-prompt-tool');

// Input schema for get-prompt tool
const getPromptSchema = z.object({
  id: z.string().describe('The UUID of the prompt to retrieve')
});

export function registerGetPromptTool(promptService: PromptService) {
  return {
    name: 'get-prompt',
    description: 'Retrieve the full content and metadata of a specific prompt by its ID.',
    inputSchema: getPromptSchema,
    handler: async (args: unknown): Promise<ToolResponse> => {
      try {
        // Validate input
        const params = getPromptSchema.parse(args);

        logger.info(`Getting prompt: ${params.id}`);

        // Get the prompt
        const prompt = await promptService.getPrompt(params.id);

        // Build markdown response
        let markdown = '# Prompt Details\n\n';
        
        const { metadata } = prompt;

        // Metadata section
        markdown += '## Metadata\n\n';
        markdown += `- **ID:** \`${metadata.id}\`\n`;
        markdown += `- **Name:** ${metadata.name}\n`;
        markdown += `- **Description:** ${metadata.description}\n`;
        markdown += `- **Role:** ${metadata.role}\n`;
        markdown += `- **Task Type:** ${metadata.taskType}\n`;
        markdown += `- **Module:** ${metadata.module}\n`;
        markdown += `- **Tags:** ${metadata.tags.join(', ')}\n`;
        markdown += `- **Version:** ${metadata.version}\n`;
        markdown += `- **Created:** ${new Date(metadata.createdAt).toLocaleString()}\n`;
        markdown += `- **Updated:** ${new Date(metadata.updatedAt).toLocaleString()}\n`;
        markdown += `- **File Path:** \`${prompt.filePath}\`\n\n`;

        // Add YAML frontmatter tags if available
        if (metadata.yamlTags?.tags) {
          markdown += '## Tags (from YAML frontmatter)\n\n';
          const yamlTags = metadata.yamlTags.tags;
          
          if (yamlTags.role && yamlTags.role.length > 0) {
            markdown += `- **role:** \`${yamlTags.role.join('\`, \`')}\`\n`;
          }
          if (yamlTags['task-type'] && yamlTags['task-type'].length > 0) {
            markdown += `- **task-type:** \`${yamlTags['task-type'].join('\`, \`')}\`\n`;
          }
          if (yamlTags.module && yamlTags.module.length > 0) {
            markdown += `- **module:** \`${yamlTags.module.join('\`, \`')}\`\n`;
          }
          if (yamlTags.compliance && yamlTags.compliance.length > 0) {
            markdown += `- **compliance:** \`${yamlTags.compliance.join('\`, \`')}\`\n`;
          } else {
            markdown += `- **compliance:** \`none\`\n`;
          }
          if (yamlTags.complexity && yamlTags.complexity.length > 0) {
            markdown += `- **complexity:** \`${yamlTags.complexity.join('\`, \`')}\`\n`;
          }
          if (yamlTags['ai-agent-persona'] && yamlTags['ai-agent-persona'].length > 0) {
            markdown += `- **ai-agent-persona:** \`${yamlTags['ai-agent-persona'].join('\`, \`')}\`\n`;
          }
          markdown += '\n';
        }

        // Full content section
        markdown += '## Full Content\n\n';
        markdown += '```markdown\n';
        markdown += prompt.content;
        markdown += '\n```\n';

        logger.info(`Retrieved prompt: ${params.id}`);

        return {
          content: [{
            type: 'text',
            text: markdown
          }]
        };

      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.error(`Get prompt failed: ${message}`);

        return {
          content: [{
            type: 'text',
            text: `# Get Prompt Error\n\n❌ **Error:** ${message}\n\nPlease check the prompt ID and try again.`
          }],
          isError: true
        };
      }
    }
  };
}
