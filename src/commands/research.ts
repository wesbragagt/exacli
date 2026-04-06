import type { ExaClient } from '../client.js';
import * as format from '../formatters/markdown.js';
import { parseNumber } from '../utils/validation.js';

function mapResearchModel(model?: string): string | undefined {
  const map: Record<string, string> = {
    fast: 'exa-research-fast',
    regular: 'exa-research',
    pro: 'exa-research-pro',
  };
  return model ? map[model] : undefined;
}

export async function researchCreate(
  client: ExaClient,
  instructions: string,
  args: Record<string, unknown>
) {
  try {
    const options: Record<string, unknown> = {};

    if (args.model && typeof args.model === 'string') {
      const mappedModel = mapResearchModel(args.model);
      if (mappedModel) {
        options.model = mappedModel;
      } else {
        console.error(
          `Warning: Invalid research model "${args.model}". Valid options are: fast, regular, pro. Using default model.`
        );
      }
    }

    const task = await client.research.create({
      instructions,
      ...options,
    });

    if (args.json === true) {
      console.log(JSON.stringify(task, null, 2));
    } else {
      console.log(format.formatSuccess(`Research task created`));
      console.log(`Task ID: ${task.researchId}`);
      console.log(`Status: ${task.status}`);

      if (args.poll === true) {
        console.log('\nPolling for results...\n');
        const pollInterval = parseNumber(args['poll-interval']) || 1000;
        const timeoutMs = parseNumber(args.timeout) || 600000;
        const result = await client.research.pollUntilFinished(
          task.researchId,
          {
            pollInterval,
            timeoutMs,
          }
        );
        console.log(format.formatResearchTask(result, { json: false }));
      }
    }
  } catch (error) {
    console.error(format.formatError(error));
    process.exit(1);
  }
}

export async function researchStatus(
  client: ExaClient,
  researchId: string,
  args: Record<string, unknown>
) {
  try {
    const task = await client.research.get(researchId);
    console.log(format.formatResearchTask(task, { json: args.json === true }));
  } catch (error) {
    console.error(format.formatError(error));
    process.exit(1);
  }
}

export async function researchList(
  client: ExaClient,
  args: Record<string, unknown>
) {
  try {
    const options: { limit?: number; cursor?: string } = {};

    const limit = parseNumber(args.limit);
    if (limit !== undefined) {
      options.limit = limit;
    }

    if (args.cursor && typeof args.cursor === 'string') {
      options.cursor = args.cursor;
    }

    const result = await client.research.list(options);

    if (args.json === true) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log('# Research Tasks\n');

      if (!result.data || result.data.length === 0) {
        console.log('No research tasks found.');
        return;
      }

      for (const task of result.data) {
        console.log(`- ${task.researchId}: ${task.status}`);
        if (task.instructions) {
          console.log(`  ${task.instructions.substring(0, 60)}...`);
        }
        console.log('');
      }

      if (result.hasMore && result.nextCursor) {
        console.log(
          `\nMore results available. Use --cursor ${result.nextCursor} to see more.`
        );
      }
    }
  } catch (error) {
    console.error(format.formatError(error));
    process.exit(1);
  }
}
