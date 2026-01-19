/**
 * Prompt Service - Business logic for prompt operations
 */

import { randomUUID } from 'crypto';
import { 
  Prompt, 
  PromptMetadata, 
  SearchCriteria, 
  SearchResult, 
  ListOptions,
  AddPromptParams,
  UpdatePromptParams,
  NotFoundError
} from '../models/types.js';
import { FileManager } from './file-manager.js';
import { 
  buildPromptFilePath, 
  buildMetadataFilePath,
  getPromptsBasePath 
} from '../helpers/path-builder.js';
import { validateCombination, validateTags, normalizeKeywords } from '../helpers/validators.js';
import { createLogger } from '../helpers/logger.js';

const logger = createLogger('prompt-service');

/**
 * In-memory index for fast searching
 */
interface PromptIndex {
  metadata: PromptMetadata;
  filePath: string;
}

export class PromptService {
  private fileManager: FileManager;
  private index: Map<string, PromptIndex>;
  private indexBuilt: boolean;

  constructor() {
    this.fileManager = new FileManager();
    this.index = new Map();
    this.indexBuilt = false;
  }

  /**
   * Initialize the service by building the index
   */
  async initialize(): Promise<void> {
    await this.rebuildIndex();
  }

  /**
   * Generate a new UUID for a prompt
   */
  generatePromptId(): string {
    return randomUUID();
  }

