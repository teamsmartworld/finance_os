import { useState, useEffect, useRef } from 'react'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  ComposedChart, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts'
import { ARCHETYPES, CURRENCIES, COLORS, NET_WORTH_DEFAULTS, makeDefaults } from './data/constants'
import { setCurrencyCode, fmt, pct, clamp, calcHealthScore, buildCashflow } from './utils/helpers'
import { generatePDF } from './utils/pdfGenerator'
import { CustomTooltip, HealthScore, SparkLine } from './components/Charts'

/* ──────────────────────────────────────
   PAGE: OVERVIEW
────────────────────────────────────── */
function Overview({ incomes, expenses, goals, debts, cashflow, totalIncome, totalExpenses, netSurplus, netWorthBase, healthScore, savingsRateCalc, dti }) {
  return (
    <div style={{ display:'flex',flexDirection:'column',gap:14 }}>
      <div className="g4">
        {[
          { l:'Monthly Income',   v:fmt(totalIncome),  cls:'var(--green)', chg:'+3.0% vs last month', up:true },
          { l:'Monthly Expenses', v:fmt(totalExpenses),cls:'var(--red)',   chg:'+0.5% vs last month', up:false },
          { l:'Net Surplus',      v:fmt(netSurplus),   cls:netSurplus>=0?'var(--green)':'var(--red)', chg:savingsRateCalc.toFixed(1)+'% savings rate', up:netSurplus>=0 },
          { l:'Net Worth',        v:fmt(netWorthBase+netSurplus,true), cls:'var(--text)', chg:'Updated live', up:true },
        ].map((k,i) => (
          <div key={i} className="card">
            <div className="kpi-lbl">{k.l}</div>
            <div className="kpi-val" style={{color:k.cls,fontSize:20}}>{k.v}</div>
            <div className="kpi-chg" style={{color:k.up?'var(--green)':'var(--red)',fontSize:11}}>
              <i className={`ti ti-trending-${k.up?'up':'down'}`} style={{fontSize:12}}/>
              {k.chg}
            </div>
          </div>
        ))}
      </div>

      <div className="g4">
        {[
          { l:'Debt-to-Income', v:dti.toFixed(1)+'%',             col:dti<=35?'var(--green)':'var(--red)',    note:dti<=35?'Healthy':'Elevated' },
          { l:'Savings Rate',   v:savingsRateCalc.toFixed(1)+'%', col:savingsRateCalc>=20?'var(--green)':savingsRateCalc>=10?'var(--amber)':'var(--red)', note:savingsRateCalc>=20?'Excellent':'Moderate' },
          { l:'Expense Ratio',  v:totalIncome>0?pct(totalExpenses,totalIncome):'—', col:totalExpenses/Math.max(totalIncome,1)<.8?'var(--green)':'var(--red)', note:'of income' },
          { l:'Budget Health',  v:healthScore+'/100', col:healthScore>=75?'var(--green)':healthScore>=55?'var(--amber)':'var(--red)', note:healthScore>=75?'Excellent':'Moderate' },
        ].map((k,i) => (
          <div key={i} className="card-sm">
            <div style={{fontSize:10,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:3}}>{k.l}</div>
            <div style={{fontSize:17,fontWeight:600,fontFamily:'var(--mono)',color:k.col}}>{k.v}</div>
            <div style={{fontSize:10,color:'var(--text3)',marginTop:2}}>{k.note}</div>
          </div>
        ))}
      </div>

      <div className="g21">
        <div className="card">
          <div className="stitle">
            <i className="ti ti-chart-area"/>Cash Flow — 6 Month Projection
            <span className="ml"><span className="live-badge"><span className="live-dot"/>LIVE</span></span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={cashflow} margin={{top:4,right:4,left:-14,bottom:0}}>
              <defs>
                <linearGradient id="gi" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#38D9A9" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#38D9A9" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="ge" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#F87171" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#F87171" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
              <XAxis dataKey="m" tick={{fill:'var(--text3)',fontSize:11}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:'var(--text3)',fontSize:10}} axisLine={false} tickLine={false} tickFormatter={v=>fmt(v,true)}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Legend wrapperStyle={{fontSize:11,color:'var(--text3)'}}/>
              <Area type="monotone" dataKey="income"  name="Income"   stroke="#38D9A9" strokeWidth={2} fill="url(#gi)"/>
              <Area type="monotone" dataKey="expense" name="Expenses" stroke="#F87171" strokeWidth={2} fill="url(#ge)"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <div className="stitle"><i className="ti ti-chart-donut"/>Spending Mix</div>
          <ResponsiveContainer width="100%" height={110}>
            <PieChart>
              <Pie data={expenses} cx="50%" cy="50%" innerRadius={32} outerRadius={50} dataKey="amt" paddingAngle={2}>
                {expenses.map((e,i) => <Cell key={i} fill={e.color}/>)}
              </Pie>
              <Tooltip formatter={v=>fmt(v)}/>
            </PieChart>
          </ResponsiveContainer>
          {expenses.slice(0,5).map((e,i) => (
            <div key={i} style={{display:'flex',alignItems:'center',gap:8,padding:'5px 0',borderBottom:'1px solid var(--border)'}}>
              <div style={{width:7,height:7,borderRadius:'50%',background:e.color,flexShrink:0}}/>
              <span style={{flex:1,fontSize:12}}>{e.name}</span>
              <span style={{fontSize:11,fontFamily:'var(--mono)',color:'var(--text2)'}}>{fmt(e.amt,true)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="g21">
        <div className="card">
          <div className="stitle"><i className="ti ti-list-details"/>Income Sources</div>
          {incomes.map((inc,i) => (
            <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0',borderBottom:'1px solid var(--border)'}}>
              <div style={{width:8,height:8,borderRadius:'50%',background:inc.color,flexShrink:0}}/>
              <span style={{flex:1,fontSize:13}}>{inc.name}</span>
              <span style={{fontSize:12,fontFamily:'var(--mono)',color:'var(--green)'}}>+{fmt(inc.amt,true)}</span>
              <span style={{fontSize:11,color:'var(--text3)',width:38,textAlign:'right'}}>{pct(inc.amt,totalIncome)}</span>
            </div>
          ))}
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:13}}>
          <div className="card"><HealthScore score={healthScore}/></div>
          <div className="card">
            <div className="stitle" style={{marginBottom:8}}><i className="ti ti-trending-up"/>Net Surplus Trend</div>
            <SparkLine data={cashflow} color="var(--green)"/>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ──────────────────────────────────────
   PAGE: CASHFLOW
────────────────────────────────────── */
function CashFlow({ cashflow }) {
  const avg = f => Math.round(cashflow.reduce((a,d)=>a+d[f],0)/cashflow.length)
  const cum  = cashflow.map((d,i,a)=>({m:d.m,cum:a.slice(0,i+1).reduce((s,x)=>s+x.net,0)}))
  return (
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      <div className="g3">
        {[
          {l:'Avg Monthly Income',   v:fmt(avg('income'),true),  c:'var(--green)'},
          {l:'Avg Monthly Expenses', v:fmt(avg('expense'),true), c:'var(--red)'},
          {l:'Avg Net Surplus',      v:fmt(avg('net'),true),     c:'var(--blue)'},
        ].map((k,i)=>(
          <div key={i} className="card">
            <div className="kpi-lbl">{k.l}</div>
            <div className="kpi-val" style={{color:k.c,fontSize:19}}>{k.v}</div>
          </div>
        ))}
      </div>
      <div className="card">
        <div className="stitle">
          <i className="ti ti-chart-bar"/>Income vs Expenses + Net Line
          <span className="ml"><span className="live-badge"><span className="live-dot"/>LIVE</span></span>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={cashflow} margin={{top:4,right:4,left:-12,bottom:0}}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
            <XAxis dataKey="m" tick={{fill:'var(--text3)',fontSize:11}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fill:'var(--text3)',fontSize:10}} axisLine={false} tickLine={false} tickFormatter={v=>fmt(v,true)}/>
            <Tooltip content={<CustomTooltip/>}/>
            <Legend wrapperStyle={{fontSize:11,color:'var(--text3)'}}/>
            <Bar dataKey="income"  name="Income"   fill="#38D9A9" fillOpacity={0.8} radius={[4,4,0,0]}/>
            <Bar dataKey="expense" name="Expenses" fill="#F87171" fillOpacity={0.8} radius={[4,4,0,0]}/>
            <Line type="monotone" dataKey="net" name="Net Surplus" stroke="#4F8EF7" strokeWidth={2.5} dot={{fill:'#4F8EF7',r:4}}/>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="card">
        <div className="stitle"><i className="ti ti-chart-area"/>Cumulative Net Position</div>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={cum} margin={{top:4,right:4,left:-12,bottom:0}}>
            <defs>
              <linearGradient id="gc" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#4F8EF7" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#4F8EF7" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
            <XAxis dataKey="m" tick={{fill:'var(--text3)',fontSize:11}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fill:'var(--text3)',fontSize:10}} axisLine={false} tickLine={false} tickFormatter={v=>fmt(v,true)}/>
            <Tooltip formatter={v=>fmt(v)}/>
            <Area type="monotone" dataKey="cum" name="Cumulative Surplus" stroke="#4F8EF7" strokeWidth={2.5} fill="url(#gc)"/>
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

/* ──────────────────────────────────────
   PAGE: BUDGET
────────────────────────────────────── */
function Budget({ expenses, totalExpenses }) {
  return (
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      <div className="g2">
        <div className="card">
          <div className="stitle">
            <i className="ti ti-chart-donut"/>Budget Allocation
            <span className="ml"><span className="live-badge"><span className="live-dot"/>LIVE</span></span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={expenses} cx="50%" cy="50%" innerRadius={58} outerRadius={88} dataKey="amt" paddingAngle={3}
                label={({name,percent})=>name.slice(0,10)+' '+(percent*100).toFixed(0)+'%'} labelLine>
                {expenses.map((e,i)=><Cell key={i} fill={e.color}/>)}
              </Pie>
              <Tooltip formatter={v=>fmt(v)}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <div className="stitle"><i className="ti ti-list"/>Category Breakdown</div>
          {expenses.map((e,i)=>(
            <div key={i} style={{marginBottom:9}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
                <span style={{fontSize:12}}>{e.name}</span>
                <span style={{fontSize:12,fontFamily:'var(--mono)',color:'var(--text2)'}}>{fmt(e.amt,true)} ({pct(e.amt,totalExpenses)})</span>
              </div>
              <div className="pbar">
                <div className="pfill" style={{width:clamp(e.amt/Math.max(...expenses.map(x=>x.amt)),0,1)*100+'%',background:e.color}}/>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="card">
        <div className="stitle"><i className="ti ti-chart-bar"/>Spending by Category</div>
        <ResponsiveContainer width="100%" height={210}>
          <BarChart data={expenses} margin={{top:4,right:4,left:-12,bottom:32}}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
            <XAxis dataKey="name" tick={{fill:'var(--text3)',fontSize:10}} axisLine={false} tickLine={false} angle={-25} textAnchor="end" interval={0}/>
            <YAxis tick={{fill:'var(--text3)',fontSize:10}} axisLine={false} tickLine={false} tickFormatter={v=>fmt(v,true)}/>
            <Tooltip formatter={v=>fmt(v)}/>
            <Bar dataKey="amt" name="Amount" radius={[4,4,0,0]}>
              {expenses.map((e,i)=><Cell key={i} fill={e.color} fillOpacity={0.85}/>)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

/* ──────────────────────────────────────
   PAGE: GOALS
────────────────────────────────────── */
function Goals({ goals, netWorthBase, totalIncome, totalExpenses, netSurplus }) {
  const fireTarget = totalExpenses * 12 * 25
  const fireYrs = netSurplus > 0 ? Math.ceil((fireTarget - netWorthBase) / (netSurplus * 12)) : 999
  return (
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      <div className="card">
        <div className="stitle">
          <i className="ti ti-target"/>Savings Goals
          <span className="ml"><span className="live-badge"><span className="live-dot"/>LIVE</span></span>
        </div>
        {goals.map((g,i)=>{
          const mthsLeft = g.monthly>0&&g.saved<g.target ? Math.ceil((g.target-g.saved)/g.monthly) : null
          return (
            <div key={i} style={{marginBottom:16}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                <span style={{fontSize:13,fontWeight:500}}>{g.name}</span>
                <span style={{fontSize:12,fontFamily:'var(--mono)',color:'var(--text2)'}}>{fmt(g.saved,true)} / {fmt(g.target,true)}</span>
              </div>
              <div className="pbar" style={{height:8}}>
                <div className="pfill" style={{width:clamp(g.saved/g.target*100,0,100).toFixed(0)+'%',background:g.color}}/>
              </div>
              <div style={{fontSize:11,color:'var(--text3)',marginTop:3}}>
                {clamp(g.saved/g.target*100,0,100).toFixed(0)}% complete · {fmt(Math.max(0,g.target-g.saved),true)} remaining
                {mthsLeft ? ` · ~${mthsLeft} months at ${fmt(g.monthly)}/mo` : ''}
              </div>
            </div>
          )
        })}
      </div>
      <div className="card">
        <div className="stitle">
          <i className="ti ti-flame"/>FIRE Progress
          <span className="ml"><span className="live-badge"><span className="live-dot"/>LIVE</span></span>
        </div>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
          <span style={{fontSize:12,color:'var(--text2)'}}>Target — 25× Annual Expenses</span>
          <span style={{fontSize:14,fontWeight:600,fontFamily:'var(--mono)',color:'var(--blue)'}}>{fmt(fireTarget,true)}</span>
        </div>
        <div className="pbar" style={{height:10,marginBottom:8}}>
          <div className="pfill" style={{width:clamp(netWorthBase/fireTarget*100,0,100).toFixed(0)+'%',background:'linear-gradient(90deg,#4F8EF7,#A78BFA)'}}/>
        </div>
        <div style={{fontSize:12,color:'var(--text3)'}}>
          {clamp(netWorthBase/fireTarget*100,0,100).toFixed(1)}% of FIRE number · Est. {fireYrs>100?'100+':fireYrs} years at current savings rate
        </div>
      </div>
      <div className="card">
        <div className="stitle"><i className="ti ti-chart-line"/>Compound Growth Projections (30-Year)</div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart
            data={[5,10,15,20,25,30].map(yr=>({yr:'Yr '+yr,
              conservative:Math.round(netWorthBase*Math.pow(1.05,yr)),
              moderate:Math.round(netWorthBase*Math.pow(1.07,yr)),
              aggressive:Math.round(netWorthBase*Math.pow(1.10,yr))
            }))}
            margin={{top:4,right:4,left:20,bottom:0}}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
            <XAxis dataKey="yr" tick={{fill:'var(--text3)',fontSize:11}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fill:'var(--text3)',fontSize:10}} axisLine={false} tickLine={false} tickFormatter={v=>fmt(v,true)}/>
            <Tooltip formatter={v=>fmt(v)}/>
            <Legend wrapperStyle={{fontSize:11,color:'var(--text3)'}}/>
            <Line type="monotone" dataKey="conservative" name="5% Return"  stroke="#38BDF8" strokeWidth={2} dot={false}/>
            <Line type="monotone" dataKey="moderate"     name="7% Return"  stroke="#38D9A9" strokeWidth={2} dot={false}/>
            <Line type="monotone" dataKey="aggressive"   name="10% Return" stroke="#A78BFA" strokeWidth={2} dot={false}/>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

/* ──────────────────────────────────────
   PAGE: DEBTS
────────────────────────────────────── */
function Debts({ debts, totalDebt, totalDebtPayment, dti }) {
  const cols = ['#F87171','#F59E0B','#4F8EF7','#A78BFA','#38D9A9','#38BDF8']
  return (
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      <div className="g3">
        {[
          {l:'Total Liabilities', v:fmt(totalDebt,true), c:'var(--red)'},
          {l:'Monthly Service',   v:fmt(totalDebtPayment), c:'var(--amber)'},
          {l:'Debt-to-Income',    v:dti.toFixed(1)+'%', c:dti<=35?'var(--green)':'var(--red)'},
        ].map((k,i)=>(
          <div key={i} className="card">
            <div className="kpi-lbl">{k.l}</div>
            <div className="kpi-val" style={{color:k.c,fontSize:19}}>{k.v}</div>
          </div>
        ))}
      </div>
      <div className="card">
        <div className="stitle">
          <i className="ti ti-credit-card"/>Liability Overview
          <span className="ml"><span className="live-badge"><span className="live-dot"/>LIVE</span></span>
        </div>
        {debts.length === 0
          ? <div style={{color:'var(--text3)',fontSize:13,padding:'12px 0'}}>No liabilities. Add them in the Input Editor.</div>
          : debts.map((d,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid var(--border)'}}>
              <div>
                <div style={{fontSize:13,fontWeight:500,marginBottom:2}}>{d.name}</div>
                <div style={{fontSize:11,color:'var(--text3)'}}>{d.type}{d.rate>0?' · '+d.rate+'% APR':''}</div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontSize:14,fontWeight:600,fontFamily:'var(--mono)',color:'var(--red)'}}>{fmt(d.balance,true)}</div>
                <div style={{fontSize:11,color:'var(--text3)'}}>{fmt(d.payment)}/mo</div>
              </div>
            </div>
          ))}
      </div>
      {debts.length > 0 && (
        <div className="g2">
          <div className="card">
            <div className="stitle"><i className="ti ti-chart-pie"/>Debt Composition</div>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={debts} cx="50%" cy="50%" outerRadius={75} dataKey="balance" nameKey="name"
                  label={({name,percent})=>name.slice(0,8)+' '+(percent*100).toFixed(0)+'%'}>
                  {debts.map((_,i)=><Cell key={i} fill={cols[i%cols.length]}/>)}
                </Pie>
                <Tooltip formatter={v=>fmt(v)}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="card">
            <div className="stitle"><i className="ti ti-calculator"/>Avalanche Payoff Order</div>
            {[...debts].sort((a,b)=>b.rate-a.rate).map((d,i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0',borderBottom:'1px solid var(--border)'}}>
                <div style={{width:22,height:22,borderRadius:'50%',background:cols[i%cols.length]+'22',color:cols[i%cols.length],fontSize:11,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{i+1}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13}}>{d.name}</div>
                  <div style={{fontSize:11,color:'var(--text3)'}}>{d.rate}% APR</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:13,fontFamily:'var(--mono)',color:'var(--red)'}}>{fmt(d.balance,true)}</div>
                  <div style={{fontSize:11,color:'var(--text3)'}}>{d.payment>0?'~'+Math.ceil(d.balance/d.payment)+' mo':'—'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ──────────────────────────────────────
   PAGE: SCENARIOS
────────────────────────────────────── */
function Scenarios({ cashflow, totalIncome, totalExpenses, totalDebt, netWorthBase }) {
  const [sc, setSc] = useState(0)
  const scenarios = [
    { name:'Income Loss — 3 months', desc:'Simulates complete income disruption for 90 days. Tests reserve adequacy.', impact:-(totalIncome*3), col:'var(--red)' },
    { name:'Interest Rate Shock +3%', desc:'300bps rise on all floating-rate obligations. Monthly cash flow impact.', impact:-(totalDebt*0.03/12), col:'var(--amber)' },
    { name:'Inflation Spike +8%', desc:'All variable costs rise 8% for 12 months. Real surplus erosion.', impact:-(totalExpenses*0.08), col:'var(--amber)' },
  ]
  const activeSc = scenarios[sc]
  const stressed = cashflow.map(d=>({m:d.m,baseline:d.net,stressed:Math.max(0,d.net+activeSc.impact/6)}))
  return (
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      <div className="g3">
        {scenarios.map((s,i)=>(
          <div key={i} className={`sc-card${sc===i?' active':''}`} onClick={()=>setSc(i)}>
            <div style={{fontSize:13,fontWeight:600,marginBottom:5}}>{s.name}</div>
            <div style={{fontSize:11,color:'var(--text3)',lineHeight:1.65,marginBottom:10}}>{s.desc}</div>
            <div style={{fontSize:15,fontWeight:600,fontFamily:'var(--mono)',color:s.col}}>{fmt(s.impact,true)} impact</div>
            {sc===i && <div className="tag tb" style={{marginTop:7}}>Active</div>}
          </div>
        ))}
      </div>
      <div className="card">
        <div className="stitle">
          <i className="ti ti-test-pipe"/>Stress Test: {activeSc.name}
          <span className="ml"><span className="live-badge"><span className="live-dot"/>LIVE</span></span>
        </div>
        <ResponsiveContainer width="100%" height={230}>
          <AreaChart data={stressed} margin={{top:4,right:4,left:-12,bottom:0}}>
            <defs>
              <linearGradient id="gb" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#38D9A9" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#38D9A9" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="gs" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#F87171" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#F87171" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
            <XAxis dataKey="m" tick={{fill:'var(--text3)',fontSize:11}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fill:'var(--text3)',fontSize:10}} axisLine={false} tickLine={false} tickFormatter={v=>fmt(v,true)}/>
            <Tooltip content={<CustomTooltip/>}/>
            <Legend wrapperStyle={{fontSize:11,color:'var(--text3)'}}/>
            <Area type="monotone" dataKey="baseline" name="Baseline" stroke="#38D9A9" strokeWidth={2} fill="url(#gb)"/>
            <Area type="monotone" dataKey="stressed"  name="Stressed" stroke="#F87171" strokeWidth={2} fill="url(#gs)" strokeDasharray="5 3"/>
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="card">
        <div className="stitle"><i className="ti ti-shield-exclamation"/>Resilience Metrics</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
          {[
            {l:'Emergency fund depth',     v:fmt(netWorthBase*.33,true)},
            {l:'Stressed 6-month net',     v:fmt(Math.max(0,cashflow.reduce((a,d)=>a+d.net,0)+activeSc.impact),true)},
            {l:'Min. survival budget',     v:fmt(Math.round(totalExpenses*.65))+'/mo'},
            {l:'Reserve months',           v:(netWorthBase/Math.max(totalExpenses,1)).toFixed(1)+' mo'},
          ].map((r,i)=>(
            <div key={i} style={{background:'var(--bg3)',borderRadius:8,padding:'10px 12px'}}>
              <div style={{fontSize:10,color:'var(--text3)',marginBottom:3}}>{r.l}</div>
              <div style={{fontSize:14,fontWeight:600,fontFamily:'var(--mono)'}}>{r.v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ──────────────────────────────────────
   PAGE: REPORTS
────────────────────────────────────── */
function Reports({ cashflow }) {
  const ytdI = cashflow.reduce((a,d)=>a+d.income,0)
  const ytdE = cashflow.reduce((a,d)=>a+d.expense,0)
  const ytdN = cashflow.reduce((a,d)=>a+d.net,0)
  return (
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      <div className="g3">
        {[
          {l:'Total Income YTD',   v:fmt(ytdI,true), c:'var(--green)'},
          {l:'Total Expenses YTD', v:fmt(ytdE,true), c:'var(--red)'},
          {l:'Net Surplus YTD',    v:fmt(ytdN,true), c:'var(--blue)'},
        ].map((k,i)=>(
          <div key={i} className="card">
            <div className="kpi-lbl">{k.l}</div>
            <div className="kpi-val" style={{color:k.c,fontSize:19}}>{k.v}</div>
          </div>
        ))}
      </div>
      <div className="card">
        <div className="stitle"><i className="ti ti-chart-bar"/>Monthly Surplus Variance</div>
        <ResponsiveContainer width="100%" height={190}>
          <BarChart data={cashflow} margin={{top:4,right:4,left:-12,bottom:0}}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
            <XAxis dataKey="m" tick={{fill:'var(--text3)',fontSize:11}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fill:'var(--text3)',fontSize:10}} axisLine={false} tickLine={false} tickFormatter={v=>fmt(v,true)}/>
            <Tooltip content={<CustomTooltip/>}/>
            <Bar dataKey="net" name="Net Surplus" radius={[4,4,0,0]}>
              {cashflow.map((d,i)=><Cell key={i} fill={d.net>=0?'#38D9A9':'#F87171'}/>)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="card">
        <div className="stitle"><i className="ti ti-table"/>Period Summary</div>
        <div style={{overflowX:'auto'}}>
          <table>
            <thead><tr>{['Month','Income','Expenses','Net','Rate','Status'].map((h,i)=><th key={i} className={i>0?'r':''}>{h}</th>)}</tr></thead>
            <tbody>
              {cashflow.map((d,i)=>(
                <tr key={i}>
                  <td style={{fontWeight:500}}>{d.m}</td>
                  <td className="r" style={{color:'var(--green)'}}>{fmt(d.income,true)}</td>
                  <td className="r" style={{color:'var(--red)'}}>{fmt(d.expense,true)}</td>
                  <td className="r" style={{color:'var(--blue)'}}>{fmt(d.net,true)}</td>
                  <td className="r" style={{color:'var(--text2)'}}>{pct(d.net,d.income)}</td>
                  <td style={{textAlign:'right'}}>
                    <span className={`tag ${d.net/d.income>.2?'tg':d.net>0?'ta':'tr'}`}>
                      {d.net/d.income>.2?'Strong':d.net>0?'Steady':'Deficit'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/* ──────────────────────────────────────
   PAGE: INPUT EDITOR
────────────────────────────────────── */
function InputEditor({ arch, currency, setCurrency, incomes, expenses, goals, debts, netWorthBase, setNetWorthBase,
  updIncome, delIncome, addIncome, updExpense, delExpense, addExpense,
  updGoal, delGoal, addGoal, updDebt, delDebt, addDebt,
  totalIncome, totalExpenses, resetDefaults }) {
  const C = CURRENCIES[currency] || CURRENCIES.USD
  return (
    <div style={{display:'flex',flexDirection:'column',gap:16}}>
      <div style={{display:'flex',alignItems:'center',gap:10}}>
        <span className="live-badge"><span className="live-dot"/>All charts update instantly</span>
        <div style={{flex:1}}/>
        <button className="reset-btn" onClick={resetDefaults}><i className="ti ti-refresh" style={{marginRight:4}}/>Reset to defaults</button>
      </div>

      {/* INCOME */}
      <div className="input-panel">
        <div className="input-panel-title">
          <i className="ti ti-coins"/>Income Sources
          <span style={{marginLeft:'auto',fontSize:13,fontFamily:'var(--mono)',color:'var(--green)'}}>{fmt(totalIncome)}</span>
        </div>
        {incomes.map(inc=>(
          <div key={inc.id} className="cat-row">
            <div className="cat-dot" style={{background:inc.color}}/>
            <input className="finput" style={{flex:1}} value={inc.name} onChange={e=>updIncome(inc.id,'name',e.target.value)} placeholder="Income name"/>
            <span style={{color:'var(--text3)',fontSize:13,margin:'0 6px'}}>/mo</span>
            <input className="cat-input" type="number" min="0" value={inc.amt} onChange={e=>updIncome(inc.id,'amt',e.target.value)} onFocus={e=>e.target.select()}/>
            <button className="del-btn" onClick={()=>delIncome(inc.id)}>×</button>
          </div>
        ))}
        <button className="add-btn" style={{marginTop:8}} onClick={addIncome}><i className="ti ti-plus" style={{fontSize:13}}/>Add Income Source</button>
      </div>

      {/* EXPENSES */}
      <div className="input-panel">
        <div className="input-panel-title">
          <i className="ti ti-credit-card"/>Expenses & Costs
          <span style={{marginLeft:'auto',fontSize:13,fontFamily:'var(--mono)',color:'var(--red)'}}>{fmt(totalExpenses)}</span>
        </div>
        {expenses.map(exp=>(
          <div key={exp.id} className="cat-row">
            <div className="cat-dot" style={{background:exp.color}}/>
            <input className="finput" style={{flex:1}} value={exp.name} onChange={e=>updExpense(exp.id,'name',e.target.value)} placeholder="Category name"/>
            <span style={{color:'var(--text3)',fontSize:13,margin:'0 6px'}}>/mo</span>
            <input className="cat-input" type="number" min="0" value={exp.amt} onChange={e=>updExpense(exp.id,'amt',e.target.value)} onFocus={e=>e.target.select()}/>
            <button className="del-btn" onClick={()=>delExpense(exp.id)}>×</button>
          </div>
        ))}
        <button className="add-btn" style={{marginTop:8}} onClick={addExpense}><i className="ti ti-plus" style={{fontSize:13}}/>Add Expense Category</button>
      </div>

      {/* GOALS */}
      <div className="input-panel">
        <div className="input-panel-title"><i className="ti ti-target"/>Savings Goals</div>
        {goals.map(g=>(
          <div key={g.id} className="goal-row">
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
              <div style={{width:9,height:9,borderRadius:'50%',background:g.color,flexShrink:0}}/>
              <input className="finput" style={{flex:1}} value={g.name} onChange={e=>updGoal(g.id,'name',e.target.value)} placeholder="Goal name"/>
              <button className="del-btn" onClick={()=>delGoal(g.id)}>×</button>
            </div>
            <div className="goal-inputs">
              {[['Target',g.target,'target'],['Saved So Far',g.saved,'saved'],['Monthly Top-up',g.monthly,'monthly']].map(([lbl,val,field])=>(
                <div key={field}>
                  <div style={{fontSize:10,color:'var(--text3)',marginBottom:3}}>{lbl}</div>
                  <input className="cat-input" style={{width:'100%'}} type="number" min="0" value={val} onChange={e=>updGoal(g.id,field,e.target.value)} onFocus={e=>e.target.select()}/>
                </div>
              ))}
            </div>
            <div className="pbar" style={{marginTop:8}}>
              <div className="pfill" style={{width:clamp(g.saved/g.target*100,0,100).toFixed(0)+'%',background:g.color}}/>
            </div>
            <div style={{fontSize:10,color:'var(--text3)',marginTop:4}}>
              {clamp(g.saved/g.target*100,0,100).toFixed(0)}%{g.monthly>0&&g.saved<g.target?' · ~'+Math.ceil((g.target-g.saved)/g.monthly)+' months':''}
            </div>
          </div>
        ))}
        <button className="add-btn" style={{marginTop:4}} onClick={addGoal}><i className="ti ti-plus" style={{fontSize:13}}/>Add Goal</button>
      </div>

      {/* DEBTS */}
      <div className="input-panel">
        <div className="input-panel-title">
          <i className="ti ti-credit-card-pay"/>Liabilities & Debts
          <span style={{marginLeft:'auto',fontSize:13,fontFamily:'var(--mono)',color:'var(--red)'}}>{fmt(debts.reduce((a,d)=>a+d.balance,0),true)}</span>
        </div>
        {debts.map(d=>(
          <div key={d.id} className="debt-row-inp">
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
              <input className="finput" style={{flex:1}} value={d.name} onChange={e=>updDebt(d.id,'name',e.target.value)} placeholder="Loan name"/>
              <input className="finput" style={{width:110}} value={d.type} onChange={e=>updDebt(d.id,'type',e.target.value)} placeholder="Type"/>
              <button className="del-btn" onClick={()=>delDebt(d.id)}>×</button>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
              {[['Balance',d.balance,'balance'],['APR (%)',d.rate,'rate'],['Monthly Payment',d.payment,'payment']].map(([lbl,val,field])=>(
                <div key={field}>
                  <div style={{fontSize:10,color:'var(--text3)',marginBottom:3}}>{lbl}</div>
                  <input className="cat-input" style={{width:'100%'}} type="number" min="0" step={field==='rate'?0.1:1} value={val} onChange={e=>updDebt(d.id,field,e.target.value)} onFocus={e=>e.target.select()}/>
                </div>
              ))}
            </div>
          </div>
        ))}
        <button className="add-btn" style={{marginTop:4}} onClick={addDebt}><i className="ti ti-plus" style={{fontSize:13}}/>Add Liability</button>
      </div>

      {/* NET WORTH */}
      <div className="input-panel">
        <div className="input-panel-title"><i className="ti ti-building-bank"/>Starting Net Worth</div>
        <input className="finput" type="number" min="0" value={netWorthBase} onChange={e=>setNetWorthBase(Number(e.target.value)||0)} onFocus={e=>e.target.select()}/>
        <div className="input-note">Used for FIRE progress, compound growth projections, and scenario resilience calculations.</div>
      </div>

      {/* CURRENCY */}
      <div className="input-panel">
        <div className="input-panel-title">
          <i className="ti ti-currency-exchange"/>Currency & Exchange Rates
          <span style={{marginLeft:'auto',fontSize:11,color:'var(--text3)'}}>Active: {C.flag} {C.code}</span>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:12}}>
          {Object.values(CURRENCIES).map(cur=>(
            <div key={cur.code}
              style={{background:currency===cur.code?'rgba(79,142,247,.1)':'var(--bg4)',border:'1px solid '+(currency===cur.code?'var(--blue)':'var(--border)'),borderRadius:10,padding:'12px 10px',cursor:'pointer',textAlign:'center',transition:'all .15s'}}
              onClick={()=>setCurrency(cur.code)}>
              <div style={{fontSize:22,marginBottom:4}}>{cur.flag}</div>
              <div style={{fontSize:12,fontWeight:600,color:currency===cur.code?'var(--blue)':'var(--text)'}}>{cur.code}</div>
              <div style={{fontSize:10,color:'var(--text3)',marginTop:2}}>{cur.name}</div>
            </div>
          ))}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:8}}>
          {Object.values(CURRENCIES).map(cur=>(
            <div key={cur.code} style={{display:'flex',alignItems:'center',gap:10,padding:'9px 12px',background:'var(--bg4)',borderRadius:8,border:'1px solid var(--border)'}}>
              <span style={{fontSize:16}}>{cur.flag}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:500}}>{cur.code} — {cur.name}</div>
                <div style={{fontSize:10,color:'var(--text3)'}}>1 USD = {cur.rates['USD'].toFixed(cur.code==='SEK'?2:4)} {cur.code}</div>
              </div>
              {currency===cur.code && <div className="tag tb">Active</div>}
            </div>
          ))}
        </div>
        <div className="input-note" style={{marginTop:10}}>💡 All amounts are stored in USD base. Switching currency converts the display and PDF export in real time.</div>
      </div>
    </div>
  )
}

/* ──────────────────────────────────────
   PAGE: AI ASSISTANT
────────────────────────────────────── */
function AIAssistant({ totalIncome, totalExpenses, netSurplus, savingsRateCalc, dti, healthScore, expenses, debts, netWorthBase }) {
  const [msgs, setMsgs] = useState([{ r:'bot', t:"Hello! I'm your AI budget assistant. All charts update in real time as you edit your data. Ask me anything." }])
  const [input, setInput] = useState('')

  function respond(q) {
    const l = q.toLowerCase()
    let reply = ''
    if (l.includes('income') || l.includes('earn'))
      reply = `Total monthly income: ${fmt(totalIncome)}. Top source: ${[...expenses].sort((a,b)=>b.amt-a.amt)[0]?.name||'—'}.`
    else if (l.includes('expens') || l.includes('spend'))
      reply = `Monthly expenses total ${fmt(totalExpenses)}. Biggest category: ${[...expenses].sort((a,b)=>b.amt-a.amt)[0]?.name||'—'} at ${fmt([...expenses].sort((a,b)=>b.amt-a.amt)[0]?.amt||0)}.`
    else if (l.includes('save') || l.includes('saving'))
      reply = `Savings rate: ${savingsRateCalc.toFixed(1)}% — saving ${fmt(netSurplus)} monthly. ${savingsRateCalc>=20?'Above the 20% benchmark. Excellent!':'Below the 20% benchmark. Small reductions in top categories could close the gap.'}`
    else if (l.includes('debt') || l.includes('loan'))
      reply = `Total liabilities: ${fmt(debts.reduce((a,d)=>a+d.balance,0),true)}. DTI: ${dti.toFixed(1)}%. ${dti<35?'Within the healthy range.':'Consider accelerated payoff on highest-rate debt.'}`
    else if (l.includes('retire') || l.includes('fire')) {
      const fireTarget = totalExpenses*12*25
      const yrs = netSurplus>0 ? Math.ceil((fireTarget-netWorthBase)/(netSurplus*12)) : 999
      reply = `FIRE target: ${fmt(fireTarget,true)}. Current net worth: ${fmt(netWorthBase,true)}. Estimated ${yrs>100?'100+':yrs} years at current savings rate.`
    } else if (l.includes('health') || l.includes('score'))
      reply = `Budget health score: ${healthScore}/100. Savings rate: ${savingsRateCalc.toFixed(0)}%, DTI: ${dti.toFixed(0)}%, surplus: ${fmt(netSurplus)}.`
    else
      reply = `Based on your live data — income ${fmt(totalIncome)}, expenses ${fmt(totalExpenses)}, net ${fmt(netSurplus)} — health score is ${healthScore}/100. Edit any value in the Input Editor for instant recalculation.`
    setMsgs(m=>[...m,{r:'bot',t:reply}])
  }

  function send(q) {
    const query = q || input
    if (!query.trim()) return
    setMsgs(m=>[...m,{r:'user',t:query}])
    setInput('')
    setTimeout(()=>respond(query), 400)
  }

  const chips = ['What is my savings rate?','Where am I overspending?','How is my debt health?','When can I retire?']
  return (
    <div className="card" style={{minHeight:360,display:'flex',flexDirection:'column',gap:10}}>
      <div className="stitle">
        <i className="ti ti-robot"/>AI Budget Assistant
        <span className="ml"><span className="live-badge"><span className="live-dot"/>Reads live data</span></span>
      </div>
      <div style={{display:'flex',flexWrap:'wrap',gap:6,marginBottom:4}}>
        {chips.map((c,i)=><div key={i} className="ai-chip" onClick={()=>send(c)}>{c}</div>)}
      </div>
      <div style={{flex:1,display:'flex',flexDirection:'column',gap:8,overflowY:'auto',maxHeight:340}}>
        {msgs.map((m,i)=><div key={i} className={`ai-msg ${m.r}`}>{m.t}</div>)}
      </div>
      <div style={{display:'flex',gap:8}}>
        <input className="ai-input" placeholder="Ask anything about your live budget data..." value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()}/>
        <button style={{padding:'8px 16px',background:'var(--blue)',border:'none',borderRadius:8,color:'#fff',fontSize:12,cursor:'pointer',fontFamily:'var(--font)',fontWeight:500}} onClick={()=>send()}>Ask</button>
      </div>
    </div>
  )
}

/* ──────────────────────────────────────
   PDF MODAL
────────────────────────────────────── */
function PdfModal({ show, onClose, archDef, currency, incomes, expenses, goals, debts, cashflow,
  totalIncome, totalExpenses, netSurplus, totalDebt, totalDebtPayment,
  savingsRateCalc, dti, healthScore, netWorthBase }) {
  const [pdfSections, setPdfSections] = useState({ summary:true, income:true, expenses:true, cashflow:true, goals:true, debts:true, scenarios:true, recommendations:true })
  const [pdfStyle, setPdfStyle] = useState('full')
  const [progress, setProgress] = useState(0)
  const [generating, setGenerating] = useState(false)
  const [done, setDone] = useState(false)
  const C = CURRENCIES[currency] || CURRENCIES.USD

  if (!show) return null

  const toggleSection = k => setPdfSections(p=>({...p,[k]:!p[k]}))

  async function doGenerate() {
    setGenerating(true); setDone(false); setProgress(5)
    try {
      await generatePDF({
        archDef, incomes, expenses, goals, debts, cashflow,
        totalIncome, totalExpenses, netSurplus, totalDebt, totalDebtPayment,
        savingsRateCalc, dti, healthScore, netWorthBase, pdfSections,
        onProgress: setProgress,
      })
      setDone(true)
    } finally { setGenerating(false) }
  }

  const sections = [
    { key:'summary',         label:'📊 Executive Summary & Health Score', desc:'Cover page with KPIs' },
    { key:'income',          label:'💰 Income Sources',                   desc:'All income streams' },
    { key:'expenses',        label:'💳 Expense Breakdown',                desc:'Categories with bars' },
    { key:'cashflow',        label:'📈 Cash Flow Analysis',               desc:'6-month table' },
    { key:'goals',           label:'🎯 Goals & FIRE Progress',            desc:'With timelines' },
    { key:'debts',           label:'🏦 Liability Manager',                desc:'Payoff plan' },
    { key:'scenarios',       label:'⚡ Stress Testing',                   desc:'3 scenario analyses' },
    { key:'recommendations', label:'✅ Action Plan',                      desc:'Personalised advice' },
  ]

  return (
    <div className="pdf-modal" onClick={e=>e.target===e.currentTarget&&!generating&&onClose()}>
      <div className="pdf-panel">
        <div className="pdf-panel-header">
          <div style={{width:34,height:34,background:'linear-gradient(135deg,#4F8EF7,#7C3AED)',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
            <i className="ti ti-file-type-pdf" style={{fontSize:18,color:'#fff'}}/>
          </div>
          <h3>Export Financial Report</h3>
          <button className="pdf-close" onClick={()=>!generating&&onClose()}>×</button>
        </div>
        <div className="pdf-body">
          <div>
            <div style={{fontSize:12,fontWeight:600,color:'#374151',marginBottom:8}}>Report Format</div>
            <div className="pdf-options">
              {[
                { id:'full',    label:'📋 Full Report',      desc:'Detailed tables, bars, and action plan. Best for stakeholders.' },
                { id:'compact', label:'⚡ Compact Summary', desc:'KPIs and key figures only. Faster to generate.' },
              ].map(opt=>(
                <div key={opt.id} className={`pdf-option${pdfStyle===opt.id?' sel':''}`} onClick={()=>setPdfStyle(opt.id)}>
                  <h4>{opt.label}</h4><p>{opt.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div style={{fontSize:12,fontWeight:600,color:'#374151',marginBottom:8,display:'flex',justifyContent:'space-between'}}>
              Sections to Include
              <span style={{fontSize:11,color:'#6b7280'}}>{Object.values(pdfSections).filter(Boolean).length} of {Object.keys(pdfSections).length}</span>
            </div>
            <div className="pdf-section-list">
              {sections.map(s=>(
                <div key={s.key} className="pdf-section-row">
                  <label htmlFor={`chk-${s.key}`}>
                    <input type="checkbox" id={`chk-${s.key}`} className="pdf-check" checked={pdfSections[s.key]} onChange={()=>toggleSection(s.key)}/>
                    <div>
                      <div style={{fontSize:12,color:'#374151',fontWeight:500}}>{s.label}</div>
                      <div style={{fontSize:10,color:'#9ca3af'}}>{s.desc}</div>
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </div>
          {generating && (
            <div>
              <div style={{fontSize:12,color:'#374151',marginBottom:6,fontWeight:500}}>
                {progress<30?'Building cover page…':progress<55?'Compiling financial data…':progress<80?'Rendering sections…':'Finalising…'}
              </div>
              <div className="pdf-progress-bar"><div className="pdf-progress-fill" style={{width:progress+'%'}}/></div>
              <div style={{fontSize:11,color:'#9ca3af',marginTop:4}}>{progress}% complete</div>
            </div>
          )}
          {done && (
            <div style={{background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:10,padding:'12px 16px',display:'flex',alignItems:'center',gap:10}}>
              <i className="ti ti-circle-check" style={{fontSize:22,color:'#16a34a'}}/>
              <div>
                <div style={{fontSize:13,fontWeight:600,color:'#15803d'}}>PDF Downloaded Successfully</div>
                <div style={{fontSize:11,color:'#166534'}}>Check your downloads folder for FinanceOS_Report_*.pdf</div>
              </div>
            </div>
          )}
          <div className="pdf-actions">
            <button className="pdf-action-btn secondary" onClick={()=>!generating&&onClose()} disabled={generating}>
              <i className="ti ti-x" style={{fontSize:14}}/>Cancel
            </button>
            <button className="pdf-action-btn primary" disabled={generating||Object.values(pdfSections).every(v=>!v)} onClick={doGenerate}>
              <i className={`ti ti-${generating?'loader-2':'download'}`} style={{fontSize:14}}/>
              {generating?'Generating…':done?'Download Again':'Generate & Download PDF'}
            </button>
          </div>
          <div style={{fontSize:10,color:'#9ca3af',textAlign:'center',marginTop:4}}>
            🔒 100% client-side · your data never leaves your browser · Currency: {C.flag} {C.code}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ──────────────────────────────────────
   ROOT APP
────────────────────────────────────── */
export default function App() {
  const [arch,      setArch]      = useState('individual')
  const [nav,       setNav]       = useState('overview')
  const [currency,  setCurrency]  = useState('USD')
  const [showArch,  setShowArch]  = useState(false)
  const [showNotif, setShowNotif] = useState(false)
  const [showPdf,   setShowPdf]   = useState(false)
  const [nextId,    setNextId]    = useState(100)

  const [incomes,      setIncomes]      = useState(()=>makeDefaults('individual').income)
  const [expenses,     setExpenses]     = useState(()=>makeDefaults('individual').expenses)
  const [goals,        setGoals]        = useState(()=>makeDefaults('individual').goals)
  const [debts,        setDebts]        = useState(()=>makeDefaults('individual').debts)
  const [netWorthBase, setNetWorthBase] = useState(42800)
  const [cashflow,     setCashflow]     = useState(()=>buildCashflow(6800,4320))

  // Keep currency formatter in sync
  setCurrencyCode(currency)
  const C = CURRENCIES[currency] || CURRENCIES.USD

  // Derived totals
  const totalIncome      = incomes.reduce((a,i)=>a+Number(i.amt),0)
  const totalExpenses    = expenses.reduce((a,e)=>a+Number(e.amt),0)
  const netSurplus       = totalIncome - totalExpenses
  const savingsRateCalc  = totalIncome > 0 ? (netSurplus/totalIncome*100) : 0
  const totalDebt        = debts.reduce((a,d)=>a+Number(d.balance),0)
  const totalDebtPayment = debts.reduce((a,d)=>a+Number(d.payment),0)
  const dti              = totalIncome > 0 ? (totalDebtPayment/totalIncome*100) : 0
  const healthScore      = calcHealthScore({ savingsRate:savingsRateCalc, dti, netSurplus, goals, totalDebt, totalIncome })

  // Rebuild cashflow on income/expense change (debounced)
  const rebuildRef = useRef(null)
  useEffect(()=>{
    clearTimeout(rebuildRef.current)
    rebuildRef.current = setTimeout(()=>setCashflow(buildCashflow(totalIncome,totalExpenses)),300)
  },[totalIncome, totalExpenses])

  function switchArch(id) {
    setArch(id)
    const D = makeDefaults(id)
    setIncomes(D.income); setExpenses(D.expenses); setGoals(D.goals); setDebts(D.debts)
    setNetWorthBase(NET_WORTH_DEFAULTS[id]||50000)
    setShowArch(false); setNav('overview')
  }

  const uid = () => { const id = nextId; setNextId(p=>p+1); return id }
  const updIncome  = (id,f,v) => setIncomes(p=>p.map(x=>x.id===id?{...x,[f]:f==='amt'?Number(v)||0:v}:x))
  const delIncome  = id => setIncomes(p=>p.filter(x=>x.id!==id))
  const addIncome  = ()  => { const id=uid(); setIncomes(p=>[...p,{id,name:'New Income',amt:0,color:COLORS[p.length%COLORS.length]}]) }
  const updExpense = (id,f,v) => setExpenses(p=>p.map(x=>x.id===id?{...x,[f]:f==='amt'?Number(v)||0:v}:x))
  const delExpense = id => setExpenses(p=>p.filter(x=>x.id!==id))
  const addExpense = ()  => { const id=uid(); setExpenses(p=>[...p,{id,name:'New Expense',amt:0,color:COLORS[p.length%COLORS.length]}]) }
  const updGoal    = (id,f,v) => setGoals(p=>p.map(x=>x.id===id?{...x,[f]:['target','saved','monthly'].includes(f)?Number(v)||0:v}:x))
  const delGoal    = id => setGoals(p=>p.filter(x=>x.id!==id))
  const addGoal    = ()  => { const id=uid(); setGoals(p=>[...p,{id,name:'New Goal',target:10000,saved:0,monthly:200,color:COLORS[p.length%COLORS.length]}]) }
  const updDebt    = (id,f,v) => setDebts(p=>p.map(x=>x.id===id?{...x,[f]:['balance','rate','payment'].includes(f)?Number(v)||0:v}:x))
  const delDebt    = id => setDebts(p=>p.filter(x=>x.id!==id))
  const addDebt    = ()  => { const id=uid(); setDebts(p=>[...p,{id,name:'New Liability',balance:0,rate:0,payment:0,type:'Loan'}]) }
  const resetDefaults = () => { const D=makeDefaults(arch); setIncomes(D.income); setExpenses(D.expenses); setGoals(D.goals); setDebts(D.debts) }

  const archDef = ARCHETYPES.find(a=>a.id===arch) || ARCHETYPES[0]

  const navItems = [
    { id:'overview', label:'Overview',      icon:'ti-layout-dashboard' },
    { id:'cashflow', label:'Cash Flow',     icon:'ti-chart-area' },
    { id:'budget',   label:'Budget',        icon:'ti-adjustments' },
  ]
  const planItems = [
    { id:'goals',     label:'Goals & Savings', icon:'ti-target' },
    { id:'debts',     label:'Liabilities',     icon:'ti-credit-card' },
    { id:'scenarios', label:'Stress Testing',  icon:'ti-test-pipe' },
  ]
  const insightItems = [{ id:'reports', label:'Reports', icon:'ti-file-analytics' }]

  const pageTitles = {
    overview:'Financial Overview', cashflow:'Cash Flow Analysis', budget:'Budget Breakdown',
    inputs:'⚡ Input Editor', goals:'Goals & Savings', debts:'Liability Manager',
    scenarios:'Scenario Planner', reports:'Reports & Analytics', ai:'AI Assistant',
  }

  const sharedProps = { incomes,expenses,goals,debts,cashflow,totalIncome,totalExpenses,netSurplus,totalDebt,totalDebtPayment,savingsRateCalc,dti,healthScore,netWorthBase }

  return (
    <div className="app">
      {/* ── SIDEBAR ── */}
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-mark">F</div>
          <div><div className="logo-text">FinanceOS</div><div className="logo-sub">{archDef.id.toUpperCase()}</div></div>
        </div>

        <div className="nav-sec">Dashboard</div>
        {navItems.map(n=>(
          <div key={n.id} className={`nav-item${nav===n.id?' active':''}`} onClick={()=>setNav(n.id)}>
            <i className={`ti ${n.icon}`}/>{n.label}
          </div>
        ))}

        <div className="nav-sec">Your Data</div>
        <div className={`nav-item${nav==='inputs'?' active':''}`} onClick={()=>setNav('inputs')}>
          <i className="ti ti-pencil"/>Input Editor<span className="nav-pill pill-green">LIVE</span>
        </div>

        <div className="nav-sec">Planning</div>
        {planItems.map(n=>(
          <div key={n.id} className={`nav-item${nav===n.id?' active':''}`} onClick={()=>setNav(n.id)}>
            <i className={`ti ${n.icon}`}/>{n.label}
          </div>
        ))}

        <div className="nav-sec">Insights</div>
        {insightItems.map(n=>(
          <div key={n.id} className={`nav-item${nav===n.id?' active':''}`} onClick={()=>setNav(n.id)}>
            <i className={`ti ${n.icon}`}/>{n.label}
          </div>
        ))}
        <div className={`nav-item${nav==='ai'?' active':''}`} onClick={()=>setNav('ai')}>
          <i className="ti ti-robot"/>AI Assistant<span className="nav-pill pill-blue">AI</span>
        </div>

        <div className="nav-spacer"/>
        <div className="nav-bottom">
          <button className="arch-btn" onClick={()=>setShowArch(true)}>
            <i className={`ti ${archDef.icon}`} style={{fontSize:15}}/>
            <span style={{flex:1,textAlign:'left',fontSize:11}}>{archDef.label}</span>
            <i className="ti ti-chevron-down" style={{fontSize:13}}/>
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="main">
        <div className="topbar">
          <div className="topbar-title">{pageTitles[nav]||'Overview'}</div>

          {/* Currency toggle */}
          <div className="curr-toggle">
            {Object.values(CURRENCIES).map(cur=>(
              <button key={cur.code} className={`curr-btn${currency===cur.code?' active':''}`} onClick={()=>setCurrency(cur.code)} title={cur.name}>
                <span style={{fontSize:13}}>{cur.flag}</span>{cur.code}
              </button>
            ))}
          </div>

          {/* Live badge */}
          <span className="live-badge" style={{marginRight:4}}>
            <span className="live-dot"/>Live: {fmt(totalIncome,true)} in · {fmt(totalExpenses,true)} out
          </span>

          {/* Health */}
          <div className="health-pill" style={{
            background: healthScore>=75?'rgba(56,217,169,.1)':healthScore>=55?'rgba(245,158,11,.1)':'rgba(248,113,113,.1)',
            border: `1px solid ${healthScore>=75?'rgba(56,217,169,.25)':healthScore>=55?'rgba(245,158,11,.25)':'rgba(248,113,113,.25)'}`,
            color: healthScore>=75?'var(--green)':healthScore>=55?'var(--amber)':'var(--red)',
          }}>
            <i className="ti ti-shield-check" style={{fontSize:14}}/>{healthScore}/100
          </div>

          {/* PDF button */}
          <button className="pdf-btn" onClick={()=>setShowPdf(true)}>
            <i className="ti ti-file-type-pdf"/>Export PDF
          </button>

          {/* Notifications */}
          <div className="notif-btn" onClick={()=>setShowNotif(!showNotif)} style={{position:'relative'}}>
            <i className="ti ti-bell" style={{fontSize:16}}/>
            <div className="notif-dot"/>
            {showNotif && (
              <div style={{position:'absolute',top:42,right:0,width:280,background:'var(--bg2)',border:'1px solid var(--border2)',borderRadius:12,padding:14,zIndex:50,boxShadow:'0 8px 32px rgba(0,0,0,.5)'}}>
                <div style={{fontSize:13,fontWeight:600,marginBottom:10}}>Notifications</div>
                {[
                  { icon:'ti-pencil',        col:'var(--blue)',  t:'Input Editor is live',                s:'Edit any value — charts update instantly.' },
                  { icon:'ti-alert-circle',  col:'var(--amber)', t:dti>35?'DTI elevated':'Surplus active', s:dti>35?`DTI ${dti.toFixed(0)}% exceeds 35%.`:`Net surplus: ${fmt(netSurplus)}` },
                  { icon:'ti-target',        col:'var(--green)', t:`${goals.length} goals tracked`,       s:`${goals.filter(g=>g.saved>=g.target).length} completed` },
                ].map((n,i)=>(
                  <div key={i} style={{display:'flex',gap:10,alignItems:'flex-start',padding:'9px 0',borderBottom:'1px solid var(--border)'}}>
                    <i className={`ti ${n.icon}`} style={{fontSize:17,color:n.col,marginTop:1,flexShrink:0}}/>
                    <div>
                      <div style={{fontSize:12,fontWeight:500,marginBottom:2}}>{n.t}</div>
                      <div style={{fontSize:11,color:'var(--text3)'}}>{n.s}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="content">
          {nav==='overview'  && <Overview {...sharedProps}/>}
          {nav==='cashflow'  && <CashFlow cashflow={cashflow}/>}
          {nav==='budget'    && <Budget expenses={expenses} totalExpenses={totalExpenses}/>}
          {nav==='goals'     && <Goals goals={goals} netWorthBase={netWorthBase} totalIncome={totalIncome} totalExpenses={totalExpenses} netSurplus={netSurplus}/>}
          {nav==='debts'     && <Debts debts={debts} totalDebt={totalDebt} totalDebtPayment={totalDebtPayment} dti={dti}/>}
          {nav==='scenarios' && <Scenarios cashflow={cashflow} totalIncome={totalIncome} totalExpenses={totalExpenses} totalDebt={totalDebt} netWorthBase={netWorthBase}/>}
          {nav==='reports'   && <Reports cashflow={cashflow}/>}
          {nav==='ai'        && <AIAssistant {...sharedProps} savingsRateCalc={savingsRateCalc}/>}
          {nav==='inputs'    && (
            <InputEditor arch={arch} currency={currency} setCurrency={setCurrency}
              incomes={incomes} expenses={expenses} goals={goals} debts={debts}
              netWorthBase={netWorthBase} setNetWorthBase={setNetWorthBase}
              totalIncome={totalIncome} totalExpenses={totalExpenses}
              updIncome={updIncome} delIncome={delIncome} addIncome={addIncome}
              updExpense={updExpense} delExpense={delExpense} addExpense={addExpense}
              updGoal={updGoal} delGoal={delGoal} addGoal={addGoal}
              updDebt={updDebt} delDebt={delDebt} addDebt={addDebt}
              resetDefaults={resetDefaults}/>
          )}
        </div>
      </main>

      {/* ── ARCHETYPE MODAL ── */}
      {showArch && (
        <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&setShowArch(false)}>
          <div className="modal-panel">
            <div style={{display:'flex',alignItems:'center',marginBottom:8}}>
              <div style={{fontSize:15,fontWeight:600,flex:1}}>Switch Archetype</div>
              <button className="x-btn" onClick={()=>setShowArch(false)}>×</button>
            </div>
            <div style={{fontSize:12,color:'var(--text3)',marginBottom:14}}>Loads archetype-appropriate demo data. All values remain editable.</div>
            {ARCHETYPES.map(a=>(
              <div key={a.id} className={`arch-opt${arch===a.id?' sel':''}`} onClick={()=>switchArch(a.id)}>
                <i className={`ti ${a.icon}`} style={{fontSize:20,color:arch===a.id?'var(--blue)':'var(--text3)',flexShrink:0}}/>
                <div>
                  <div style={{fontSize:13,fontWeight:500,marginBottom:1}}>{a.label}</div>
                  <div style={{fontSize:11,color:'var(--text3)'}}>{a.desc}</div>
                </div>
                {arch===a.id && <i className="ti ti-check" style={{marginLeft:'auto',color:'var(--blue)',fontSize:16}}/>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── PDF MODAL ── */}
      <PdfModal
        show={showPdf} onClose={()=>setShowPdf(false)}
        archDef={archDef} currency={currency}
        {...sharedProps}
      />
    </div>
  )
}
