import { jsPDF } from 'jspdf'
import { fmt, pct, clamp } from '../utils/helpers'
import { getCurrency } from '../utils/helpers'

function hex2rgb(h) {
  const r = parseInt(h.slice(1, 3), 16)
  const g = parseInt(h.slice(3, 5), 16)
  const b = parseInt(h.slice(5, 7), 16)
  return [r, g, b]
}

export async function generatePDF({
  archDef, incomes, expenses, goals, debts, cashflow,
  totalIncome, totalExpenses, netSurplus, totalDebt, totalDebtPayment,
  savingsRateCalc, dti, healthScore, netWorthBase,
  pdfSections, onProgress,
}) {
  const C = getCurrency()
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' })
  const W = 595, M = 52, CW = W - M * 2
  const now = new Date()
  const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
  let y = 0, pg = 1

  const setFont = (size, weight = 'normal', color = [17, 17, 17]) => {
    doc.setFontSize(size); doc.setFont('helvetica', weight); doc.setTextColor(...color)
  }
  const newPage = () => { doc.addPage(); pg++; y = M; drawHeader() }
  const ensure = (need) => { if (y + need > 820) newPage() }

  const drawGradientRect = (x, ry, rw, rh) => {
    for (let i = 0; i < rw; i++) {
      const t = i / rw
      const r = Math.round(79 + (124 - 79) * t)
      const g = Math.round(142 + (58 - 142) * t)
      const b = Math.round(247 + (237 - 247) * t)
      doc.setDrawColor(r, g, b); doc.setFillColor(r, g, b); doc.rect(x + i, ry, 1, rh, 'F')
    }
  }

  const drawHeader = () => {
    drawGradientRect(M, y, CW, 3); y += 10
    setFont(8, 'normal', [156, 163, 175])
    doc.text('FinanceOS — Universal Budget Dashboard', M, y)
    doc.text('Page ' + pg + ' | ' + dateStr, W - M, y, { align: 'right' })
    y += 14
    doc.setDrawColor(229, 231, 235); doc.setLineWidth(0.5); doc.line(M, y, W - M, y); y += 14
  }

  // ── Cover Page ──
  y = M
  doc.setFillColor(79, 142, 247); doc.roundedRect(M, y, 36, 36, 6, 6, 'F')
  doc.setFillColor(124, 58, 237); doc.roundedRect(M + 18, y, 18, 36, 0, 6, 'F')
  setFont(22, 'bold', [255, 255, 255]); doc.text('F', M + 10, y + 24)
  setFont(26, 'bold', [17, 17, 17]); doc.text('FinanceOS', M + 46, y + 26)
  setFont(11, 'normal', [107, 114, 128]); doc.text('Universal Budget Dashboard — ' + archDef.label, M + 46, y + 40)
  y += 60; drawGradientRect(M, y, CW, 3); y += 20

  setFont(32, 'bold', [17, 17, 17]); doc.text('Financial Report', M, y); y += 40
  setFont(13, 'normal', [107, 114, 128])
  doc.text('Generated: ' + dateStr, M, y); y += 18
  doc.text('Archetype: ' + archDef.label, M, y); y += 18
  doc.text('Currency: ' + C.name + ' (' + C.code + ') ' + C.flag, M, y); y += 18
  doc.text('Sections: ' + Object.entries(pdfSections).filter(([, v]) => v).map(([k]) => k).join(', '), M, y, { maxWidth: CW }); y += 30

  onProgress(12)

  // Hero KPIs
  const heroKPIs = [
    { l: 'Monthly Income',   v: fmt(totalIncome),   c: [56, 217, 169] },
    { l: 'Monthly Expenses', v: fmt(totalExpenses), c: [248, 113, 113] },
    { l: 'Net Surplus',      v: fmt(netSurplus),    c: netSurplus >= 0 ? [56, 217, 169] : [248, 113, 113] },
    { l: 'Net Worth',        v: fmt(netWorthBase + netSurplus, true), c: [79, 142, 247] },
  ]
  const kW = (CW - 30) / 4
  heroKPIs.forEach((k, i) => {
    const kx = M + i * (kW + 10)
    doc.setFillColor(249, 250, 251); doc.setDrawColor(229, 231, 235); doc.roundedRect(kx, y, kW, 68, 6, 6, 'FD')
    setFont(9, 'bold', [156, 163, 175]); doc.text(k.l.toUpperCase(), kx + 10, y + 16)
    setFont(15, 'bold', k.c); doc.text(k.v, kx + 10, y + 36)
    setFont(9, 'normal', [156, 163, 175]); doc.text('Jun 2025', kx + 10, y + 52)
  }); y += 84

  // Health Score box
  const hColor = healthScore >= 75 ? [22, 163, 74] : healthScore >= 55 ? [161, 98, 7] : [185, 28, 28]
  const hBg = healthScore >= 75 ? [240, 253, 244] : healthScore >= 55 ? [254, 252, 232] : [254, 226, 226]
  const hBorder = healthScore >= 75 ? [187, 247, 208] : healthScore >= 55 ? [253, 224, 132] : [252, 165, 165]
  doc.setFillColor(...hBg); doc.setDrawColor(...hBorder); doc.roundedRect(M, y, CW, 64, 8, 8, 'FD')
  setFont(36, 'bold', hColor); doc.text(String(healthScore), M + 20, y + 44)
  setFont(13, 'bold', [17, 17, 17]); doc.text('/100 — Budget Health Score', M + 70, y + 30)
  setFont(11, 'normal', [107, 114, 128])
  doc.text('Savings rate: ' + savingsRateCalc.toFixed(1) + '% · DTI: ' + dti.toFixed(1) + '% · Surplus: ' + fmt(netSurplus), M + 70, y + 48)
  y += 80

  // Sub KPIs
  const subKPIs = [
    { l: 'Debt-to-Income', v: dti.toFixed(1) + '%', note: dti <= 35 ? 'Healthy' : 'Elevated' },
    { l: 'Savings Rate',   v: savingsRateCalc.toFixed(1) + '%', note: savingsRateCalc >= 20 ? 'Excellent' : 'Moderate' },
    { l: 'Expense Ratio',  v: totalIncome > 0 ? pct(totalExpenses, totalIncome) : '—', note: 'of income' },
    { l: 'Total Debt',     v: fmt(totalDebt, true), note: 'Combined' },
  ]
  const sW = (CW - 30) / 4
  subKPIs.forEach((k, i) => {
    const sx = M + i * (sW + 10)
    doc.setFillColor(249, 250, 251); doc.setDrawColor(229, 231, 235); doc.roundedRect(sx, y, sW, 52, 6, 6, 'FD')
    setFont(8, 'bold', [156, 163, 175]); doc.text(k.l.toUpperCase(), sx + 8, y + 14)
    setFont(14, 'bold', [17, 17, 17]); doc.text(k.v, sx + 8, y + 32)
    setFont(8, 'normal', [156, 163, 175]); doc.text(k.note, sx + 8, y + 46)
  }); y += 68

  onProgress(20)

  // ── Content Sections ──
  const sectionDefs = [
    { key: 'income',           title: 'Income Sources',             icon: '💰' },
    { key: 'expenses',         title: 'Expense Breakdown',          icon: '💳' },
    { key: 'cashflow',         title: 'Cash Flow — 6 Months',       icon: '📈' },
    { key: 'goals',            title: 'Savings Goals & FIRE',       icon: '🎯' },
    { key: 'debts',            title: 'Liability Manager',          icon: '🏦' },
    { key: 'scenarios',        title: 'Stress Testing',             icon: '⚡' },
    { key: 'recommendations',  title: 'Action Plan',                icon: '✅' },
  ]

  let progress = 20
  const progStep = 72 / sectionDefs.length

  for (const sec of sectionDefs) {
    if (!pdfSections[sec.key]) continue
    progress += progStep; onProgress(Math.round(progress))
    newPage()

    drawGradientRect(M, y, CW, 3); y += 18
    setFont(18, 'bold', [17, 17, 17]); doc.text(sec.icon + ' ' + sec.title, M, y); y += 24
    doc.setDrawColor(229, 231, 235); doc.line(M, y, W - M, y); y += 16

    // ── INCOME ──
    if (sec.key === 'income') {
      const cols = ['Income Source', 'Monthly Amount', '% of Total']
      const colW = [CW * 0.55, CW * 0.25, CW * 0.20]
      doc.setFillColor(243, 244, 246); doc.rect(M, y, CW, 18, 'F')
      setFont(9, 'bold', [107, 114, 128])
      let cx = M + 8
      cols.forEach((h, i) => { doc.text(h.toUpperCase(), cx + (i > 0 ? colW[i] - 8 : 0), y + 12, { align: i > 0 ? 'right' : 'left' }); cx += colW[i] })
      y += 20
      incomes.forEach((inc, idx) => {
        ensure(22)
        if (idx % 2 === 0) { doc.setFillColor(249, 250, 251); doc.rect(M, y, CW, 20, 'F') }
        const rgb = hex2rgb(inc.color || '#38D9A9')
        doc.setFillColor(...rgb); doc.circle(M + 10, y + 10, 4, 'F')
        setFont(11, 'normal', [55, 65, 81]); doc.text(inc.name, M + 22, y + 13)
        setFont(11, 'bold', [55, 65, 81]); doc.text(fmt(inc.amt), M + colW[0] + colW[1] - 8, y + 13, { align: 'right' })
        setFont(10, 'normal', [107, 114, 128]); doc.text(pct(inc.amt, totalIncome), W - M - 8, y + 13, { align: 'right' })
        y += 20
      })
      ensure(30); y += 8
      doc.setFillColor(239, 246, 255); doc.setDrawColor(147, 197, 253); doc.roundedRect(M, y, CW, 28, 4, 4, 'FD')
      setFont(12, 'bold', [30, 64, 175]); doc.text('TOTAL MONTHLY INCOME', M + 12, y + 17)
      setFont(13, 'bold', [30, 64, 175]); doc.text(fmt(totalIncome), W - M - 12, y + 17, { align: 'right' })
      y += 40
    }

    // ── EXPENSES ──
    if (sec.key === 'expenses') {
      const sorted = [...expenses].sort((a, b) => b.amt - a.amt)
      const maxAmt = sorted[0]?.amt || 1
      sorted.forEach((exp, idx) => {
        ensure(40)
        setFont(11, 'normal', [55, 65, 81]); doc.text(exp.name, M, y + 12)
        setFont(11, 'bold', [17, 17, 17]); doc.text(fmt(exp.amt), W - M - 80, y + 12, { align: 'right' })
        setFont(10, 'normal', [107, 114, 128]); doc.text(pct(exp.amt, totalExpenses), W - M, y + 12, { align: 'right' })
        const bw = CW - 180
        doc.setFillColor(229, 231, 235); doc.roundedRect(M, y + 16, bw, 7, 3, 3, 'F')
        const rgb = hex2rgb(exp.color || '#4F8EF7')
        doc.setFillColor(...rgb); doc.roundedRect(M, y + 16, bw * (exp.amt / maxAmt), 7, 3, 3, 'F')
        y += 30
      })
      ensure(30); y += 8
      doc.setFillColor(255, 241, 242); doc.setDrawColor(252, 165, 165); doc.roundedRect(M, y, CW, 28, 4, 4, 'FD')
      setFont(12, 'bold', [185, 28, 28]); doc.text('TOTAL MONTHLY EXPENSES', M + 12, y + 17)
      setFont(13, 'bold', [185, 28, 28]); doc.text(fmt(totalExpenses), W - M - 12, y + 17, { align: 'right' })
      y += 40
    }

    // ── CASHFLOW ──
    if (sec.key === 'cashflow') {
      const cfCols = ['Month', 'Income', 'Expenses', 'Net', 'Rate', 'Status']
      const cfW = [CW * 0.12, CW * 0.18, CW * 0.18, CW * 0.18, CW * 0.17, CW * 0.17]
      doc.setFillColor(243, 244, 246); doc.rect(M, y, CW, 18, 'F')
      setFont(9, 'bold', [107, 114, 128])
      let hx = M + 6; cfCols.forEach((h, i) => { doc.text(h.toUpperCase(), hx, y + 12); hx += cfW[i] })
      y += 20
      cashflow.forEach((d, idx) => {
        ensure(22)
        if (idx % 2 === 0) { doc.setFillColor(249, 250, 251); doc.rect(M, y, CW, 20, 'F') }
        let rx = M + 6
        const cells = [d.m, fmt(d.income, true), fmt(d.expense, true), fmt(d.net, true), pct(d.net, d.income), d.net > 0 ? 'Surplus' : 'Deficit']
        const colors = [[55, 65, 81], [22, 163, 74], [185, 28, 28], d.net >= 0 ? [22, 163, 74] : [185, 28, 28], [107, 114, 128], d.net > 0 ? [22, 163, 74] : [185, 28, 28]]
        cells.forEach((cell, i) => { setFont(i === 0 ? 11 : 10, i === 0 ? 'bold' : 'normal', colors[i]); doc.text(String(cell), rx, y + 13); rx += cfW[i] })
        y += 20
      })
      ensure(50); y += 12
      const avgI = Math.round(cashflow.reduce((a, d) => a + d.income, 0) / cashflow.length)
      const avgE = Math.round(cashflow.reduce((a, d) => a + d.expense, 0) / cashflow.length)
      const avgN = Math.round(cashflow.reduce((a, d) => a + d.net, 0) / cashflow.length)
      const sumBoxes = [
        { l: 'Avg Monthly Income', v: fmt(avgI, true), c: [22, 163, 74] },
        { l: 'Avg Monthly Expenses', v: fmt(avgE, true), c: [185, 28, 28] },
        { l: 'Avg Net Surplus', v: fmt(avgN, true), c: [79, 142, 247] },
      ]
      const sbW = (CW - 20) / 3
      sumBoxes.forEach((b, i) => {
        const bx = M + i * (sbW + 10)
        doc.setFillColor(249, 250, 251); doc.setDrawColor(229, 231, 235); doc.roundedRect(bx, y, sbW, 48, 6, 6, 'FD')
        setFont(9, 'bold', [156, 163, 175]); doc.text(b.l.toUpperCase(), bx + 8, y + 14)
        setFont(15, 'bold', b.c); doc.text(b.v, bx + 8, y + 34)
      }); y += 60
    }

    // ── GOALS ──
    if (sec.key === 'goals') {
      goals.forEach((g) => {
        ensure(60)
        const pctVal = Math.min(100, g.saved / g.target * 100)
        const mthsLeft = g.monthly > 0 && g.saved < g.target ? Math.ceil((g.target - g.saved) / g.monthly) : null
        doc.setFillColor(249, 250, 251); doc.setDrawColor(229, 231, 235); doc.roundedRect(M, y, CW, 52, 6, 6, 'FD')
        const rgb = hex2rgb(g.color || '#38D9A9')
        doc.setFillColor(...rgb); doc.roundedRect(M, y, 5, 52, 3, 3, 'F')
        setFont(12, 'bold', [17, 17, 17]); doc.text(g.name, M + 16, y + 16)
        setFont(10, 'normal', [107, 114, 128])
        doc.text(fmt(g.saved, true) + ' saved of ' + fmt(g.target, true) + (mthsLeft ? ' · ~' + mthsLeft + ' months' : ''), M + 16, y + 28)
        doc.setFillColor(229, 231, 235); doc.roundedRect(M + 16, y + 34, CW - 100, 8, 4, 4, 'F')
        doc.setFillColor(...rgb); doc.roundedRect(M + 16, y + 34, (CW - 100) * (pctVal / 100), 8, 4, 4, 'F')
        setFont(11, 'bold', [17, 17, 17]); doc.text(pctVal.toFixed(0) + '%', W - M - 8, y + 40, { align: 'right' })
        y += 62
      })
      ensure(64); y += 4
      const fireTarget = totalExpenses * 12 * 25
      const fireYrs = netSurplus > 0 ? Math.ceil((fireTarget - netWorthBase) / (netSurplus * 12)) : 999
      const firePct = Math.min(100, netWorthBase / fireTarget * 100)
      doc.setFillColor(239, 246, 255); doc.setDrawColor(147, 197, 253); doc.roundedRect(M, y, CW, 64, 8, 8, 'FD')
      setFont(11, 'bold', [30, 64, 175]); doc.text('🔥 FIRE Progress — Financial Independence', M + 12, y + 16)
      setFont(10, 'normal', [107, 114, 128])
      doc.text('Target: ' + fmt(fireTarget, true) + ' · Est. ' + (fireYrs > 100 ? '100+' : fireYrs) + ' years at current savings rate', M + 12, y + 30)
      doc.setFillColor(219, 234, 254); doc.roundedRect(M + 12, y + 38, CW - 24, 10, 5, 5, 'F')
      doc.setFillColor(79, 142, 247); doc.roundedRect(M + 12, y + 38, (CW - 24) * (firePct / 100), 10, 5, 5, 'F')
      setFont(10, 'bold', [30, 64, 175]); doc.text(firePct.toFixed(1) + '% reached', W - M - 12, y + 56, { align: 'right' })
      y += 76
    }

    // ── DEBTS ──
    if (sec.key === 'debts') {
      if (!debts.length) {
        setFont(12, 'normal', [107, 114, 128]); doc.text('No liabilities recorded.', M, y); y += 24
      } else {
        debts.forEach((d) => {
          ensure(58)
          doc.setFillColor(255, 247, 237); doc.setDrawColor(253, 186, 116); doc.roundedRect(M, y, CW, 50, 6, 6, 'FD')
          setFont(13, 'bold', [17, 17, 17]); doc.text(d.name, M + 12, y + 16)
          setFont(10, 'normal', [107, 114, 128]); doc.text(d.type + (d.rate > 0 ? ' · ' + d.rate + '% APR' : ''), M + 12, y + 28)
          setFont(15, 'bold', [185, 28, 28]); doc.text(fmt(d.balance, true), W - M - 12, y + 20, { align: 'right' })
          setFont(10, 'normal', [107, 114, 128])
          doc.text(fmt(d.payment) + '/mo' + (d.payment > 0 ? ' · ~' + Math.ceil(d.balance / d.payment) + ' months' : ''), W - M - 12, y + 34, { align: 'right' })
          y += 60
        })
        ensure(32); y += 8
        doc.setFillColor(255, 241, 242); doc.setDrawColor(252, 165, 165); doc.roundedRect(M, y, CW, 28, 4, 4, 'FD')
        setFont(12, 'bold', [185, 28, 28]); doc.text('TOTAL DEBT', M + 12, y + 17)
        setFont(13, 'bold', [185, 28, 28]); doc.text(fmt(totalDebt, true), W - M - 12, y + 17, { align: 'right' })
        y += 40
      }
    }

    // ── SCENARIOS ──
    if (sec.key === 'scenarios') {
      const scenList = [
        { name: 'Income Loss — 3 months',    impact: -(totalIncome * 3),         desc: 'Simulates complete income disruption for 90 days.' },
        { name: 'Interest Rate Shock +3%',   impact: -(totalDebt * 0.03 / 12),   desc: '300bps rise on all floating-rate obligations.' },
        { name: 'Inflation Spike +8%',       impact: -(totalExpenses * 0.08),    desc: 'All variable costs rise 8% for 12 months.' },
      ]
      scenList.forEach((s, i) => {
        ensure(72)
        const bg     = i === 0 ? [255, 247, 237] : [255, 251, 235]
        const border = i === 0 ? [253, 186, 116] : [253, 224, 132]
        doc.setFillColor(...bg); doc.setDrawColor(...border); doc.roundedRect(M, y, CW, 64, 8, 8, 'FD')
        setFont(13, 'bold', [17, 17, 17]); doc.text(s.name, M + 14, y + 18)
        setFont(10, 'normal', [107, 114, 128]); doc.text(s.desc, M + 14, y + 30, { maxWidth: CW - 120 })
        setFont(18, 'bold', [194, 65, 12]); doc.text(fmt(s.impact, true), W - M - 14, y + 26, { align: 'right' })
        setFont(9, 'normal', [107, 114, 128]); doc.text('monthly impact', W - M - 14, y + 38, { align: 'right' })
        const stressedNet = cashflow.reduce((a, d) => a + Math.max(0, d.net + s.impact / 6), 0)
        setFont(10, 'normal', [107, 114, 128])
        doc.text('Stressed 6-month net: ' + fmt(stressedNet, true), M + 14, y + 48)
        doc.text('Reserve months: ' + (netWorthBase / Math.max(totalExpenses, 1)).toFixed(1), M + 14, y + 58)
        y += 74
      })
    }

    // ── RECOMMENDATIONS ──
    if (sec.key === 'recommendations') {
      const recs = []
      if (savingsRateCalc < 20) recs.push({
        priority: 'HIGH', icon: '📊', title: 'Increase Savings Rate',
        body: 'Current savings rate: ' + savingsRateCalc.toFixed(1) + '%. Targeting 20% requires saving an additional ' + fmt(totalIncome * 0.2 - netSurplus) + '/month. Reduce ' + (expenses.sort((a, b) => b.amt - a.amt)[0]?.name || 'top category') + ' first.',
      })
      if (dti > 35) recs.push({
        priority: 'HIGH', icon: '💳', title: 'Reduce Debt Load',
        body: 'DTI of ' + dti.toFixed(1) + '% exceeds the 35% ceiling. Apply the avalanche method — target ' + ([...debts].sort((a, b) => b.rate - a.rate)[0]?.name || 'highest-rate debt') + ' first.',
      })
      if (netWorthBase / Math.max(totalExpenses, 1) < 3) recs.push({
        priority: 'MEDIUM', icon: '🛡️', title: 'Build Emergency Reserve',
        body: 'You have ' + (netWorthBase / Math.max(totalExpenses, 1)).toFixed(1) + ' months of reserves. Target 3–6 months (' + fmt(totalExpenses * 3, true) + ' – ' + fmt(totalExpenses * 6, true) + ').',
      })
      recs.push({
        priority: 'OPPORTUNITY', icon: '📈', title: 'Automate Surplus Investment',
        body: 'Your monthly surplus of ' + fmt(netSurplus) + ' invested at 7% annual return would grow to ' + fmt(Math.round(netSurplus * 12 * ((Math.pow(1.07, 10) - 1) / 0.07)), true) + ' in 10 years.',
      })
      recs.forEach((r) => {
        ensure(70)
        const pColor = r.priority === 'HIGH' ? [185, 28, 28] : r.priority === 'MEDIUM' ? [161, 98, 7] : [22, 101, 52]
        const pBg    = r.priority === 'HIGH' ? [254, 226, 226] : r.priority === 'MEDIUM' ? [254, 252, 232] : [240, 253, 244]
        const pBorder= r.priority === 'HIGH' ? [252, 165, 165] : r.priority === 'MEDIUM' ? [253, 224, 132] : [187, 247, 208]
        doc.setFillColor(...pBg); doc.setDrawColor(...pBorder); doc.roundedRect(M, y, CW, 62, 6, 6, 'FD')
        doc.setFillColor(...pColor); doc.roundedRect(M, y, 5, 62, 3, 0, 'F')
        setFont(8, 'bold', pColor); doc.text(r.priority, M + 12, y + 12)
        setFont(13, 'bold', [17, 17, 17]); doc.text(r.icon + ' ' + r.title, M + 12, y + 24)
        setFont(10, 'normal', [55, 65, 81])
        const lines = doc.splitTextToSize(r.body, CW - 28)
        lines.forEach((l, li) => doc.text(l, M + 12, y + 36 + li * 13))
        y += 72
      })
    }
  }

  // Page numbers
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setDrawColor(229, 231, 235); doc.setLineWidth(0.5); doc.line(M, 820, W - M, 820)
    setFont(9, 'normal', [156, 163, 175])
    doc.text('FinanceOS — Confidential Financial Report · ' + dateStr, M, 830)
    doc.text('Page ' + i + ' of ' + totalPages, W - M, 830, { align: 'right' })
  }

  onProgress(98)
  await new Promise(r => setTimeout(r, 150))
  doc.save('FinanceOS_Report_' + now.toISOString().slice(0, 10) + '.pdf')
  onProgress(100)
}
