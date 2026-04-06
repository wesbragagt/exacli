import { describe, test, expect } from 'bun:test';
import {
  formatSearchResults,
  formatAnswerResponse,
  formatResearchTask,
  formatError,
  formatSuccess,
} from '../src/formatters/markdown.js';

describe('formatSearchResults', () => {
  const mockSearchResponse = {
    requestId: 'test-123',
    costDollars: { total: 0.05 },
    results: [
      {
        title: 'Test Result',
        url: 'https://example.com',
        id: 'https://example.com',
        publishedDate: '2024-01-15',
        author: 'Test Author',
        score: 0.95,
        text: 'This is the content',
        highlights: ['highlight 1', 'highlight 2'],
        highlightScores: [0.9, 0.8],
        summary: 'This is a summary',
      },
    ],
  };

  test('formats search results in markdown', () => {
    const output = formatSearchResults(mockSearchResponse);
    expect(output).toContain('# Search Results');
    expect(output).toContain('Test Result');
    expect(output).toContain('https://example.com');
    expect(output).toContain('test-123');
    expect(output).toContain('$0.0500');
    expect(output).toContain('Test Author');
    expect(output).toContain('0.950');
    expect(output).toContain('This is the content');
    expect(output).toContain('highlight 1');
    expect(output).toContain('This is a summary');
  });

  test('returns JSON when json option is true', () => {
    const output = formatSearchResults(mockSearchResponse, { json: true });
    expect(() => JSON.parse(output)).not.toThrow();
    const parsed = JSON.parse(output);
    expect(parsed.requestId).toBe('test-123');
  });

  test('handles empty results', () => {
    const emptyResponse = { requestId: 'test-456', results: [] };
    const output = formatSearchResults(emptyResponse);
    expect(output).toContain('No results found');
  });

  test('handles results without optional fields', () => {
    const minimalResponse = {
      results: [
        {
          title: null,
          url: 'https://example.com',
          id: 'https://example.com',
        },
      ],
    };
    const output = formatSearchResults(minimalResponse);
    expect(output).toContain('Untitled');
  });
});

describe('formatAnswerResponse', () => {
  const mockAnswerResponse = {
    requestId: 'answer-123',
    costDollars: { total: 0.02 },
    answer: 'This is the answer',
    citations: [
      { title: 'Source 1', url: 'https://source1.com' },
      { title: null, url: 'https://source2.com' },
    ],
  };

  test('formats answer in markdown', () => {
    const output = formatAnswerResponse(mockAnswerResponse);
    expect(output).toContain('# Answer');
    expect(output).toContain('This is the answer');
    expect(output).toContain('answer-123');
    expect(output).toContain('$0.0200');
    expect(output).toContain('Source 1');
    expect(output).toContain('Untitled');
  });

  test('formats object answers as JSON', () => {
    const objectResponse = {
      answer: { key: 'value', number: 42 },
      citations: [],
    };
    const output = formatAnswerResponse(objectResponse);
    expect(output).toContain('```json');
    expect(output).toContain('"key": "value"');
  });

  test('returns JSON when json option is true', () => {
    const output = formatAnswerResponse(mockAnswerResponse, { json: true });
    const parsed = JSON.parse(output);
    expect(parsed.answer).toBe('This is the answer');
  });
});

describe('formatResearchTask', () => {
  const mockTask = {
    researchId: 'task-123',
    status: 'completed',
    instructions: 'Research something',
    output: {
      parsed: { result: 'value' },
      content: 'Raw output content',
    },
    events: [
      {
        createdAt: 1705315200000,
        eventType: 'research-start',
        message: 'Started research',
      },
    ],
  };

  test('formats research task in markdown', () => {
    const output = formatResearchTask(mockTask);
    expect(output).toContain('# Research Task');
    expect(output).toContain('task-123');
    expect(output).toContain('completed');
    expect(output).toContain('Research something');
    expect(output).toContain('"result": "value"');
    expect(output).toContain('Raw output content');
    expect(output).toContain('research-start');
  });

  test('handles tasks without output or events', () => {
    const minimalTask = {
      researchId: 'task-456',
      status: 'pending',
    };
    const output = formatResearchTask(minimalTask);
    expect(output).toContain('task-456');
    expect(output).toContain('pending');
    expect(output).not.toContain('## Output');
    expect(output).not.toContain('## Events');
  });

  test('returns JSON when json option is true', () => {
    const output = formatResearchTask(mockTask, { json: true });
    const parsed = JSON.parse(output);
    expect(parsed.researchId).toBe('task-123');
  });
});

describe('formatError', () => {
  test('formats Error instances', () => {
    const error = new Error('Something went wrong');
    expect(formatError(error)).toBe('Error: Something went wrong');
  });

  test('formats non-Error values', () => {
    expect(formatError('string error')).toBe('Error: string error');
    expect(formatError(42)).toBe('Error: 42');
    expect(formatError(null)).toBe('Error: null');
    expect(formatError(undefined)).toBe('Error: undefined');
  });
});

describe('formatSuccess', () => {
  test('formats success messages', () => {
    expect(formatSuccess('Task completed')).toBe('[OK] Task completed');
    expect(formatSuccess('Operation successful')).toBe(
      '[OK] Operation successful'
    );
  });
});
