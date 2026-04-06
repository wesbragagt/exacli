import type { ExaClient } from '../client.js';
import * as format from '../formatters/markdown.js';
import { parseNumber, parseStringList } from '../utils/validation.js';

export async function search(
  client: ExaClient,
  query: string,
  args: Record<string, unknown>
) {
  try {
    const options = buildSearchOptions(args);

    const hasContentOptions =
      args.text === true || args.highlights === true || args.summary === true;

    const response = hasContentOptions
      ? await client.searchAndContents(query, options)
      : await client.search(query, options);

    console.log(
      format.formatSearchResults(response, { json: args.json === true })
    );
  } catch (error) {
    console.error(format.formatError(error));
    process.exit(1);
  }
}

function buildSearchOptions(args: Record<string, unknown>) {
  const options: Record<string, unknown> = {};

  const numResults = parseNumber(args['num-results']);
  if (numResults !== undefined) {
    options.numResults = numResults;
  }

  const includeDomains = parseStringList(args['include-domains']);
  if (includeDomains && includeDomains.length > 0) {
    options.includeDomains = includeDomains;
  }

  const excludeDomains = parseStringList(args['exclude-domains']);
  if (excludeDomains && excludeDomains.length > 0) {
    options.excludeDomains = excludeDomains;
  }

  if (args.category && typeof args.category === 'string') {
    options.category = args.category;
  }

  if (args['start-date'] && typeof args['start-date'] === 'string') {
    options.startPublishedDate = args['start-date'];
  }

  if (args['end-date'] && typeof args['end-date'] === 'string') {
    options.endPublishedDate = args['end-date'];
  }

  if (args.autoprompt === true) {
    options.useAutoprompt = true;
  }

  if (args.type && typeof args.type === 'string') {
    options.type = args.type;
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
