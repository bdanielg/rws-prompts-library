/**
 * Search Prompts Tool - Find prompts by various criteria
 */

import { ToolResponse } from '../models/types.js';
import { searchCriteriaSchema } from '../models/schemas.js';
import { PromptService } from '../services/prompt-service.js';
import { createLogger } from '../helpers/logger.js';

const logger = createLogger('search-prompts-tool');

export function registerSearchPromptsTool(promptService: PromptService) {
  return {
    name: 'search-prompts',
    description: 'Search for prompts by role, task type, module, keywords, or tags with relevance scoring',
    inputSchema: searchCriteriaSchema,
    handler: async (args: unknown): Promise<ToolResponse> => {
      try {
        // Validate input
        const criteria = searchCriteriaSchema.parse(args);

        logger.info('Searching prompts with criteria:', criteria);

        // Execute search
        const results = await promptService.searchPrompts(criteria);

        // Format results
        if (results.length === 0) {
          return {
            content: [{
              type: 'text',
              text: '# Search Results\n\nNo prompts found matching your criteria.\n\n**Search Criteria:**\n' +
                (criteria.role ? `- **Role:** ${criteria.role}\n` : '') +
                (criteria.taskType ? `- **Task Type:** ${criteria.taskType}\n` : '') +
                (criteria.module ? `- **Module:** ${criteria.module}\n` : '') +
                (criteria.keywords ? `- **Keywords:** ${criteria.keywords}\n` : '') +
                (criteria.tags ? `- **Tags:** ${criteria.tags.join(', ')}\n` : '')
            }]
          };
        }

        // Build markdown response
        let markdown = '# Search Results\n\n';
        markdown += `Found **${results.length}** matching prompt${results.length > 1 ? 's' : ''}.\n\n`;

        // Add search criteria
        markdown += '**Search Criteria:**\n';
        if (criteria.role) markdown += `- **Role:** ${criteria.role}\n`;
        if (criteria.taskType) markdown += `- **Task Type:** ${criteria.taskType}\n`;
        if (criteria.module) markdown += `- **Module:** ${criteria.module}\n`;
        if (criteria.keywords) markdown += `- **Keywords:** ${criteria.keywords}\n`;
        if (criteria.tags) markdown += `- **Tags:** ${criteria.tags.join(', ')}\n`;
        markdown += '\n---\n\n';

        // Add each result
        for (let i = 0; i < results.length; i++) {
          const result = results[i];
          const { prompt, score, matches } = result;
          const { metadata } = prompt;

          markdown += `## ${i + 1}. ${metadata.name}\n\n`;
          markdown += `**Relevance Score:** ${score}\n\n`;
          markdown += `**Details:**\n`;
          markdown += `- **ID:** \`${metadata.id}\`\n`;
          markdown += `- **Role:** ${metadata.role}\n`;
          markdown += `- **Task Type:** ${metadata.taskType}\n`;
          markdown += `- **Module:** ${metadata.module}\n`;
          markdown += `- **Tags:** ${metadata.tags.join(', ')}\n`;
          markdown += `- **Version:** ${metadata.version}\n`;
          markdown += `- **Updated:** ${new Date(metadata.updatedAt).toLocaleString()}\n\n`;
          
          // Add YAML frontmatter tags if available
          if (metadata.yamlTags?.tags) {
            markdown += `**Tags (from YAML frontmatter):**\n`;
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
          
          markdown += `**Description:**\n${metadata.description}\n\n`;

          // Add matching information
          if (matches.length > 0) {
            markdown += `**Matches:**\n`;
            for (const match of matches) {
              if (match.snippet) {
                markdown += `- **${match.field}:** ${match.snippet}\n`;
              } else {
                markdown += `- **${match.field}**\n`;
              }
            }
            markdown += '\n';
          }

          // Add content preview (first 200 characters)
          const preview = prompt.content.substring(0, 200).trim();
          markdown += `**Content Preview:**\n\`\`\`\n${preview}${prompt.content.length > 200 ? '...' : ''}\n\`\`\`\n\n`;

          if (i < results.length - 1) {
            markdown += '---\n\n';
          }
        }

        logger.info(`Search completed: ${results.length} results returned`);

        return {
          content: [{
            type: 'text',
            text: markdown
          }]
        };

      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.error(`Search failed: ${message}`);

        return {
          content: [{
            type: 'text',
            text: `# Search Error\n\n❌ **Error:** ${message}\n\nPlease check your search criteria and try again.`
          }],
          isError: true
        };
      }
    }
  };
}
