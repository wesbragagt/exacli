import { describe, test, expect, beforeEach, mock } from 'bun:test';
import { createClient } from '../src/client.js';
import * as search from '../src/commands/search.js';
import * as contents from '../src/commands/contents.js';
import * as similar from '../src/commands/similar.js';
import * as answer from '../src/commands/answer.js';
import * as research from '../src/commands/research.js';

describe('search command', () => {
  const mockClient = {
    search: mock(() => ({ results: [] })),
    searchAndContents: mock(() => ({ results: [] })),
  };

  test('calls search with numResults option', async () => {
    const originalExit = process.exit;
    process.exit = mock(() => {}) as any;

    await search.search(mockClient as any, 'test query', {
      'num-results': '10',
      text: false,
      highlights: false,
      summary: false,
    });

    process.exit = originalExit;
    expect(mockClient.search).toHaveBeenCalled();
  });

  test('calls searchAndContents when content options are present', async () => {
    const originalExit = process.exit;
    process.exit = mock(() => {}) as any;

    await search.search(mockClient as any, 'test query', {
      text: true,
      highlights: false,
      summary: false,
    });

    process.exit = originalExit;
    expect(mockClient.searchAndContents).toHaveBeenCalled();
  });

  test('handles include-domains and exclude-domains', async () => {
    const originalExit = process.exit;
    process.exit = mock(() => {}) as any;

    await search.search(mockClient as any, 'test query', {
      'include-domains': 'example.com,test.com',
      'exclude-domains': 'spam.com',
      text: false,
      highlights: false,
      summary: false,
    });

    process.exit = originalExit;
    expect(mockClient.search).toHaveBeenCalled();
  });
});

describe('contents command', () => {
  test('validates URLs before processing', async () => {
    const mockClient = { getContents: mock(() => ({ results: [] })) };

    const originalExit = process.exit;
    process.exit = mock(() => {}) as any;

    await contents.contents(mockClient as any, ['https://example.com'], {});

    process.exit = originalExit;
    expect(mockClient.getContents).toHaveBeenCalled();
  });

  test('rejects invalid URLs', async () => {
    const mockClient = { getContents: mock(() => ({ results: [] })) };

    const originalExit = process.exit;
    const exitMock = mock(() => {
      throw new Error('process.exit called');
    }) as any;
    process.exit = exitMock;

    await expect(
      contents.contents(mockClient as any, ['not-a-url'], {})
    ).rejects.toThrow('process.exit called');

    process.exit = originalExit;
    expect(mockClient.getContents).not.toHaveBeenCalled();
  });

  test('handles multiple URLs', async () => {
    const mockClient = { getContents: mock(() => ({ results: [] })) };

    const originalExit = process.exit;
    process.exit = mock(() => {}) as any;

    await contents.contents(
      mockClient as any,
      ['https://example.com', 'https://test.com'],
      {}
    );

    process.exit = originalExit;
    expect(mockClient.getContents).toHaveBeenCalled();
  });
});

describe('similar command', () => {
  test('calls similar with URL', async () => {
    const mockClient = { findSimilar: mock(() => ({ results: [] })) };

    const originalExit = process.exit;
    process.exit = mock(() => {}) as any;

    await similar.similar(mockClient as any, 'https://example.com', {});

    process.exit = originalExit;
    expect(mockClient.findSimilar).toHaveBeenCalled();
  });
});

describe('answer command', () => {
  test('calls answer without streaming', async () => {
    const mockClient = {
      answer: mock(() => ({ answer: 'test answer' })),
    };

    const originalExit = process.exit;
    process.exit = mock(() => {}) as any;

    await answer.answer(mockClient as any, 'test query', { stream: false });

    process.exit = originalExit;
    expect(mockClient.answer).toHaveBeenCalled();
  });

  test('calls streamAnswer when stream is true', async () => {
    const mockClient = {
      streamAnswer: mock(async function* () {
        yield { content: 'test', citations: [] };
      }),
    };

    const originalExit = process.exit;
    process.exit = mock(() => {}) as any;

    await answer.answer(mockClient as any, 'test query', { stream: true });

    process.exit = originalExit;
    expect(mockClient.streamAnswer).toHaveBeenCalled();
  });
});

describe('research commands', () => {
  test('researchCreate creates task with instructions', async () => {
    const mockClient = {
      research: {
        create: mock(() => ({ researchId: 'test-id', status: 'in_progress' })),
        pollUntilFinished: mock(() => ({
          researchId: 'test-id',
          status: 'completed',
        })),
      },
    };

    const originalExit = process.exit;
    process.exit = mock(() => {}) as any;

    await research.researchCreate(mockClient as any, 'test instructions', {});

    process.exit = originalExit;
    expect(mockClient.research.create).toHaveBeenCalled();
  });

  test('researchCreate maps model correctly', async () => {
    const mockClient = {
      research: {
        create: mock(() => ({ researchId: 'test-id', status: 'in_progress' })),
      },
    };

    const originalExit = process.exit;
    process.exit = mock(() => {}) as any;

    await research.researchCreate(mockClient as any, 'test instructions', {
      model: 'fast',
    });

    process.exit = originalExit;
    expect(mockClient.research.create).toHaveBeenCalledWith({
      instructions: 'test instructions',
      model: 'exa-research-fast',
    });
  });

  test('researchStatus fetches task by ID', async () => {
    const mockClient = {
      research: {
        get: mock(() => ({ researchId: 'test-id', status: 'completed' })),
      },
    };

    const originalExit = process.exit;
    process.exit = mock(() => {}) as any;

    await research.researchStatus(mockClient as any, 'test-id', {});

    process.exit = originalExit;
    expect(mockClient.research.get).toHaveBeenCalledWith('test-id');
  });

  test('researchList fetches all tasks', async () => {
    const mockClient = {
      research: {
        list: mock(() => ({ data: [], hasMore: false })),
      },
    };

    const originalExit = process.exit;
    process.exit = mock(() => {}) as any;

    await research.researchList(mockClient as any, {});

    process.exit = originalExit;
    expect(mockClient.research.list).toHaveBeenCalled();
  });

  test('researchList respects limit and cursor', async () => {
    const mockClient = {
      research: {
        list: mock(() => ({ data: [], hasMore: false })),
      },
    };

    const originalExit = process.exit;
    process.exit = mock(() => {}) as any;

    await research.researchList(mockClient as any, {
      limit: '10',
      cursor: 'test-cursor',
    });

    process.exit = originalExit;
    expect(mockClient.research.list).toHaveBeenCalledWith({
      limit: 10,
      cursor: 'test-cursor',
    });
  });
});
