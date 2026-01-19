/**
 * File Manager Service - Handles file I/O operations for prompts
 */

import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { PromptMetadata, FileSystemError } from '../models/types.js';
import { createLogger } from '../helpers/logger.js';

const logger = createLogger('file-manager');

export class FileManager {
  /**
   * Ensure a directory exists, create it if it doesn't
   */
  async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.mkdir(dirPath, { recursive: true });
      logger.debug(`Directory ensured: ${dirPath}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to create directory ${dirPath}: ${message}`);
      throw new FileSystemError(`Failed to create directory: ${message}`);
    }
  }

  /**
   * Read prompt content from file
   */
  async readPromptContent(filePath: string): Promise<string> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      logger.debug(`Read prompt content from: ${filePath}`);
      return content;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to read prompt content from ${filePath}: ${message}`);
      throw new FileSystemError(`Failed to read prompt content: ${message}`);
    }
  }

  /**
   * Write prompt content to file
   */
  async writePromptContent(filePath: string, content: string): Promise<void> {
    try {
      const dirPath = path.dirname(filePath);
      await this.ensureDirectoryExists(dirPath);
      await fs.writeFile(filePath, content, 'utf-8');
      logger.debug(`Wrote prompt content to: ${filePath}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to write prompt content to ${filePath}: ${message}`);
      throw new FileSystemError(`Failed to write prompt content: ${message}`);
    }
  }

  /**
   * Read metadata from JSON file and merge with YAML frontmatter tags
   */
  async readMetadata(filePath: string): Promise<PromptMetadata> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const metadata = JSON.parse(content) as PromptMetadata;
      
      // Try to read YAML frontmatter tags from corresponding .md file
      const mdFilePath = filePath.replace('.metadata.json', '.md');
      try {
        const yamlTags = await this.readYamlFrontmatter(mdFilePath);
        if (yamlTags) {
          // Merge YAML frontmatter tags into metadata
          metadata.yamlTags = yamlTags;
        }
      } catch (error) {
        // If no frontmatter exists, that's okay - just use JSON metadata
        logger.debug(`No YAML frontmatter found for ${mdFilePath}`);
      }
      
      logger.debug(`Read metadata from: ${filePath}`);
      return metadata;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to read metadata from ${filePath}: ${message}`);
      throw new FileSystemError(`Failed to read metadata: ${message}`);
    }
  }

  /**
   * Parse YAML frontmatter from markdown file
   */
  async readYamlFrontmatter(filePath: string): Promise<any> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const parsed = matter(content);
      
      if (parsed.data && Object.keys(parsed.data).length > 0) {
        logger.debug(`Parsed YAML frontmatter from: ${filePath}`);
        return parsed.data;
      }
      
      return null;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.debug(`No frontmatter in ${filePath}: ${message}`);
      return null;
    }
  }

  /**
   * Write metadata to JSON file
   */
  async writeMetadata(filePath: string, metadata: PromptMetadata): Promise<void> {
    try {
      const dirPath = path.dirname(filePath);
      await this.ensureDirectoryExists(dirPath);
      const content = JSON.stringify(metadata, null, 2);
      await fs.writeFile(filePath, content, 'utf-8');
      logger.debug(`Wrote metadata to: ${filePath}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to write metadata to ${filePath}: ${message}`);
      throw new FileSystemError(`Failed to write metadata: ${message}`);
    }
  }

  /**
   * Check if a file exists
   */
  async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Delete a file
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
      logger.debug(`Deleted file: ${filePath}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to delete file ${filePath}: ${message}`);
      throw new FileSystemError(`Failed to delete file: ${message}`);
    }
  }

  /**
   * List all files in a directory (non-recursive)
   */
  async listFiles(dirPath: string): Promise<string[]> {
    try {
      const exists = await this.fileExists(dirPath);
      if (!exists) {
        return [];
      }

      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      return entries
        .filter(entry => entry.isFile())
        .map(entry => path.join(dirPath, entry.name));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to list files in ${dirPath}: ${message}`);
      throw new FileSystemError(`Failed to list files: ${message}`);
    }
  }

  /**
   * List all directories in a directory
   */
  async listDirectories(dirPath: string): Promise<string[]> {
    try {
      const exists = await this.fileExists(dirPath);
      if (!exists) {
        return [];
      }

      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      return entries
        .filter(entry => entry.isDirectory())
        .map(entry => path.join(dirPath, entry.name));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to list directories in ${dirPath}: ${message}`);
      throw new FileSystemError(`Failed to list directories: ${message}`);
    }
  }

  /**
   * Recursively find all files matching a pattern
   */
  async findFiles(dirPath: string, pattern: RegExp): Promise<string[]> {
    const results: string[] = [];

    try {
      const exists = await this.fileExists(dirPath);
      if (!exists) {
        return results;
      }

      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
          const subResults = await this.findFiles(fullPath, pattern);
          results.push(...subResults);
        } else if (entry.isFile() && pattern.test(entry.name)) {
          results.push(fullPath);
        }
      }

      return results;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to find files in ${dirPath}: ${message}`);
      throw new FileSystemError(`Failed to find files: ${message}`);
    }
  }

  /**
   * Move a file from one location to another
   */
  async moveFile(oldPath: string, newPath: string): Promise<void> {
    try {
      const newDir = path.dirname(newPath);
      await this.ensureDirectoryExists(newDir);
      await fs.rename(oldPath, newPath);
      logger.debug(`Moved file from ${oldPath} to ${newPath}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to move file from ${oldPath} to ${newPath}: ${message}`);
      throw new FileSystemError(`Failed to move file: ${message}`);
    }
  }
}
