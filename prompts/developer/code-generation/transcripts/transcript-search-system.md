---
title: Transcript Search and Filtering System
description: Implement comprehensive search and filtering for meeting transcripts with full-text search, facets, and advanced filters
version: 1.0.0
author: Prompt Manager MCP
created: 2026-01-18
tags:
  role: [developer]
  task-type: [code-generation]
  module: [transcripts]
  compliance: [pii-protection]
  complexity: [advanced]
  ai-agent-persona: [code-generator]
---

# Transcript Search and Filtering System

You are tasked with implementing a comprehensive search and filtering system for meeting transcripts.

## Requirements

### 1. Search Capabilities

**Full-Text Search**:
```typescript
interface SearchQuery {
  text: string;              // Search query
  fields?: string[];         // Specific fields to search
  fuzzy?: boolean;           // Enable fuzzy matching
  caseSensitive?: boolean;   // Case sensitivity
  exactPhrase?: boolean;     // Exact phrase matching
}

interface SearchResult {
  transcriptId: string;
  score: number;             // Relevance score
  matches: SearchMatch[];    // Individual matches
  snippet: string;           // Context snippet
  metadata: TranscriptMetadata;
}

interface SearchMatch {
  field: string;
  text: string;
  startTime?: number;        // For transcript content
  endTime?: number;
  highlightedText: string;   // With <mark> tags
}
```

**Search Implementation**:
```typescript
class TranscriptSearch {
  private searchEngine: ElasticsearchClient | MeiliSearch;
  
  async search(query: SearchQuery): Promise<SearchResult[]> {
    // 1. Parse query
    const parsedQuery = this.parseQuery(query.text);
    
    // 2. Build search request
    const searchRequest = {
      query: {
        multi_match: {
          query: parsedQuery,
          fields: query.fields || ['content', 'summary', 'topics'],
          fuzziness: query.fuzzy ? 'AUTO' : 0
        }
      },
      highlight: {
        fields: {
          content: {},
          summary: {}
        },
        pre_tags: ['<mark>'],
        post_tags: ['</mark>']
      }
    };
    
    // 3. Execute search
    const results = await this.searchEngine.search(searchRequest);
    
    // 4. Format results
    return this.formatResults(results);
  }
  
  private parseQuery(text: string): string {
    // Handle quoted phrases
    // Remove stop words
    // Expand synonyms
    return text;
  }
}
```

### 2. Advanced Filters

```typescript
interface TranscriptFilters {
  // Date filters
  dateRange?: {
    start: Date;
    end: Date;
  };
  
  // Participant filters
  participants?: {
    include?: string[];      // Must include these participants
    exclude?: string[];      // Must not include these
    minParticipants?: number;
    maxParticipants?: number;
  };
  
  // Duration filters
  duration?: {
    min?: number;            // Minimum duration in seconds
    max?: number;
  };
  
  // Topic filters
  topics?: string[];
  
  // Action item filters
  hasActionItems?: boolean;
  actionItemStatus?: 'pending' | 'completed' | 'overdue';
  actionItemAssignee?: string;
  
  // Decision filters
  hasDecisions?: boolean;
  
  // Sentiment filters
  sentiment?: 'positive' | 'neutral' | 'negative';
  
  // Custom metadata
  tags?: string[];
  department?: string[];
  project?: string[];
}

class TranscriptFilter {
  async filter(
    transcripts: Transcript[],
    filters: TranscriptFilters
  ): Promise<Transcript[]> {
    let results = transcripts;
    
    // Apply date filter
    if (filters.dateRange) {
      results = results.filter(t =>
        t.date >= filters.dateRange!.start &&
        t.date <= filters.dateRange!.end
      );
    }
    
    // Apply participant filters
    if (filters.participants) {
      results = this.filterByParticipants(results, filters.participants);
    }
    
    // Apply duration filter
    if (filters.duration) {
      results = results.filter(t =>
        (!filters.duration!.min || t.duration >= filters.duration!.min) &&
        (!filters.duration!.max || t.duration <= filters.duration!.max)
      );
    }
    
    // Apply topic filter
    if (filters.topics && filters.topics.length > 0) {
      results = results.filter(t =>
        filters.topics!.some(topic => t.topics.includes(topic))
      );
    }
    
    // Apply action item filters
    if (filters.hasActionItems !== undefined) {
      results = results.filter(t =>
        filters.hasActionItems
          ? t.actionItems.length > 0
          : t.actionItems.length === 0
      );
    }
    
    return results;
  }
  
  private filterByParticipants(
    transcripts: Transcript[],
    participantFilter: ParticipantFilter
  ): Transcript[] {
    return transcripts.filter(t => {
      const participants = t.participants.map(p => p.name);
      
      // Check includes
      if (participantFilter.include) {
        const hasAll = participantFilter.include.every(p =>
          participants.includes(p)
        );
        if (!hasAll) return false;
      }
      
      // Check excludes
      if (participantFilter.exclude) {
        const hasNone = !participantFilter.exclude.some(p =>
          participants.includes(p)
        );
        if (!hasNone) return false;
      }
      
      // Check count
      if (participantFilter.minParticipants &&
          participants.length < participantFilter.minParticipants) {
        return false;
      }
      
      if (participantFilter.maxParticipants &&
          participants.length > participantFilter.maxParticipants) {
        return false;
      }
      
      return true;
    });
  }
}
```

