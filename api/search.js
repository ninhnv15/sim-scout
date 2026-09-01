const SOURCE = {
  id: 'sim-thang-long',
  name: 'Sim Thăng Long',
  baseUrl: 'https://simthanglong.vn/sim-viettel',
}

const cleanDigits = (value = '') => String(value).replace(/\D/g, '')
const safeText = (value = '') => value
  .replace(/<script[\s\S]*?<\/script>/gi, '')
  .replace(/<style[\s\S]*?<\/style>/gi, '')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/gi, ' ')
  .replace(/&amp;/gi, '&')
  .replace(/\s+/g, ' ')
  .trim()

function wildcardMatches(number, query) {
  const clean = String(query || '').replace(/[^0-9*]/g, '')
  return !clean || clean === '*' || clean.split('*').filter(Boolean).every((part) => number.includes(part))
}

function budgetRange(budget) {
  if (budget === '≤ 500 nghìn') return '0-500000'
  if (budget === '≤ 1 triệu') return '0-1000000'
  if (budget === '≤ 3 triệu') return '0-3000000'
  return ''
}

function prefixHead(prefix) {
  if (prefix === '086') return '08'
  if (prefix === '03x') return '03'
  return '09'
}

export function parseListings(html) {
  const rows = html.match(/<tr\b[\s\S]*?<\/tr>/gi) || []
  const listings = []
  for (const row of rows) {
    const text = safeText(row)
    const detail = row.match(/<td\b[^>]*class=["'][^"']*\bsimso\b[^"']*["'][^>]*>[\s\S]*?<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/i)
    const rawNumber = safeText(detail?.[2])
    const number = cleanDigits(rawNumber)
    const price = Number(cleanDigits(row.match(/class=["'][^"']*text-price[^"']*["'][^>]*>([\s\S]*?)<\/span>/i)?.[1]))
    const href = detail?.[1]
    if (number.length !== 10 || !price || !/viettel/i.test(text)) continue
    listings.push({
      id: `${SOURCE.id}-${number}`,
      number: number.replace(/(\d{4})(\d{3})(\d{3})/, '$1.$2.$3'),
      carrier: 'Viettel',
      prefix: number.slice(0, 4),
      source: SOURCE.name,
      url: href ? new URL(href, SOURCE.baseUrl).toString() : SOURCE.baseUrl,
      price,
      observedAt: new Date().toISOString(),
    })
  }
  return listings
}

export default async function handler(request, response) {
  if (request.method !== 'GET') return response.status(405).json({ error: 'Method not allowed' })
  const query = String(request.query.query || '').slice(0, 24)
  const prefix = String(request.query.prefix || '09x')
  const budget = String(request.query.budget || '≤ 1 triệu')
  const remoteUrl = new URL(SOURCE.baseUrl)
  remoteUrl.searchParams.set('check_head', prefixHead(prefix))
  const priceRange = budgetRange(budget)
  if (priceRange) remoteUrl.searchParams.set('pr', priceRange)
  remoteUrl.searchParams.set('d', '1')

  try {
    const upstream = await fetch(remoteUrl, {
      headers: { 'User-Agent': 'SIM-Scout/0.2 (+https://sim-scout-ninhbuzzle-1073.vercel.app/)' },
      signal: AbortSignal.timeout(8000),
    })
    if (!upstream.ok) throw new Error(`Nguồn phản hồi ${upstream.status}`)
    const available = parseListings(await upstream.text())
      .filter((item) => wildcardMatches(cleanDigits(item.number), query))
      .filter((item) => prefix === 'Tất cả' || (prefix === '09x' ? item.prefix.startsWith('09') : item.prefix.startsWith(prefix)))
      .slice(0, 50)
    response.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600')
    return response.status(200).json({
      mode: 'live',
      listings: available,
      sourceHealth: [{ source: SOURCE.name, status: 'connected', observedAt: new Date().toISOString(), sourceUrl: remoteUrl.toString() }],
    })
  } catch (error) {
    response.setHeader('Cache-Control', 'no-store')
    return response.status(503).json({
      mode: 'unavailable',
      listings: [],
      sourceHealth: [{ source: SOURCE.name, status: 'unavailable', observedAt: new Date().toISOString(), error: 'Nguồn tạm không phản hồi' }],
    })
  }
}
