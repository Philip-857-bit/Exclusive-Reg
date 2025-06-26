'use client'

import { useEffect, useState } from 'react' 
import { saveAs } from 'file-saver' 
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

const COLORS = ['#34d399', '#60a5fa', '#fbbf24'] 
const ITEMS_PER_PAGE = 10

interface Registration {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  [key: string]: any;
}

interface Investor {
  id: string;
  name: string;
  email: string;
  firm: string;
  message: string;
  [key: string]: any;
}

export default function AdminDashboard() { 
  const [password, setPassword] = useState(''); 
  const [authorized, setAuthorized] = useState(false); 
  const [registrations, setRegistrations] = useState<Registration[]>([]); 
  const [investors, setInvestors] = useState<Investor[]>([]); 
  const [search, setSearch] = useState(''); 
  const [pageReg, setPageReg] = useState(1); 
  const [pageInv, setPageInv] = useState(1);

const handleAuth = () => { if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) { setAuthorized(true) } else { alert('Incorrect admin password') } }

useEffect(() => { if (authorized) { fetch('/api/Admin/registrations') .then((res) => res.json()) .then(setRegistrations)

fetch('/api/Admin/investors')
    .then((res) => res.json())
    .then(setInvestors)
}

}, [authorized])

const exportCSV = (data: Array<Registration | Investor>, filename: string): void => {
  if (!data.length) return;
  const csv = [
    Object.keys(data[0]).join(','),
    ...data.map(row => Object.values(row).join(','))
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  saveAs(blob, filename);
};

const filteredRegistrations = registrations.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase())
  );

  const filteredInvestors = investors.filter(
    (i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.email.toLowerCase().includes(search.toLowerCase())
  );

  const paginatedRegistrations = filteredRegistrations.slice(
    (pageReg - 1) * ITEMS_PER_PAGE,
    pageReg * ITEMS_PER_PAGE
  );
  const paginatedInvestors = filteredInvestors.slice(
    (pageInv - 1) * ITEMS_PER_PAGE,
    pageInv * ITEMS_PER_PAGE
  );

  const statsData = [
    { name: 'Attendees', value: registrations.length },
    { name: 'Brands', value: investors.length },
  ];

  const renderPagination = (
    current: number,
    total: number,
    onPageChange: (page: number) => void
  ) => {
    const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
    return (
      <div className="flex gap-2 mt-4">
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            onClick={() => onPageChange(i + 1)}
            className={`px-3 py-1 rounded ${current === i + 1 ? 'bg-black text-white' : 'bg-gray-200'}`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    );
  };

  if (!authorized) { 
    return ( 
      <main className="p-8"> 
        <h2 className="text-xl font-bold mb-4">🔐 Admin Login</h2> 
        <input 
          type="password" 
          placeholder="Enter admin password" 
          className="border rounded px-4 py-2" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
        /> 
        <button 
          onClick={handleAuth} 
          className="ml-4 bg-black text-white px-4 py-2 rounded"
        > 
          Login 
        </button> 
      </main> 
    ) 
  }

  return ( 
    <main className="p-8 bg-gray-100 min-h-screen text-gray-900"> 
      <h1 className="text-2xl font-bold mb-6">📊 Admin Dashboard</h1>

      <section className="mb-8 grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-lg font-semibold mb-2">📈 Summary Stats</h3>
          <ul className="space-y-1">
            <li>Total Attendees: {registrations.length}</li>
            <li>Total Brands: {investors.length}</li>
            <li>Total Submissions: {registrations.length + investors.length}</li>
          </ul>
        </div>
        <div className="bg-white p-6 rounded shadow h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statsData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={60}
                fill="#8884d8"
                label
              >
                {statsData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      <input
        type="text"
        placeholder="Search by name or email..."
        className="mb-6 px-4 py-2 border rounded w-full"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <section className="mb-10">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold">🎫 Attendee Registrations</h2>
          <button
            onClick={() => exportCSV(filteredRegistrations, 'attendees.csv')}
            className="bg-green-600 text-white px-4 py-1 rounded"
          >
            Export CSV
          </button>
        </div>
        <ul className="space-y-2">
          {paginatedRegistrations.map((reg: any) => (
            <li key={reg.id} className="border p-4 rounded bg-white shadow">
              <p>
                <strong>{reg.name}</strong> | {reg.email} | {reg.phone} | {reg.company}
              </p>
            </li>
          ))}
        </ul>
        {renderPagination(pageReg, filteredRegistrations.length, setPageReg)}
      </section>

      <section>
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold">🏢 Brand Submissions</h2>
          <button
            onClick={() => exportCSV(filteredInvestors, 'brands.csv')}
            className="bg-blue-600 text-white px-4 py-1 rounded"
          >
            Export CSV
          </button>
        </div>
        <ul className="space-y-2">
          {paginatedInvestors.map((inv: any) => (
            <li key={inv.id} className="border p-4 rounded bg-white shadow">
              <p>
                <strong>{inv.name}</strong> | {inv.email} | {inv.firm} | {inv.message}
              </p>
            </li>
          ))}
        </ul>
        {renderPagination(pageInv, filteredInvestors.length, setPageInv)}
      </section>
    </main>
  ) 
}