  /**
   * Add a new prompt
   */
  async addPrompt(params: AddPromptParams): Promise<Prompt> {
    try {
      // Validate role/task type combination
      validateCombination(params.role, params.taskType);

      // Generate ID and timestamps
      const id = this.generatePromptId();
      const now = new Date().toISOString();

      // Create metadata
      const metadata: PromptMetadata = {
        id,
        name: params.name,
        description: params.description,
        role: params.role,
        taskType: params.taskType,
        module: params.module,
        tags: validateTags(params.tags),
        createdAt: now,
        updatedAt: now,
        version: 1
      };

      // Build file paths
      const contentPath = buildPromptFilePath(params.role, params.taskType, params.module, id);
      const metadataPath = buildMetadataFilePath(params.role, params.taskType, params.module, id);

      // Write files
      await this.fileManager.writePromptContent(contentPath, params.content);
      await this.fileManager.writeMetadata(metadataPath, metadata);

      // Add to index
      this.index.set(id, { metadata, filePath: contentPath });

      logger.info(`Added new prompt: ${id} (${params.name})`);

      return {
        metadata,
        content: params.content,
        filePath: contentPath
      };
    } catch (error) {
      logger.error(`Failed to add prompt: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Get a prompt by ID
   */
  async getPrompt(id: string): Promise<Prompt> {
    try {
      // Ensure index is built
      if (!this.indexBuilt) {
        await this.rebuildIndex();
      }

      // Find in index
      const indexEntry = this.index.get(id);
      if (!indexEntry) {
        throw new NotFoundError(`Prompt not found: ${id}`);
      }

      // Read content
      const content = await this.fileManager.readPromptContent(indexEntry.filePath);

      logger.debug(`Retrieved prompt: ${id}`);

      return {
        metadata: indexEntry.metadata,
        content,
        filePath: indexEntry.filePath
      };
    } catch (error) {
      logger.error(`Failed to get prompt ${id}: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Update an existing prompt
   */
  async updatePrompt(params: UpdatePromptParams): Promise<Prompt> {
    try {
      // Get existing prompt
      const existing = await this.getPrompt(params.id);

      // Check if hierarchy changed
      const hierarchyChanged = 
        (params.role && params.role !== existing.metadata.role) ||
        (params.taskType && params.taskType !== existing.metadata.taskType) ||
        (params.module && params.module !== existing.metadata.module);

      // New values (use existing if not provided)
      const newRole = params.role || existing.metadata.role;
      const newTaskType = params.taskType || existing.metadata.taskType;
      const newModule = params.module || existing.metadata.module;

      // Validate new combination
      validateCombination(newRole, newTaskType);

      // Update metadata
      const updatedMetadata: PromptMetadata = {
        ...existing.metadata,
        name: params.name || existing.metadata.name,
        description: params.description || existing.metadata.description,
        role: newRole,
        taskType: newTaskType,
        module: newModule,
        tags: params.tags ? validateTags(params.tags) : existing.metadata.tags,
        updatedAt: new Date().toISOString(),
        version: existing.metadata.version + 1
      };

      // Update content
      const updatedContent = params.content || existing.content;

      // Calculate new paths
      const newContentPath = buildPromptFilePath(newRole, newTaskType, newModule, params.id);
      const newMetadataPath = buildMetadataFilePath(newRole, newTaskType, newModule, params.id);

      if (hierarchyChanged) {
        // Move files to new location
        await this.fileManager.moveFile(existing.filePath, newContentPath);
        
        const oldMetadataPath = buildMetadataFilePath(
          existing.metadata.role,
          existing.metadata.taskType,
          existing.metadata.module,
          params.id
        );
        await this.fileManager.moveFile(oldMetadataPath, newMetadataPath);

        logger.info(`Moved prompt ${params.id} due to hierarchy change`);
      }

      // Write updated files
      await this.fileManager.writePromptContent(newContentPath, updatedContent);
      await this.fileManager.writeMetadata(newMetadataPath, updatedMetadata);

      // Update index
      this.index.set(params.id, { metadata: updatedMetadata, filePath: newContentPath });

      logger.info(`Updated prompt: ${params.id}`);

      return {
        metadata: updatedMetadata,
        content: updatedContent,
        filePath: newContentPath
      };
    } catch (error) {
      logger.error(`Failed to update prompt ${params.id}: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Delete a prompt
   */
  async deletePrompt(id: string): Promise<void> {
    try {
      // Get existing prompt
      const existing = await this.getPrompt(id);

      // Build paths
      const contentPath = existing.filePath;
      const metadataPath = buildMetadataFilePath(
        existing.metadata.role,
        existing.metadata.taskType,
        existing.metadata.module,
        id
      );

      // Delete files
      await this.fileManager.deleteFile(contentPath);
      await this.fileManager.deleteFile(metadataPath);

      // Remove from index
      this.index.delete(id);

      logger.info(`Deleted prompt: ${id}`);
    } catch (error) {
      logger.error(`Failed to delete prompt ${id}: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Search prompts with relevance scoring
   */
  async searchPrompts(criteria: SearchCriteria): Promise<SearchResult[]> {
    try {
      // Ensure index is built
      if (!this.indexBuilt) {
        await this.rebuildIndex();
      }

      const results: SearchResult[] = [];
      const keywordsList = criteria.keywords ? normalizeKeywords(criteria.keywords) : [];

      for (const [id, indexEntry] of this.index) {
        const metadata = indexEntry.metadata;
        let score = 0;
        const matches: { field: string; snippet?: string }[] = [];

        // Exact role match
        if (criteria.role && metadata.role === criteria.role) {
          score += 10;
          matches.push({ field: 'role' });
        } else if (criteria.role) {
          continue; // Skip if role doesn't match
        }

        // Exact task type match
        if (criteria.taskType && metadata.taskType === criteria.taskType) {
          score += 10;
          matches.push({ field: 'taskType' });
        } else if (criteria.taskType) {
          continue; // Skip if task type doesn't match
        }

        // Exact module match
        if (criteria.module && metadata.module === criteria.module) {
          score += 10;
          matches.push({ field: 'module' });
        } else if (criteria.module) {
          continue; // Skip if module doesn't match
        }

        // Tag matching
        if (criteria.tags && criteria.tags.length > 0) {
          const matchingTags = metadata.tags.filter(tag => 
            criteria.tags!.some(searchTag => searchTag.toLowerCase() === tag.toLowerCase())
          );
          if (matchingTags.length > 0) {
            score += matchingTags.length * 5;
            matches.push({ field: 'tags', snippet: matchingTags.join(', ') });
          }
        }

        // Keyword search in name and description
        if (keywordsList.length > 0) {
          const nameLower = metadata.name.toLowerCase();
          const descLower = metadata.description.toLowerCase();

          for (const keyword of keywordsList) {
            if (nameLower.includes(keyword)) {
              score += 15;
              matches.push({ field: 'name', snippet: metadata.name });
              break;
            }
          }

          for (const keyword of keywordsList) {
            if (descLower.includes(keyword)) {
              score += 5;
              matches.push({ field: 'description', snippet: metadata.description.substring(0, 100) + '...' });
              break;
            }
          }
        }

        // Add to results if there's a match
        if (score > 0 || (!criteria.role && !criteria.taskType && !criteria.module && keywordsList.length === 0)) {
          // Load full prompt content
          const prompt = await this.getPrompt(id);
          results.push({ prompt, score, matches });
        }
      }

      // Sort by relevance score (descending)
      results.sort((a, b) => b.score - a.score);

      // Limit results
      const maxResults = criteria.maxResults || 20;
      const limitedResults = results.slice(0, maxResults);

      logger.info(`Search completed: ${limitedResults.length} results found`);

      return limitedResults;
    } catch (error) {
      logger.error(`Failed to search prompts: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * List prompts with optional filtering
   */
  async listPrompts(options: ListOptions = {}): Promise<Prompt[]> {
    try {
      // Ensure index is built
      if (!this.indexBuilt) {
        await this.rebuildIndex();
      }

      const results: Prompt[] = [];

      for (const [id, indexEntry] of this.index) {
        const metadata = indexEntry.metadata;

        // Apply filters
        if (options.role && metadata.role !== options.role) continue;
        if (options.taskType && metadata.taskType !== options.taskType) continue;
        if (options.module && metadata.module !== options.module) continue;

        // Load full prompt
        const prompt = await this.getPrompt(id);
        results.push(prompt);
      }

      logger.info(`List completed: ${results.length} prompts found`);

      return results;
    } catch (error) {
      logger.error(`Failed to list prompts: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Rebuild the search index
   */
  private async rebuildIndex(): Promise<void> {
    try {
      logger.info('Building search index...');

      this.index.clear();
      const basePath = getPromptsBasePath();

      // Find all metadata files
      const metadataFiles = await this.fileManager.findFiles(basePath, /\.metadata\.json$/);

      for (const metadataPath of metadataFiles) {
        try {
          const metadata = await this.fileManager.readMetadata(metadataPath);
          const contentPath = metadataPath.replace('.metadata.json', '.md');

          this.index.set(metadata.id, { metadata, filePath: contentPath });
        } catch (error) {
          logger.warn(`Failed to index ${metadataPath}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }

      this.indexBuilt = true;
      logger.info(`Search index built: ${this.index.size} prompts indexed`);
    } catch (error) {
      logger.error(`Failed to rebuild index: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Get index statistics
   */
  getIndexStats(): { totalPrompts: number; indexBuilt: boolean } {
    return {
      totalPrompts: this.index.size,
      indexBuilt: this.indexBuilt
    };
  }
}
