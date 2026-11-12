export const ARCHETYPES = [
  { id: 'individual',  label: 'Individual / Household',  icon: 'ti-home',                desc: 'Personal finance & family budgeting' },
  { id: 'freelancer',  label: 'Freelancer / Sole Trader', icon: 'ti-briefcase',           desc: 'Self-employment income & expenses' },
  { id: 'sme',         label: 'SME / Startup',            icon: 'ti-rocket',              desc: 'Small business budgeting & runway' },
  { id: 'corporation', label: 'Corporation / Enterprise', icon: 'ti-building-skyscraper', desc: 'Multi-department P&L consolidation' },
  { id: 'ngo',         label: 'NGO / Nonprofit',          icon: 'ti-heart',               desc: 'Grant tracking & mission budgets' },
  { id: 'public',      label: 'Public Sector',            icon: 'ti-landmark',            desc: 'Government budget & fiscal planning' },
  { id: 'fund',        label: 'Investment Fund',          icon: 'ti-chart-line',          desc: 'AUM, NAV & portfolio attribution' },
  { id: 'community',   label: 'Community / Cooperative',  icon: 'ti-users',               desc: 'Shared resource & communal budgeting' },
]

export const CURRENCIES = {
  USD: { code: 'USD', symbol: '$',  flag: '🇺🇸', name: 'US Dollar',   locale: 'en-US', rates: { USD: 1,     EUR: 0.92, GBP: 0.79, SEK: 10.41 } },
  EUR: { code: 'EUR', symbol: '€',  flag: '🇪🇺', name: 'Euro',        locale: 'de-DE', rates: { USD: 1.09,  EUR: 1,    GBP: 0.86, SEK: 11.33 } },
  GBP: { code: 'GBP', symbol: '£',  flag: '🇬🇧', name: 'Brit. Pound', locale: 'en-GB', rates: { USD: 1.27,  EUR: 1.16, GBP: 1,    SEK: 13.19 } },
  SEK: { code: 'SEK', symbol: 'kr', flag: '🇸🇪', name: 'Sw. Krona',   locale: 'sv-SE', rates: { USD: 0.096, EUR: 0.088,GBP: 0.076,SEK: 1     } },
}

export const COLORS = ['#38D9A9','#4F8EF7','#F59E0B','#A78BFA','#F87171','#38BDF8','#FB923C','#6B7280','#E879F9','#34D399']

export const NET_WORTH_DEFAULTS = {
  individual: 42800, freelancer: 68000, sme: 320000, corporation: 18400000,
  ngo: 420000, public: 84000000, fund: 480000000, community: 280000,
}

