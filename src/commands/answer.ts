import type { ExaClient } from '../client.js';
import * as format from '../formatters/markdown.js';

export async function answer(
  client: ExaClient,
  query: string,
  args: Record<string, unknown>
) {
  try {
    const options = buildAnswerOptions(args);

    if (args.stream === true) {
      await streamAnswer(client, query, options, args.json === true);
    } else {
      const response = await client.answer(query, options);
      console.log(
        format.formatAnswerResponse(response, { json: args.json === true })
      );
    }
  } catch (error) {
    console.error(format.formatError(error));
    process.exit(1);
  }
}

async function streamAnswer(
  client: ExaClient,
  query: string,
  options: Record<string, unknown>,
  useJson: boolean
) {
  if (useJson) {
    const jsonResponse = {
      response: '',
      citations: [] as Array<{ title?: string | null; url: string }>,
    };

    for await (const chunk of client.streamAnswer(query, options)) {
      if (chunk.content) {
        jsonResponse.response += chunk.content;
        process.stdout.write(chunk.content);
      }
      if (chunk.citations) {
        for (const citation of chunk.citations) {
          if (
            citation &&
            !jsonResponse.citations.some((c) => c.url === citation.url)
          ) {
            jsonResponse.citations.push(citation);
          }
        }
      }
    }

    console.log('\n');
    if (jsonResponse.citations.length > 0) {
      console.log(
        JSON.stringify({ citations: jsonResponse.citations }, null, 2)
      );
    }
  } else {
    console.log('# Answer (streaming)\n');
    console.log('## Response\n');

    const citations: Array<{ title?: string | null; url: string }> = [];

    for await (const chunk of client.streamAnswer(query, options)) {
      if (chunk.content) {
        process.stdout.write(chunk.content);
      }
      if (chunk.citations) {
        for (const citation of chunk.citations) {
          if (citation && !citations.some((c) => c.url === citation.url)) {
            citations.push(citation);
          }
        }
      }
    }

    console.log('\n');

    if (citations.length > 0) {
      console.log('## Citations\n');
      for (let i = 0; i < citations.length; i++) {
        const citation = citations[i];
        if (citation) {
          console.log(
            `${i + 1}. [${citation.title || 'Untitled'}](${citation.url})`
          );
        }
      }
      console.log('');
    }
  }
}

function buildAnswerOptions(args: Record<string, unknown>) {
  const options: Record<string, unknown> = {};

  if (args.text === true) {
    options.text = true;
  }

  if (args.model && typeof args.model === 'string') {
    options.model = args.model;
  }

  if (args['system-prompt'] && typeof args['system-prompt'] === 'string') {
    options.systemPrompt = args['system-prompt'];
  }

  return options;
}
