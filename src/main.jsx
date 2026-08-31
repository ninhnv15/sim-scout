import React, { useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'

const seedListings = [
  { id: 1, number: '0969.456.439', carrier: 'Viettel', prefix: '0969', source: 'Sim Thăng Long', price: 980000, available: true, type: 'Thần tài', score: 94, lastChecked: 'vừa xong', pattern: '39 · 439', digits: [0, 9, 6, 9, 4, 5, 6, 4, 3, 9] },
  { id: 2, number: '0977.339.939', carrier: 'Viettel', prefix: '0977', source: 'Tổng Kho Sim', price: 750000, available: true, type: 'Lặp kép', score: 92, lastChecked: 'vừa xong', pattern: '33 · 939', digits: [0, 9, 7, 7, 3, 3, 9, 9, 3, 9] },
  { id: 3, number: '0986.439.339', carrier: 'Viettel', prefix: '0986', source: 'Siêu Thị Sim Thẻ', price: 1200000, available: true, type: 'Dễ nhớ', score: 90, lastChecked: 'vừa xong', pattern: '439 · 339', digits: [0, 9, 8, 6, 4, 3, 9, 3, 3, 9] },
  { id: 4, number: '0968.689.939', carrier: 'Viettel', prefix: '0968', source: 'Sim Thăng Long', price: 1450000, available: true, type: 'Lộc phát', score: 89, lastChecked: 'vừa xong', pattern: '68 · 939', digits: [0, 9, 6, 8, 6, 8, 9, 9, 3, 9] },
  { id: 5, number: '0983.939.689', carrier: 'Viettel', prefix: '0983', source: 'Tổng Kho Sim', price: 680000, available: true, type: 'Dễ nhớ', score: 88, lastChecked: '2 phút trước', pattern: '939 · 68', digits: [0, 9, 8, 3, 9, 3, 9, 6, 8, 9] },
  { id: 6, number: '0868.339.939', carrier: 'Viettel', prefix: '0868', source: 'Siêu Thị Sim Thẻ', price: 430000, available: true, type: 'Tam hoa', score: 86, lastChecked: '2 phút trước', pattern: '33 · 939', digits: [0, 8, 6, 8, 3, 3, 9, 9, 3, 9] },
  { id: 7, number: '0396.439.399', carrier: 'Viettel', prefix: '0396', source: 'Sim Thăng Long', price: 395000, available: true, type: 'Dễ nhớ', score: 84, lastChecked: '3 phút trước', pattern: '439 · 399', digits: [0, 3, 9, 6, 4, 3, 9, 3, 9, 9] },
  { id: 8, number: '0919.339.939', carrier: 'VinaPhone', prefix: '0919', source: 'Tổng Kho Sim', price: 900000, available: true, type: 'Lặp kép', score: 82, lastChecked: '4 phút trước', pattern: '33 · 939', digits: [0, 9, 1, 9, 3, 3, 9, 9, 3, 9] },
  { id: 9, number: '0938.689.339', carrier: 'VinaPhone', prefix: '0938', source: 'Siêu Thị Sim Thẻ', price: 520000, available: true, type: 'Lộc phát', score: 80, lastChecked: '4 phút trước', pattern: '68 · 339', digits: [0, 9, 3, 8, 6, 8, 9, 3, 3, 9] },
  { id: 10, number: '0903.939.868', carrier: 'MobiFone', prefix: '0903', source: 'Tổng Kho Sim', price: 1100000, available: true, type: 'Dễ nhớ', score: 78, lastChecked: '5 phút trước', pattern: '939 · 68', digits: [0, 9, 0, 3, 9, 3, 9, 8, 6, 8] }
]

const navItems = [
  ['⌕', 'Tìm SIM'],
  ['▤', 'Bộ lọc đã lưu'],
  ['◷', 'Lịch sử tìm kiếm'],
  ['↕', 'So sánh'],
  ['♡', 'Danh sách yêu thích']
]

const formatPrice = (value) => new Intl.NumberFormat('vi-VN').format(value) + ' ₫'

function Icon({ children }) {
  return <span className="icon" aria-hidden="true">{children}</span>
}

function App() {
  const [query, setQuery] = useState('*39')
  const [carrier, setCarrier] = useState('Viettel')
  const [prefix, setPrefix] = useState('09x')
  const [budget, setBudget] = useState('≤ 1 triệu')
  const [excluded, setExcluded] = useState('4, 7')
  const [sort, setSort] = useState('score')
  const [selectedId, setSelectedId] = useState(1)
  const [weights, setWeights] = useState({ beauty: 35, fengShui: 35, carrier: 15, value: 15 })
  const [notice, setNotice] = useState('')

  const filteredListings = useMemo(() => {
    const cleanedQuery = query.replace(/[^0-9*+]/g, '')
    const excludedDigits = excluded.split(',').map((item) => item.trim()).filter(Boolean)
    const maxBudget = budget === '≤ 500 nghìn' ? 500000 : budget === '≤ 1 triệu' ? 1000000 : budget === '≤ 3 triệu' ? 3000000 : Infinity
    const result = seedListings.filter((item) => {
      const number = item.number.replaceAll('.', '')
      const queryMatch = !cleanedQuery || cleanedQuery === '*' || cleanedQuery.split('*').filter(Boolean).every((part) => number.includes(part))
      const carrierMatch = carrier === 'Tất cả' || item.carrier === carrier
      const prefixMatch = prefix === 'Tất cả' || (prefix === '09x' ? item.prefix.startsWith('09') : item.prefix === prefix)
      const budgetMatch = item.price <= maxBudget
      const excludedMatch = !excludedDigits.some((digit) => digit && number.slice(2).includes(digit))
      return queryMatch && carrierMatch && prefixMatch && budgetMatch && excludedMatch
    })
    return [...result].sort((a, b) => sort === 'price' ? a.price - b.price : sort === 'recent' ? a.id - b.id : b.score - a.score)
  }, [query, carrier, prefix, budget, excluded, sort])

  const selected = filteredListings.find((item) => item.id === selectedId) || filteredListings[0] || seedListings[0]
  const scoreParts = selected ? [
    ['Độ đẹp & dễ nhớ', Math.round(selected.score * 0.31), weights.beauty, 'beauty'],
    ['Phong thủy tham khảo', Math.round(selected.score * 0.36), weights.fengShui, 'fengShui'],
    ['Nhà mạng & đầu số', Math.round(selected.score * 0.18), weights.carrier, 'carrier'],
    ['Giá trị trong ngân sách', Math.round(selected.score * 0.15), weights.value, 'value']
  ] : []

  const handleWeight = (key, value) => {
    const nextValue = Number(value)
    const remaining = 100 - nextValue
    const otherKeys = Object.keys(weights).filter((item) => item !== key)
    const otherTotal = otherKeys.reduce((sum, item) => sum + weights[item], 0) || 1
    const next = { ...weights, [key]: nextValue }
    otherKeys.forEach((item) => { next[item] = Math.max(0, Math.round(weights[item] * remaining / otherTotal)) })
    const diff = 100 - Object.values(next).reduce((sum, item) => sum + item, 0)
    next[otherKeys[0]] += diff
    setWeights(next)
  }

  const resetFilters = () => {
    setQuery('*39'); setCarrier('Viettel'); setPrefix('09x'); setBudget('≤ 1 triệu'); setExcluded('4, 7'); setSort('score')
    setNotice('Đã khôi phục bộ lọc mặc định')
    window.setTimeout(() => setNotice(''), 2200)
  }

  const runSearch = () => {
    setNotice(`Đã làm mới dữ liệu từ ${new Set(seedListings.map((item) => item.source)).size} nguồn mẫu`)
    window.setTimeout(() => setNotice(''), 2600)
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span>SIM</span> Scout</div>
        <nav className="nav-list">
          {navItems.map(([icon, label], index) => <button className={`nav-item ${index === 0 ? 'active' : ''}`} key={label}><Icon>{icon}</Icon><span>{label}</span></button>)}
        </nav>
        <div className="sidebar-bottom">
          <button className="nav-item"><Icon>⚙</Icon><span>Cài đặt</span></button>
          <button className="nav-item"><Icon>?</Icon><span>Trợ giúp</span></button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div><h1>Tìm SIM</h1><p>Tìm, phân tích và chọn số phù hợp với tiêu chí của bạn.</p></div>
          <div className="sync-status"><span className="status-dot" /> Dữ liệu mẫu · cập nhật vừa xong</div>
        </header>

        <section className="search-row">
          <div className="search-input-wrap"><Icon>⌕</Icon><input value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && runSearch()} placeholder="Nhập số, đầu số hoặc mẫu tìm kiếm" aria-label="Mẫu tìm SIM" /><button className="clear-button" onClick={() => setQuery('')}>×</button></div>
          <button className="primary-button" onClick={runSearch}>Tìm kiếm</button>
        </section>

        <section className="filter-panel">
          <div className="panel-heading"><h2>Bộ lọc</h2><button className="text-button" onClick={resetFilters}><Icon>↻</Icon> Xóa bộ lọc</button></div>
          <div className="filters-grid">
            <label>Nhà mạng<select value={carrier} onChange={(event) => setCarrier(event.target.value)}><option>Tất cả</option><option>Viettel</option><option>VinaPhone</option><option>MobiFone</option></select></label>
            <label>Đầu số<select value={prefix} onChange={(event) => setPrefix(event.target.value)}><option>Tất cả</option><option>09x</option><option>096</option><option>097</option><option>098</option><option>086</option><option>03x</option></select></label>
            <label>Ngân sách<select value={budget} onChange={(event) => setBudget(event.target.value)}><option>Không giới hạn</option><option>≤ 500 nghìn</option><option>≤ 1 triệu</option><option>≤ 3 triệu</option></select></label>
            <label>Loại trừ<input value={excluded} onChange={(event) => setExcluded(event.target.value)} placeholder="Ví dụ: 4, 7 hoặc 49,79" /></label>
          </div>
        </section>

        <section className="results-panel">
          <div className="results-heading"><div><h2>Kết quả tìm kiếm <span>{filteredListings.length} kết quả</span></h2><p>Truy vấn live sẽ được kết nối sau khi hoàn thiện adapter từng nguồn.</p></div><div className="results-actions"><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="score">Sắp xếp: Điểm tổng (Cao → Thấp)</option><option value="price">Sắp xếp: Giá thấp → Cao</option><option value="recent">Sắp xếp: Mới cập nhật</option></select><button className="outline-button" onClick={() => setNotice('Tính năng xuất danh sách sẽ có trong bản tiếp theo')}><Icon>⇩</Icon> Xuất danh sách</button></div></div>
          <div className="table-wrap"><table><thead><tr><th>Số điện thoại</th><th>Nhà mạng</th><th>Đầu số</th><th>Nguồn</th><th>Giá (VND)</th><th>Tình trạng</th><th>Điểm tổng</th><th>Phân tích</th><th>Xem nguồn</th></tr></thead><tbody>{filteredListings.map((item) => <tr className={selected?.id === item.id ? 'selected-row' : ''} key={item.id} onClick={() => setSelectedId(item.id)}><td className="phone-number">{item.number}</td><td>{item.carrier}</td><td>{item.prefix}</td><td><span className="source-label">{item.source}</span></td><td>{formatPrice(item.price)}</td><td><span className="availability"><span /> Còn hàng</span></td><td className="score-cell">{item.score}</td><td><button className="row-icon" onClick={(event) => { event.stopPropagation(); setSelectedId(item.id) }} title="Xem phân tích">▥</button></td><td><a className="row-icon" href="#source" onClick={(event) => event.stopPropagation()} title="Mở nguồn">⊙</a></td></tr>)}</tbody></table>{filteredListings.length === 0 && <div className="empty-state">Không có SIM phù hợp với bộ lọc hiện tại. Hãy nới ngân sách hoặc bỏ bớt điều kiện loại trừ.</div>}</div>
          <div className="table-footer"><span>Hiển thị {filteredListings.length} trong tổng số {seedListings.length} kết quả mẫu</span><div className="pagination"><button disabled>‹</button><button className="current-page">1</button><button>2</button><button>3</button><span>…</span><button>›</button></div></div>
        </section>
      </main>

      <aside className="insight-panel">
        <div className="score-header"><div><span className="eyebrow">SIM đang chọn</span><h2>{selected?.number || '—'}</h2></div><button className="heart-button">♡</button></div>
        <div className="total-score"><span className="score-number">{selected?.score || 0}</span><span className="score-denominator">/100</span><strong>{selected?.score >= 90 ? 'Rất tốt' : selected?.score >= 80 ? 'Tốt' : 'Cần cân nhắc'}</strong></div>
        <div className="divider" />
        <div className="insight-heading"><h2>Phân tích chi tiết</h2><p>Điểm được tính từ các nhóm tiêu chí có thể điều chỉnh.</p></div>
        <div className="score-breakdown">{scoreParts.map(([label, score, weight, key]) => <div className="score-part" key={key}><div className="part-label"><span>{label}</span><span>{weight}% <b>{score}/30</b></span></div><div className="progress"><span style={{ width: `${Math.min(100, score / 30 * 100)}%` }} /></div><label className="weight-control">Trọng số <input type="range" min="0" max="70" value={weight} onChange={(event) => handleWeight(key, event.target.value)} /></label></div>)}</div>
        <div className="quick-explanation"><h3>Giải thích nhanh</h3><ul><li>Đuôi số chứa cụm {selected?.pattern || 'ưu tiên'}</li><li>Không xuất hiện số bị loại trừ trong thân số</li><li>Đầu số {selected?.prefix} thuộc nhóm được ưu tiên</li><li>Giá nằm trong preset ngân sách hiện tại</li></ul></div>
        <div className="note-box"><strong>Lưu ý:</strong> Điểm phong thủy chỉ mang tính tham khảo theo bộ quy tắc đã chọn, không phải cam kết về kết quả thực tế. Giá và trạng thái SIM có thể thay đổi theo nguồn bán.</div>
      </aside>

      {notice && <div className="toast">{notice}</div>}
    </div>
  )
}

createRoot(document.getElementById('root')).render(<App />)
