import type { ExaClient } from '../client.js';
import * as format from '../formatters/markdown.js';
import { parseNumber } from '../utils/validation.js';

export async function similar(
  client: ExaClient,
  url: string,
  args: Record<string, unknown>
) {
  try {
    const options = buildSimilarOptions(args);

    const hasContentOptions =
      args.text === true || args.highlights === true || args.summary === true;

    const response = hasContentOptions
      ? await client.findSimilarAndContents(url, options)
      : await client.findSimilar(url, options);

    console.log(
      format.formatSearchResults(response, { json: args.json === true })
    );
  } catch (error) {
    console.error(format.formatError(error));
    process.exit(1);
  }
}

function buildSimilarOptions(args: Record<string, unknown>) {
  const options: Record<string, unknown> = {};

  const numResults = parseNumber(args['num-results']);
  if (numResults !== undefined) {
    options.numResults = numResults;
  }

  if (args['exclude-source-domain'] === true) {
    options.excludeSourceDomain = true;
  }

  if (args.category && typeof args.category === 'string') {
    options.category = args.category;
  }

  if (args.text === true) {
    options.text = true;
  }

  if (args.highlights === true) {
    options.highlights = true;
  }

  if (args.summary === true) {
    options.summary = true;
  }

  return options;
}