### 3. Faceted Search

```typescript
interface SearchFacets {
  dates: Array<{
    range: string;           // 'This week', 'Last month', etc.
    count: number;
  }>;
  participants: Array<{
    name: string;
    count: number;
  }>;
  topics: Array<{
    topic: string;
    count: number;
  }>;
  duration: Array<{
    range: string;           // '0-15 min', '15-30 min', etc.
    count: number;
  }>;
}

class FacetGenerator {
  generateFacets(transcripts: Transcript[]): SearchFacets {
    return {
      dates: this.generateDateFacets(transcripts),
      participants: this.generateParticipantFacets(transcripts),
      topics: this.generateTopicFacets(transcripts),
      duration: this.generateDurationFacets(transcripts)
    };
  }
}
```

### 4. Saved Searches

```typescript
interface SavedSearch {
  id: string;
  name: string;
  query: SearchQuery;
  filters: TranscriptFilters;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

class SavedSearchManager {
  async save(search: Omit<SavedSearch, 'id' | 'createdAt'>): Promise<SavedSearch> {
    // Save to database
  }
  
  async load(searchId: string): Promise<SavedSearch> {
    // Load from database
  }
  
  async list(userId: string): Promise<SavedSearch[]> {
    // List user's saved searches
  }
  
  async execute(searchId: string): Promise<SearchResult[]> {
    const search = await this.load(searchId);
    return this.searchEngine.search(search.query, search.filters);
  }
}
```

### 5. Search UI Components

```typescript
// Search bar component
<TranscriptSearch
  onSearch={(query, filters) => handleSearch(query, filters)}
  placeholder="Search transcripts..."
  suggestions={recentSearches}
/>

// Filter panel
<FilterPanel>
  <DateRangeFilter onChange={setDateRange} />
  <ParticipantFilter onChange={setParticipants} />
  <TopicFilter topics={availableTopics} onChange={setTopics} />
  <DurationFilter onChange={setDuration} />
  <TagFilter onChange={setTags} />
</FilterPanel>

// Results display
<SearchResults
  results={searchResults}
  onResultClick={openTranscript}
  highlightTerms={searchTerms}
/>

// Facets sidebar
<FacetsSidebar
  facets={facets}
  onFacetClick={applyFacetFilter}
/>
```

### 6. Performance Optimization

**Indexing Strategy**:
```typescript
// Index configuration for Elasticsearch
const indexConfig = {
  settings: {
    number_of_shards: 3,
    number_of_replicas: 2,
    analysis: {
      analyzer: {
        transcript_analyzer: {
          type: 'custom',
          tokenizer: 'standard',
          filter: ['lowercase', 'stop', 'snowball']
        }
      }
    }
  },
  mappings: {
    properties: {
      content: {
        type: 'text',
        analyzer: 'transcript_analyzer',
        term_vector: 'with_positions_offsets'
      },
      participants: {
        type: 'keyword'
      },
      topics: {
        type: 'keyword'
      },
      date: {
        type: 'date'
      },
      duration: {
        type: 'integer'
      }
    }
  }
};
```

**Caching**:
```typescript
class SearchCache {
  private cache = new LRUCache<string, SearchResult[]>({ max: 1000 });
  
  async search(query: string, filters: Filters): Promise<SearchResult[]> {
    const cacheKey = this.generateKey(query, filters);
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }
    
    const results = await this.executeSearch(query, filters);
    this.cache.set(cacheKey, results);
    
    return results;
  }
}
```

## Deliverables

1. Search and filter implementation
2. Elasticsearch/MeiliSearch configuration
3. UI components for search interface
4. Performance benchmarks
5. Documentation and usage examples
