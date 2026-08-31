# Data integration boundary

The UI currently uses deterministic sample listings so filtering and ranking can be tested without depending on unstable third-party pages.

The next integration step is a server-side source layer. Each adapter should:

1. Query an approved public endpoint or an allowed page surface.
2. Parse the listing into the normalized shape in `sourceAdapters.js`.
3. Preserve source URL, availability, price, and `lastChecked`.
4. Return source-level errors without failing the whole search.
5. Respect robots.txt, terms of use, rate limits, and anti-bot boundaries.

Do not move scraping into the browser: the application will need a backend or serverless route for CORS, caching, source-level timeouts, and deduplication.
