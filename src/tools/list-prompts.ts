/**
 * List Prompts Tool - Browse prompts hierarchically
 */

import { ToolResponse } from '../models/types.js';
import { listOptionsSchema } from '../models/schemas.js';
import { PromptService } from '../services/prompt-service.js';
import { createLogger } from '../helpers/logger.js';

const logger = createLogger('list-prompts-tool');

export function registerListPromptsTool(promptService: PromptService) {
  return {
    name: 'list-prompts',
    description: 'List prompts with optional filtering by role, task type, or module. Supports tree, table, and detailed formats.',
    inputSchema: listOptionsSchema,
    handler: async (args: unknown): Promise<ToolResponse> => {
      try {
        // Validate input
        const options = listOptionsSchema.parse(args);

        logger.info('Listing prompts with options:', options);

        // Execute list
        const prompts = await promptService.listPrompts(options);

        // Format based on requested format
        const format = options.format || 'tree';
        let markdown = '';

        switch (format) {
          case 'tree':
            markdown = formatTreeView(prompts, options);
            break;
          case 'table':
            markdown = formatTableView(prompts, options);
            break;
          case 'detailed':
            markdown = formatDetailedView(prompts, options);
            break;
          default:
            markdown = formatTreeView(prompts, options);
        }

        logger.info(`List completed: ${prompts.length} prompts returned in ${format} format`);

        return {
          content: [{
            type: 'text',
            text: markdown
          }]
        };

      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.error(`List failed: ${message}`);

        return {
          content: [{
            type: 'text',
            text: `# List Error\n\n❌ **Error:** ${message}\n\nPlease check your filter options and try again.`
          }],
          isError: true
        };
      }
    }
  };
}

/**
 * Format prompts in tree view
 */
function formatTreeView(prompts: any[], options: any): string {
  let markdown = '# Prompt Library\n\n';
  
  if (prompts.length === 0) {
    markdown += 'No prompts found';
    if (options.role || options.taskType || options.module) {
      markdown += ' matching the specified filters';
    }
    markdown += '.\n';
    return markdown;
  }

  markdown += `**Total Prompts:** ${prompts.length}\n\n`;

  // Add filter info
  if (options.role || options.taskType || options.module) {
    markdown += '**Filters:**\n';
    if (options.role) markdown += `- Role: ${options.role}\n`;
    if (options.taskType) markdown += `- Task Type: ${options.taskType}\n`;
    if (options.module) markdown += `- Module: ${options.module}\n`;
    markdown += '\n';
  }

  // Group by hierarchy
  const hierarchy: any = {};

  for (const prompt of prompts) {
    const { role, taskType, module } = prompt.metadata;

    if (!hierarchy[role]) hierarchy[role] = {};
    if (!hierarchy[role][taskType]) hierarchy[role][taskType] = {};
    if (!hierarchy[role][taskType][module]) hierarchy[role][taskType][module] = [];

    hierarchy[role][taskType][module].push(prompt);
  }

  // Build tree
  markdown += '```\n';
  for (const [role, taskTypes] of Object.entries(hierarchy)) {
    markdown += `📁 ${role}/\n`;
    for (const [taskType, modules] of Object.entries(taskTypes as any)) {
      markdown += `  📁 ${taskType}/\n`;
      for (const [module, modulePrompts] of Object.entries(modules as any)) {
        markdown += `    📁 ${module}/\n`;
        for (const prompt of modulePrompts as any[]) {
          markdown += `      📄 ${prompt.metadata.name} [${prompt.metadata.id}]\n`;
        }
      }
    }
  }
  markdown += '```\n';

  return markdown;
}

/**
 * Format prompts in table view
 */
function formatTableView(prompts: any[], options: any): string {
  let markdown = '# Prompt Library\n\n';

  if (prompts.length === 0) {
    markdown += 'No prompts found';
    if (options.role || options.taskType || options.module) {
      markdown += ' matching the specified filters';
    }
    markdown += '.\n';
    return markdown;
  }

  markdown += `**Total Prompts:** ${prompts.length}\n\n`;

  // Add filter info
  if (options.role || options.taskType || options.module) {
    markdown += '**Filters:**\n';
    if (options.role) markdown += `- Role: ${options.role}\n`;
    if (options.taskType) markdown += `- Task Type: ${options.taskType}\n`;
    if (options.module) markdown += `- Module: ${options.module}\n`;
    markdown += '\n';
  }

  // Create table
  markdown += '| ID | Name | Role | Task Type | Module | Compliance | Complexity | Version |\n';
  markdown += '|----|------|------|-----------|--------|------------|------------|---------|\n';

  for (const prompt of prompts) {
    const { metadata } = prompt;
    
    // Extract YAML tag details
    const compliance = metadata.yamlTags?.tags?.compliance?.join(', ') || 'none';
    const complexity = metadata.yamlTags?.tags?.complexity?.[0] || 'n/a';

    markdown += `| \`${metadata.id}\` | ${metadata.name} | ${metadata.role} | ${metadata.taskType} | ${metadata.module} | ${compliance} | ${complexity} | ${metadata.version} |\n`;
  }

  markdown += '\n';

  return markdown;
}

/**
 * Format prompts in detailed view
 */
function formatDetailedView(prompts: any[], options: any): string {
  let markdown = '# Prompt Library - Detailed View\n\n';

  if (prompts.length === 0) {
    markdown += 'No prompts found';
    if (options.role || options.taskType || options.module) {
      markdown += ' matching the specified filters';
    }
    markdown += '.\n';
    return markdown;
  }

  markdown += `**Total Prompts:** ${prompts.length}\n\n`;

  // Add filter info
  if (options.role || options.taskType || options.module) {
    markdown += '**Filters:**\n';
    if (options.role) markdown += `- Role: ${options.role}\n`;
    if (options.taskType) markdown += `- Task Type: ${options.taskType}\n`;
    if (options.module) markdown += `- Module: ${options.module}\n`;
    markdown += '\n---\n\n';
  }

  // Add each prompt
  for (let i = 0; i < prompts.length; i++) {
    const prompt = prompts[i];
    const { metadata } = prompt;

    markdown += `## ${i + 1}. ${metadata.name}\n\n`;
    markdown += `**Metadata:**\n`;
    markdown += `- **ID:** \`${metadata.id}\`\n`;
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

    // Add content preview
    const preview = prompt.content.substring(0, 300).trim();
    markdown += `**Content Preview:**\n\`\`\`\n${preview}${prompt.content.length > 300 ? '...' : ''}\n\`\`\`\n\n`;

    if (i < prompts.length - 1) {
      markdown += '---\n\n';
    }
  }

  return markdown;
}