export function makeDefaults(id) {
  const D = {
    individual: {
      income: [
        { id: 1, name: 'Primary Salary',        amt: 5800, color: '#38D9A9' },
        { id: 2, name: 'Freelance / Side Income',amt: 620,  color: '#4F8EF7' },
        { id: 3, name: 'Investment Returns',     amt: 180,  color: '#A78BFA' },
        { id: 4, name: 'Rental Income',          amt: 200,  color: '#F59E0B' },
      ],
      expenses: [
        { id: 1, name: 'Housing / Rent',   amt: 1450, color: '#4F8EF7' },
        { id: 2, name: 'Food & Dining',    amt: 620,  color: '#38D9A9' },
        { id: 3, name: 'Transport',        amt: 380,  color: '#F59E0B' },
        { id: 4, name: 'Health & Medical', amt: 290,  color: '#A78BFA' },
        { id: 5, name: 'Entertainment',    amt: 210,  color: '#F87171' },
        { id: 6, name: 'Utilities',        amt: 180,  color: '#38BDF8' },
        { id: 7, name: 'Education',        amt: 160,  color: '#FB923C' },
        { id: 8, name: 'Shopping / Other', amt: 280,  color: '#6B7280' },
      ],
      goals: [
        { id: 1, name: 'Emergency Fund',  target: 20000,  saved: 14200, color: '#38D9A9', monthly: 400 },
        { id: 2, name: 'Vacation 2025',   target: 4000,   saved: 2800,  color: '#4F8EF7', monthly: 200 },
        { id: 3, name: 'Investment ISA',  target: 12000,  saved: 7600,  color: '#A78BFA', monthly: 350 },
      ],
      debts: [
        { id: 1, name: 'Mortgage',     balance: 218400, rate: 3.4,  payment: 1180, type: 'Home Loan' },
        { id: 2, name: 'Car Loan',     balance: 8600,   rate: 5.9,  payment: 280,  type: 'Auto' },
        { id: 3, name: 'Credit Card',  balance: 1840,   rate: 19.9, payment: 120,  type: 'Revolving' },
      ],
    },
    freelancer: {
      income: [
        { id: 1, name: 'Client Invoices',       amt: 7400, color: '#38D9A9' },
        { id: 2, name: 'Retainer Contracts',    amt: 1200, color: '#4F8EF7' },
        { id: 3, name: 'Royalties / Licensing', amt: 320,  color: '#A78BFA' },
      ],
      expenses: [
        { id: 1, name: 'Home Office / Rent',  amt: 1200, color: '#4F8EF7' },
        { id: 2, name: 'Software & Tools',    amt: 890,  color: '#38D9A9' },
        { id: 3, name: 'Health Insurance',    amt: 680,  color: '#A78BFA' },
        { id: 4, name: 'Marketing',           amt: 540,  color: '#F59E0B' },
        { id: 5, name: 'Transport / Travel',  amt: 420,  color: '#F87171' },
        { id: 6, name: 'Professional Dev.',   amt: 360,  color: '#38BDF8' },
        { id: 7, name: 'Food & Living',       amt: 580,  color: '#FB923C' },
      ],
      goals: [
        { id: 1, name: '6-Month Emergency Fund', target: 35000, saved: 21000, color: '#38D9A9', monthly: 600 },
        { id: 2, name: 'SEP-IRA Contribution',   target: 15000, saved: 8500,  color: '#4F8EF7', monthly: 500 },
        { id: 3, name: 'Equipment Upgrade',      target: 5000,  saved: 3200,  color: '#F59E0B', monthly: 200 },
      ],
      debts: [
        { id: 1, name: 'Student Loan',         balance: 32000, rate: 4.5,  payment: 340, type: 'Education' },
        { id: 2, name: 'Business Credit Card', balance: 4200,  rate: 18.9, payment: 180, type: 'Revolving' },
      ],
    },
    sme: {
      income: [
        { id: 1, name: 'Product Revenue', amt: 58000, color: '#38D9A9' },
        { id: 2, name: 'Service Revenue', amt: 18000, color: '#4F8EF7' },
        { id: 3, name: 'Grant / Funding', amt: 5000,  color: '#A78BFA' },
        { id: 4, name: 'Other Income',    amt: 3000,  color: '#F59E0B' },
      ],
      expenses: [
        { id: 1, name: 'Payroll & Benefits',   amt: 36000, color: '#4F8EF7' },
        { id: 2, name: 'Office / Rent',        amt: 8500,  color: '#38D9A9' },
        { id: 3, name: 'Marketing',            amt: 4800,  color: '#F59E0B' },
        { id: 4, name: 'Software / SaaS',      amt: 3200,  color: '#A78BFA' },
        { id: 5, name: 'Legal & Compliance',   amt: 2100,  color: '#F87171' },
        { id: 6, name: 'COGS',                 amt: 4000,  color: '#38BDF8' },
        { id: 7, name: 'Other OpEx',           amt: 2600,  color: '#6B7280' },
      ],
      goals: [
        { id: 1, name: '6-Month Operating Reserve', target: 366000, saved: 110400, color: '#38D9A9', monthly: 5000 },
        { id: 2, name: 'Equipment & Tech Upgrade',  target: 40000,  saved: 22000,  color: '#4F8EF7', monthly: 2000 },
        { id: 3, name: 'Market Expansion Fund',     target: 80000,  saved: 15000,  color: '#F59E0B', monthly: 3000 },
      ],
      debts: [
        { id: 1, name: 'SBA Term Loan',         balance: 124000, rate: 6.2, payment: 2400, type: 'Business Loan' },
        { id: 2, name: 'Business Credit Line',  balance: 18000,  rate: 8.5, payment: 600,  type: 'Revolving' },
      ],
    },
    corporation: {
      income: [
        { id: 1, name: 'Product Sales',   amt: 2800000, color: '#38D9A9' },
        { id: 2, name: 'Service Revenue', amt: 900000,  color: '#4F8EF7' },
        { id: 3, name: 'Licensing & IP',  amt: 320000,  color: '#A78BFA' },
        { id: 4, name: 'Other Income',    amt: 180000,  color: '#F59E0B' },
      ],
      expenses: [
        { id: 1, name: 'Payroll & Benefits',   amt: 1550000, color: '#4F8EF7' },
        { id: 2, name: 'COGS',                 amt: 620000,  color: '#38D9A9' },
        { id: 3, name: 'Marketing',            amt: 310000,  color: '#F59E0B' },
        { id: 4, name: 'R&D',                  amt: 248000,  color: '#A78BFA' },
        { id: 5, name: 'G&A',                  amt: 186000,  color: '#F87171' },
        { id: 6, name: 'IT & Infrastructure',  amt: 124000,  color: '#38BDF8' },
        { id: 7, name: 'Other',                amt: 62000,   color: '#6B7280' },
      ],
      goals: [
        { id: 1, name: 'Capex Programme 2025', target: 5000000,  saved: 2800000, color: '#38D9A9', monthly: 200000 },
        { id: 2, name: 'Acquisition Reserve',  target: 12000000, saved: 6400000, color: '#4F8EF7', monthly: 500000 },
        { id: 3, name: 'R&D Innovation Fund',  target: 3000000,  saved: 1200000, color: '#A78BFA', monthly: 150000 },
      ],
      debts: [
        { id: 1, name: 'Senior Secured Notes',       balance: 8200000, rate: 4.2, payment: 68000, type: 'Corporate Bond' },
        { id: 2, name: 'Revolving Credit Facility',  balance: 1400000, rate: 5.8, payment: 22000, type: 'Credit Facility' },
      ],
    },
    ngo: {
      income: [
        { id: 1, name: 'EU Structural Grant',    amt: 80000, color: '#38D9A9' },
        { id: 2, name: 'Individual Donations',   amt: 42000, color: '#4F8EF7' },
        { id: 3, name: 'Corporate Sponsorship',  amt: 28000, color: '#A78BFA' },
        { id: 4, name: 'Fundraising Events',     amt: 18000, color: '#F59E0B' },
        { id: 5, name: 'Government Contract',    amt: 12000, color: '#F87171' },
      ],
      expenses: [
        { id: 1, name: 'Programme Delivery',  amt: 71000, color: '#38D9A9' },
        { id: 2, name: 'Staff & Volunteers',  amt: 42600, color: '#4F8EF7' },
        { id: 3, name: 'Fundraising Costs',   amt: 14200, color: '#F59E0B' },
        { id: 4, name: 'Admin & Overhead',    amt: 7100,  color: '#A78BFA' },
        { id: 5, name: 'Communications',      amt: 4260,  color: '#F87171' },
        { id: 6, name: 'Travel & Events',     amt: 2840,  color: '#38BDF8' },
      ],
      goals: [
        { id: 1, name: 'Operating Reserve (6 mo.)', target: 852000, saved: 420000, color: '#38D9A9', monthly: 12000 },
        { id: 2, name: 'Programme Expansion Fund',  target: 200000, saved: 68000,  color: '#4F8EF7', monthly: 5000 },
        { id: 3, name: 'Endowment Seed',            target: 500000, saved: 42000,  color: '#A78BFA', monthly: 3000 },
      ],
      debts: [
        { id: 1, name: 'Office Lease Liability', balance: 84000, rate: 0, payment: 4200, type: 'Lease' },
      ],
    },
    public: {
      income: [
        { id: 1, name: 'Property Tax',   amt: 5200000, color: '#38D9A9' },
        { id: 2, name: 'State Aid',      amt: 3800000, color: '#4F8EF7' },
        { id: 3, name: 'Sales Tax',      amt: 1800000, color: '#A78BFA' },
        { id: 4, name: 'Fees & Permits', amt: 900000,  color: '#F59E0B' },
        { id: 5, name: 'Federal Grants', amt: 700000,  color: '#F87171' },
      ],
      expenses: [
        { id: 1, name: 'Public Safety',    amt: 3360000, color: '#4F8EF7' },
        { id: 2, name: 'Education',        amt: 2800000, color: '#38D9A9' },
        { id: 3, name: 'Infrastructure',   amt: 1680000, color: '#F59E0B' },
        { id: 4, name: 'Health & Welfare', amt: 1344000, color: '#A78BFA' },
        { id: 5, name: 'Administration',   amt: 784000,  color: '#F87171' },
        { id: 6, name: 'Parks & Culture',  amt: 560000,  color: '#38BDF8' },
        { id: 7, name: 'Debt Service',     amt: 672000,  color: '#6B7280' },
      ],
      goals: [
        { id: 1, name: 'Rainy Day Fund (10% revenue)', target: 14880000, saved: 8400000,  color: '#38D9A9', monthly: 300000 },
        { id: 2, name: 'Infrastructure 5-Year Plan',   target: 40000000, saved: 12000000, color: '#4F8EF7', monthly: 500000 },
      ],
      debts: [
        { id: 1, name: 'General Obligation Bonds', balance: 42000000, rate: 3.1, payment: 420000, type: 'Municipal Bond' },
        { id: 2, name: 'Revenue Bonds',            balance: 18000000, rate: 3.8, payment: 180000, type: 'Revenue Bond' },
      ],
    },
    fund: {
      income: [
        { id: 1, name: 'Portfolio Realisations', amt: 4200000, color: '#38D9A9' },
        { id: 2, name: 'Dividend Income',        amt: 2100000, color: '#4F8EF7' },
        { id: 3, name: 'Management Fees',        amt: 1200000, color: '#A78BFA' },
        { id: 4, name: 'Interest Income',        amt: 900000,  color: '#F59E0B' },
      ],
      expenses: [
        { id: 1, name: 'New Investments',   amt: 3000000, color: '#4F8EF7' },
        { id: 2, name: 'Management Fee',    amt: 480000,  color: '#A78BFA' },
        { id: 3, name: 'LP Distributions',  amt: 2400000, color: '#38D9A9' },
        { id: 4, name: 'Operations',        amt: 180000,  color: '#F59E0B' },
        { id: 5, name: 'Compliance',        amt: 120000,  color: '#F87171' },
      ],
      goals: [
        { id: 1, name: 'AUM Target $600M',       target: 600000000, saved: 480000000, color: '#38D9A9', monthly: 10000000 },
        { id: 2, name: 'Co-Investment Reserve',  target: 20000000,  saved: 12000000,  color: '#4F8EF7', monthly: 1000000 },
      ],
      debts: [
        { id: 1, name: 'Fund Leverage Facility', balance: 96000000, rate: 5.2, payment: 960000, type: 'Leverage' },
      ],
    },
    community: {
      income: [
        { id: 1, name: 'Member Contributions', amt: 28000, color: '#38D9A9' },
        { id: 2, name: 'Produce Sales',        amt: 9200,  color: '#4F8EF7' },
        { id: 3, name: 'Workshop Fees',        amt: 2800,  color: '#A78BFA' },
        { id: 4, name: 'Grants',               amt: 2000,  color: '#F59E0B' },
      ],
      expenses: [
        { id: 1, name: 'Shared Housing',      amt: 12400, color: '#4F8EF7' },
        { id: 2, name: 'Food & Supplies',     amt: 6200,  color: '#38D9A9' },
        { id: 3, name: 'Energy & Utilities',  amt: 4650,  color: '#F59E0B' },
        { id: 4, name: 'Community Projects',  amt: 3100,  color: '#A78BFA' },
        { id: 5, name: 'Equipment',           amt: 2480,  color: '#F87171' },
        { id: 6, name: 'Admin',               amt: 2170,  color: '#6B7280' },
      ],
      goals: [
        { id: 1, name: 'Solar Installation Fund',   target: 60000, saved: 28000, color: '#38D9A9', monthly: 1200 },
        { id: 2, name: 'Community Hall Extension',  target: 40000, saved: 14000, color: '#4F8EF7', monthly: 800 },
        { id: 3, name: 'Emergency Repair Reserve',  target: 20000, saved: 12000, color: '#F59E0B', monthly: 500 },
      ],
      debts: [
        { id: 1, name: 'Co-op Mortgage',  balance: 180000, rate: 3.6, payment: 1800, type: 'Property' },
        { id: 2, name: 'Equipment Loan', balance: 24000,  rate: 5.4, payment: 480,  type: 'Asset Finance' },
      ],
    },
  }
  return JSON.parse(JSON.stringify(D[id] || D.individual))
}
