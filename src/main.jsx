import React, { useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'

const glyph = (character) => function Glyph() { return <span aria-hidden="true">{character}</span> }
const BarChart3 = glyph('▥')
const BookmarkPlus = glyph('▤')
const Download = glyph('⇩')
const ExternalLink = glyph('↗')
const Heart = glyph('♡')
const HelpCircle = glyph('?')
const History = glyph('◷')
const RefreshCw = glyph('↻')
const Search = glyph('⌕')
const Settings = glyph('⚙')
const X = glyph('×')

const listings = [
  { id: 1, number: '0969.456.439', carrier: 'Viettel', prefix: '0969', source: 'Sim Thăng Long', url: 'https://simthanglong.vn/sim-viettel', price: 980000 },
  { id: 2, number: '0977.339.939', carrier: 'Viettel', prefix: '0977', source: 'Tổng Kho Sim', url: 'https://tongkhosim.com/', price: 750000 },
  { id: 3, number: '0986.439.339', carrier: 'Viettel', prefix: '0986', source: 'Siêu Thị Sim Thẻ', url: 'https://sieuthisimthe.com/', price: 1200000 },
  { id: 4, number: '0968.689.939', carrier: 'Viettel', prefix: '0968', source: 'Sim Thăng Long', url: 'https://simthanglong.vn/sim-viettel', price: 1450000 },
  { id: 5, number: '0983.939.689', carrier: 'Viettel', prefix: '0983', source: 'Tổng Kho Sim', url: 'https://tongkhosim.com/', price: 680000 },
  { id: 6, number: '0868.339.939', carrier: 'Viettel', prefix: '0868', source: 'Siêu Thị Sim Thẻ', url: 'https://sieuthisimthe.com/', price: 430000 },
  { id: 7, number: '0396.439.399', carrier: 'Viettel', prefix: '0396', source: 'Sim Thăng Long', url: 'https://simthanglong.vn/sim-viettel', price: 395000 },
  { id: 8, number: '0919.339.939', carrier: 'VinaPhone', prefix: '0919', source: 'Tổng Kho Sim', url: 'https://tongkhosim.com/', price: 900000 },
]
const sources = ['Sim Thăng Long', 'Tổng Kho Sim', 'Siêu Thị Sim Thẻ']
const defaults = { beauty: 35, reference: 25, network: 25, value: 15 }
const patterns = ['939', '439', '339', '39', '68', '86', '88']
const money = (value) => new Intl.NumberFormat('vi-VN').format(value) + ' ₫'
const digits = (value) => value.replaceAll('.', '')
const clamp = (value) => Math.max(0, Math.min(100, Math.round(value)))
const budgetLimit = (value) => value === '≤ 500 nghìn' ? 500000 : value === '≤ 1 triệu' ? 1000000 : value === '≤ 3 triệu' ? 3000000 : Infinity

function matches(number, query) {
  const clean = query.replace(/[^0-9*]/g, '')
  return !clean || clean === '*' || clean.split('*').filter(Boolean).every((part) => number.includes(part))
}

function analyse(item, budget, avoidTail, weights) {
  const number = digits(item.number)
  const tail = number.slice(-4)
  const hits = patterns.filter((pattern) => number.includes(pattern))
  const repeats = number.match(/(\d)\1+/g) ?? []
  const preferred = [...number].filter((digit) => ['3', '4', '9'].includes(digit)).length
  const tailConflict = avoidTail.some((digit) => tail.includes(digit))
  const limit = budgetLimit(budget)
  const beauty = clamp(40 + hits.length * 15 + repeats.length * 8 + (tail.endsWith('39') || tail.endsWith('89') ? 8 : 0))
  const reference = clamp(43 + preferred * 6 + (number.split('').reduce((sum, digit) => sum + Number(digit), 0) % 9 === 0 ? 7 : 0) - (tailConflict ? 24 : 0))
  const network = clamp((item.carrier === 'Viettel' ? 70 : 58) + (['096', '097', '098'].some((prefix) => item.prefix.startsWith(prefix)) ? 30 : item.prefix.startsWith('09') ? 20 : 13))
  const value = clamp(!Number.isFinite(limit) ? 76 : item.price <= limit ? 96 - item.price / limit * 22 : 64 - (item.price / limit - 1) * 42)
  const total = clamp((beauty * weights.beauty + reference * weights.reference + network * weights.network + value * weights.value) / 100)
  return { total, tail, hits, tailConflict, parts: [
    ['Độ đẹp & dễ nhớ', beauty, weights.beauty, hits.length ? 'Có cụm ' + hits.join(' · ') : 'Không có cụm ưu tiên mạnh'],
    ['Cân bằng chữ số', reference, weights.reference, tailConflict ? 'Đuôi có chữ số hạn chế' : preferred + '/10 chữ số ưu tiên'],
    ['Nhà mạng & đầu số', network, weights.network, item.carrier + ' · ' + item.prefix],
    ['Giá trị theo ngân sách', value, weights.value, Number.isFinite(limit) ? money(item.price) + ' / ' + budget : money(item.price)],
  ], strengths: [
    hits.length ? 'Có cụm ưu tiên ' + hits.join(', ') : 'Cấu trúc không có cụm ưu tiên nổi bật',
    repeats.length ? 'Có nhịp lặp ' + repeats.join(', ') + ' giúp số dễ đọc hơn' : 'Nhịp số liền mạch, không có lặp dài',
    item.carrier === 'Viettel' ? 'Thuộc Viettel, đầu số nằm trong nhóm ưu tiên' : 'Đầu số là phương án thay thế phù hợp',
  ], cautions: [
    tailConflict ? 'Đuôi ' + tail + ' chứa ' + avoidTail.join(', ') + ' mà bạn đang hạn chế' : 'Đuôi ' + tail + ' không chạm tiêu chí hạn chế hiện tại',
    Number.isFinite(limit) && item.price > limit ? 'Giá vượt ngân sách ' + budget : 'Giá nằm trong ngân sách hiện tại',
    'Điểm chữ số chỉ là quy tắc tham khảo, không dự báo kết quả thực tế.',
  ] }
}

function App() {
  const [query, setQuery] = useState('*39')
  const [carrier, setCarrier] = useState('Viettel')
  const [prefix, setPrefix] = useState('09x')
  const [budget, setBudget] = useState('≤ 1 triệu')
  const [avoidTail, setAvoidTail] = useState('4, 7')
  const [activeSources, setActiveSources] = useState(sources)
  const [sort, setSort] = useState('score')
  const [weights, setWeights] = useState(defaults)
  const [selectedId, setSelectedId] = useState(1)
  const [favorites, setFavorites] = useState(() => new Set())
  const [onlyFavorites, setOnlyFavorites] = useState(false)
  const [message, setMessage] = useState('')
  const [lastSearch, setLastSearch] = useState('Dữ liệu mẫu')
  const avoided = useMemo(() => avoidTail.split(',').map((item) => item.trim()).filter(Boolean), [avoidTail])
  const results = useMemo(() => listings
    .filter((item) => matches(digits(item.number), query) && (carrier === 'Tất cả' || item.carrier === carrier) && (prefix === 'Tất cả' || (prefix === '09x' ? item.prefix.startsWith('09') : item.prefix.startsWith(prefix))) && item.price <= budgetLimit(budget) && activeSources.includes(item.source) && (!onlyFavorites || favorites.has(item.id)))
    .map((item) => ({ item, analysis: analyse(item, budget, avoided, weights) }))
    .sort((left, right) => sort === 'price' ? left.item.price - right.item.price : right.analysis.total - left.analysis.total), [activeSources, avoided, budget, carrier, favorites, onlyFavorites, prefix, query, sort, weights])
  const selected = results.find((result) => result.item.id === selectedId) ?? results[0] ?? null
  const notice = (text) => { setMessage(text); window.setTimeout(() => setMessage(''), 2600) }
  const reset = () => { setQuery('*39'); setCarrier('Viettel'); setPrefix('09x'); setBudget('≤ 1 triệu'); setAvoidTail('4, 7'); setActiveSources(sources); setOnlyFavorites(false); setSort('score'); notice('Đã khôi phục tiêu chí gợi ý') }
  const favorite = (id) => setFavorites((current) => { const next = new Set(current); next.has(id) ? next.delete(id) : next.add(id); return next })
  const toggleSource = (source) => setActiveSources((current) => current.includes(source) ? current.filter((item) => item !== source) : [...current, source])
  const updateWeight = (key, value) => {
    const others = Object.keys(weights).filter((item) => item !== key)
    const total = others.reduce((sum, item) => sum + weights[item], 0) || 1
    const next = { ...weights, [key]: value }
    others.forEach((item) => { next[item] = Math.max(0, Math.round(weights[item] * (100 - value) / total)) })
    next[others[0]] += 100 - Object.values(next).reduce((sum, item) => sum + item, 0)
    setWeights(next)
  }
  const runSearch = () => { setLastSearch('Đã áp dụng lúc ' + new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit' }).format(new Date())); notice('Đã lọc ' + results.length + ' kết quả từ dữ liệu mẫu') }
  const exportCsv = () => { const csv = ['So dien thoai,Nha mang,Dau so,Nguon,Gia,Diem', ...results.map(({ item, analysis }) => [digits(item.number), item.carrier, item.prefix, item.source, item.price, analysis.total].join(','))].join('\n'); const url = URL.createObjectURL(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })); const link = document.createElement('a'); link.href = url; link.download = 'sim-scout-results.csv'; link.click(); URL.revokeObjectURL(url); notice('Đã xuất CSV') }
  return <main className="app-shell">
    <aside className="sidebar"><div className="brand"><span>SIM</span> Scout</div><nav>
      <button className="nav-item active"><Search size={17} /><span>Tìm SIM</span></button>
      <button className="nav-item" onClick={() => notice('Bộ lọc đã lưu sẽ được bổ sung khi có tài khoản')}><BookmarkPlus size={17} /><span>Bộ lọc đã lưu</span></button>
      <button className="nav-item" onClick={() => notice(lastSearch)}><History size={17} /><span>Lần tìm gần nhất</span></button>
      <button className="nav-item" onClick={() => notice('Chọn một SIM để so sánh với phương án kế tiếp')}><BarChart3 size={17} /><span>So sánh</span></button>
      <button className={'nav-item ' + (onlyFavorites ? 'active' : '')} onClick={() => setOnlyFavorites((current) => !current)}><Heart size={17} /><span>Yêu thích ({favorites.size})</span></button>
    </nav><div className="side-bottom"><button className="nav-item" onClick={() => notice('Điều chỉnh trọng số ở bảng phân tích')}><Settings size={17} /><span>Cài đặt</span></button><button className="nav-item" onClick={() => notice('Live search sẽ dùng adapter nguồn ở bước tiếp theo')}><HelpCircle size={17} /><span>Trợ giúp</span></button></div></aside>
    <section className="workspace"><header className="topbar"><div><h1>Tìm SIM</h1><p>Lọc, đối chiếu và chấm điểm theo tiêu chí của bạn.</p></div><div className="sync"><i /> {lastSearch}</div></header>
      <div className="search-row"><div className="search-box"><Search size={19} /><input aria-label="Mẫu tìm SIM" value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && runSearch()} placeholder="Ví dụ: 096*39 hoặc *939" /><button aria-label="Xóa mẫu tìm kiếm" onClick={() => setQuery('')}><X size={18} /></button></div><button className="primary" onClick={runSearch}>Áp dụng tìm kiếm</button></div>
      <section className="filter-panel"><div className="panel-title"><div><h2>Bộ lọc</h2><p>Dùng <b>*</b> để tìm theo cụm số, ví dụ <b>096*39</b>.</p></div><button onClick={reset}><RefreshCw size={14} /> Khôi phục gợi ý</button></div><div className="filter-grid"><label>Nhà mạng<select value={carrier} onChange={(event) => setCarrier(event.target.value)}><option>Tất cả</option><option>Viettel</option><option>VinaPhone</option><option>MobiFone</option></select></label><label>Đầu số<select value={prefix} onChange={(event) => setPrefix(event.target.value)}><option>Tất cả</option><option>09x</option><option>096</option><option>097</option><option>098</option><option>086</option><option>03x</option></select></label><label>Ngân sách<select value={budget} onChange={(event) => setBudget(event.target.value)}><option>Không giới hạn</option><option>≤ 500 nghìn</option><option>≤ 1 triệu</option><option>≤ 3 triệu</option></select></label><label>Hạn chế ở đuôi<input value={avoidTail} onChange={(event) => setAvoidTail(event.target.value)} placeholder="Ví dụ: 4, 7" /></label></div><div className="source-filter"><span>Nguồn dữ liệu mẫu</span>{sources.map((source) => <label key={source}><input type="checkbox" checked={activeSources.includes(source)} onChange={() => toggleSource(source)} /> {source}</label>)}</div></section>
      <section className="results"><div className="results-title"><div><h2>Kết quả tìm kiếm <small>{results.length} kết quả</small></h2><p>Điểm và thứ hạng đổi ngay khi bạn thay đổi tiêu chí hoặc trọng số.</p></div><div className="result-actions"><select aria-label="Sắp xếp" value={sort} onChange={(event) => setSort(event.target.value)}><option value="score">Sắp xếp: Điểm phù hợp</option><option value="price">Sắp xếp: Giá thấp → cao</option></select><button onClick={exportCsv} disabled={!results.length}><Download size={15} /> Xuất CSV</button></div></div><div className="table-scroll"><table><thead><tr><th>Số điện thoại</th><th>Nhà mạng</th><th>Đầu số</th><th>Nguồn</th><th>Giá (VND)</th><th>Đuôi</th><th>Điểm</th><th /></tr></thead><tbody>{results.map(({ item, analysis }) => <tr className={item.id === selected?.item.id ? 'chosen' : ''} key={item.id} onClick={() => setSelectedId(item.id)}><td className="number">{item.number}<small>{analysis.hits.join(' · ') || 'Số thường'}</small></td><td>{item.carrier}</td><td>{item.prefix}</td><td className="muted">{item.source}</td><td>{money(item.price)}</td><td><span className={analysis.tailConflict ? 'tail-bad' : 'tail-ok'}>{analysis.tail}</span></td><td className="score">{analysis.total}</td><td className="row-actions"><button className={favorites.has(item.id) ? 'liked' : ''} aria-label="Yêu thích SIM" onClick={(event) => { event.stopPropagation(); favorite(item.id) }}><Heart size={15} fill={favorites.has(item.id) ? 'currentColor' : 'none'} /></button><a aria-label="Mở nguồn bán" href={item.url} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()}><ExternalLink size={15} /></a></td></tr>)}</tbody></table>{!results.length && <div className="empty"><strong>Không có SIM phù hợp với điều kiện này.</strong><span>Hãy nới ngân sách, bỏ bớt nguồn hoặc tắt chế độ yêu thích.</span><button onClick={reset}>Khôi phục gợi ý</button></div>}</div><footer className="table-footer"><span>Hiển thị {results.length} / {listings.length} SIM mẫu</span><span>Chọn một dòng để xem phân tích chi tiết</span></footer></section></section>
    <aside className="insights">{selected ? <><div className="selected-head"><div><small>SIM ĐANG PHÂN TÍCH</small><h2>{selected.item.number}</h2><span>{selected.item.carrier} · {selected.item.source}</span></div><button className={favorites.has(selected.item.id) ? 'liked' : ''} aria-label="Yêu thích SIM đang chọn" onClick={() => favorite(selected.item.id)}><Heart size={19} fill={favorites.has(selected.item.id) ? 'currentColor' : 'none'} /></button></div><div className="total"><strong>{selected.analysis.total}</strong><span>/100</span><em>{selected.analysis.total >= 90 ? 'Rất phù hợp' : selected.analysis.total >= 78 ? 'Phù hợp' : selected.analysis.total >= 65 ? 'Có thể cân nhắc' : 'Cần cân nhắc thêm'}</em></div><hr /><h2>Phân tích theo tiêu chí</h2><p className="intro">Kéo trọng số để ưu tiên điều quan trọng với bạn. Điểm tổng và thứ hạng sẽ đổi ngay.</p><div className="parts">{selected.analysis.parts.map(([label, value, weight, detail]) => <div className="part" key={label}><div className="part-head"><span>{label}</span><b>{value}<small>/100</small></b></div><div className="bar"><i style={{ width: value + '%' }} /></div><div className="part-foot"><span>{detail}</span><span>Trọng số {weight}%</span></div></div>)}</div><div className="weight-grid">{['beauty', 'reference', 'network', 'value'].map((key) => <label key={key}>{({ beauty: 'Độ đẹp', reference: 'Chữ số', network: 'Nhà mạng', value: 'Ngân sách' })[key]}<input type="range" min="0" max="70" value={weights[key]} onChange={(event) => updateWeight(key, Number(event.target.value))} /><b>{weights[key]}%</b></label>)}</div><div className="explain"><h3>Vì sao số này được xếp như vậy?</h3><ul>{selected.analysis.strengths.map((item) => <li key={item}>{item}</li>)}</ul></div><div className="cautions"><h3>Điểm cần kiểm tra thêm</h3><ul>{selected.analysis.cautions.map((item) => <li key={item}>{item}</li>)}</ul></div><div className="note"><strong>Phạm vi hiện tại:</strong> Kết quả là dữ liệu mẫu để kiểm tra bộ lọc và cách chấm điểm. Giá/tình trạng thực tế cần xác nhận lại tại nguồn bán.</div></> : <div className="insight-empty"><BarChart3 size={28} /><h2>Chưa có SIM để phân tích</h2><p>Nới điều kiện tìm kiếm hoặc khôi phục bộ lọc gợi ý để xem lại kết quả.</p><button className="primary small" onClick={reset}>Khôi phục gợi ý</button></div>}</aside>
    {message && <div className="toast">{message}</div>}
  </main>
}

createRoot(document.getElementById('root')).render(<App />)
