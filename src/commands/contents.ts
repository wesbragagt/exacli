import type { ExaClient } from '../client.js';
import * as format from '../formatters/markdown.js';
import { isValidUrl, parseNumber } from '../utils/validation.js';

export async function contents(
  client: ExaClient,
  urls: string[],
  args: Record<string, unknown>
) {
  try {
    for (const url of urls) {
      if (!isValidUrl(url)) {
        console.error(
          `Error: Invalid URL "${url}". URLs must use HTTP or HTTPS protocol.`
        );
        process.exit(1);
      }
    }

    const options = buildContentsOptions(args);
    const response = await client.getContents(urls, options);
    console.log(
      format.formatSearchResults(response, { json: args.json === true })
    );
  } catch (error) {
    console.error(format.formatError(error));
    process.exit(1);
  }
}

function buildContentsOptions(args: Record<string, unknown>) {
  const options: Record<string, unknown> = {};

  if (args.text === true) {
    options.text = true;
  }

  if (args.highlights === true) {
    options.highlights = true;
  }

  if (args.summary === true) {
    options.summary = true;
  }

  const maxAgeHours = parseNumber(args['max-age-hours']);
  if (maxAgeHours !== undefined) {
    options.maxAgeHours = maxAgeHours;
  }

  return options;
}
