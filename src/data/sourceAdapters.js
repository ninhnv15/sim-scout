/**
 * Source adapter contract for the live-search phase.
 *
 * Browser-side scraping is intentionally not used: most sellers will need a
 * server-side request, a public endpoint, or an approved data feed to avoid
 * CORS and terms-of-use problems. Each adapter returns the same normalized
 * listing shape consumed by the ranking engine.
 */
export const sourceAdapters = [
  {
    id: 'sim-thang-long',
    name: 'Sim Thăng Long',
    baseUrl: 'https://simthanglong.vn',
    status: 'discovery',
    search: async () => [],
  },
  {
    id: 'tong-kho-sim',
    name: 'Tổng Kho Sim',
    baseUrl: 'https://tongkhosim.com',
    status: 'discovery',
    search: async () => [],
  },
  {
    id: 'sieu-thi-sim-the',
    name: 'Siêu Thị Sim Thẻ',
    baseUrl: 'https://sieuthisimthe.com',
    status: 'discovery',
    search: async () => [],
  },
]

export function normalizeListing(raw, source) {
  return {
    id: `${source.id}:${raw.number}`,
    number: raw.number,
    carrier: raw.carrier ?? 'Unknown',
    prefix: raw.number?.replace(/\D/g, '').slice(0, 4) ?? '',
    source: source.name,
    sourceUrl: raw.sourceUrl ?? source.baseUrl,
    price: Number(raw.price ?? 0),
    available: raw.available ?? null,
    lastChecked: new Date().toISOString(),
  }
}
