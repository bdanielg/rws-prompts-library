#!/usr/bin/env node
/**
 * Prompt Manager MCP Server
 * Main entry point for the MCP server
 */

import { FastMCP } from 'fastmcp';
import { PromptService } from './services/prompt-service.js';
import { registerSearchPromptsTool } from './tools/search-prompts.js';
import { registerListPromptsTool } from './tools/list-prompts.js';
import { registerGetPromptTool } from './tools/get-prompt.js';
import { registerAddPromptTool } from './tools/add-prompt.js';
import { registerUpdatePromptTool } from './tools/update-prompt.js';
import { createStartupLogger } from './helpers/logger.js';

const logger = createStartupLogger();

/**
 * Initialize and start the MCP server
 */
async function main() {
  try {
    logger.info('Starting Prompt Manager MCP Server...');

    // Initialize prompt service
    const promptService = new PromptService();
    await promptService.initialize();
    logger.info('Prompt service initialized');

    // Create FastMCP server
    const server = new FastMCP({
      name: 'prompt-manager',
      version: '1.0.0'
    });

    logger.info('FastMCP server created');

    // Register tools
    const searchTool = registerSearchPromptsTool(promptService);
    server.addTool({
      name: searchTool.name,
      description: searchTool.description,
      parameters: searchTool.inputSchema,
      execute: searchTool.handler
    });
    logger.info('Registered tool: search-prompts');

    const listTool = registerListPromptsTool(promptService);
    server.addTool({
      name: listTool.name,
      description: listTool.description,
      parameters: listTool.inputSchema,
      execute: listTool.handler
    });
    logger.info('Registered tool: list-prompts');

    const getTool = registerGetPromptTool(promptService);
    server.addTool({
      name: getTool.name,
      description: getTool.description,
      parameters: getTool.inputSchema,
      execute: getTool.handler
    });
    logger.info('Registered tool: get-prompt');

    const addTool = registerAddPromptTool(promptService);
    server.addTool({
      name: addTool.name,
      description: addTool.description,
      parameters: addTool.inputSchema,
      execute: addTool.handler
    });
    logger.info('Registered tool: add-prompt');

    const updateTool = registerUpdatePromptTool(promptService);
    server.addTool({
      name: updateTool.name,
      description: updateTool.description,
      parameters: updateTool.inputSchema,
      execute: updateTool.handler
    });
    logger.info('Registered tool: update-prompt');

    // Determine transport type from environment
    const transportType = process.env.TRANSPORT_TYPE || 'stdio';

    // Start server with appropriate transport
    if (transportType === 'httpStream') {
      const host = process.env.HOST || '0.0.0.0';
      const port = parseInt(process.env.PORT || '3000', 10);

      await server.start({
        transportType: 'httpStream',
        httpStream: {
          host,
          port,
          endpoint: '/',
          stateless: false
        }
      });

      logger.info(`Server started with HTTP Stream transport on ${host}:${port}`);
    } else {
      // Default to stdio
      await server.start({
        transportType: 'stdio'
      });

      logger.info('Server started with stdio transport');
    }

    logger.info('Prompt Manager MCP Server is ready');

    // Log server statistics
    const stats = promptService.getIndexStats();
    logger.info(`Index statistics: ${stats.totalPrompts} prompts indexed, index built: ${stats.indexBuilt}`);

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to start server: ${message}`);
    
    if (error instanceof Error && error.stack) {
      logger.error(`Stack trace: ${error.stack}`);
    }

    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  logger.info('Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

// Start the server
main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  logger.error(`Unhandled error in main: ${message}`);
  process.exit(1);
});
