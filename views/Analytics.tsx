
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const growthData = [
  { month: 'Jan', signups: 400, active: 2400 },
  { month: 'Feb', signups: 300, active: 1398 },
  { month: 'Mar', signups: 200, active: 9800 },
  { month: 'Apr', signups: 278, active: 3908 },
  { month: 'May', signups: 189, active: 4800 },
  { month: 'Jun', signups: 239, active: 3800 },
];

const Analytics: React.FC = () => {
  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-black text-charcoal">Analytics & Insights</h3>
          <p className="text-mutedGray font-medium">In-depth performance data for the Artistic Integrity ecosystem.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-3 bg-pureWhite border border-gray-100 rounded-2xl text-sm font-black text-mutedGray hover:bg-gray-50 transition-all shadow-sm">Download Report</button>
          <button className="px-5 py-3 bg-deepPurple text-pureWhite rounded-2xl text-sm font-black shadow-lg shadow-deepPurple/20 hover:bg-indigoPurple transition-all">Real-time Feed</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Avg Order Value', value: '$128.40', trend: '+14%', color: 'successGreen' },
          { label: 'Customer LTV', value: '$1,202', trend: '+2.4%', color: 'successGreen' },
          { label: 'Churn Rate', value: '0.82%', trend: '-0.1%', color: 'coralRed' }
        ].map((m, i) => (
          <div key={i} className="bg-pureWhite p-6 rounded-[32px] border border-gray-100 shadow-sm">
            <p className="text-[10px] font-black text-lightGray uppercase tracking-widest mb-2">{m.label}</p>
            <div className="flex items-end justify-between">
              <p className="text-2xl font-black text-charcoal">{m.value}</p>
              <span className={`text-[10px] font-black px-2 py-1 rounded-lg bg-${m.color}/10 text-${m.color}`}>{m.trend}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-pureWhite p-8 rounded-[32px] border border-gray-100 shadow-sm">
        <h3 className="text-lg font-black text-charcoal mb-8">Monthly Growth Trends</h3>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#9A9B9E', fontSize: 12, fontWeight: 700}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#9A9B9E', fontSize: 12, fontWeight: 700}} />
              <Tooltip cursor={{fill: '#f8f9fa'}} contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgba(22,24,31,0.1)'}} />
              <Bar dataKey="signups" fill="#4F05F8" radius={[10, 10, 0, 0]} barSize={45} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-pureWhite p-8 rounded-[32px] border border-gray-100 shadow-sm">
          <h3 className="text-lg font-black text-charcoal mb-6">Engagement vs Signups</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                <XAxis dataKey="month" hide />
                <Tooltip />
                <Line type="monotone" dataKey="active" stroke="#4F05F8" strokeWidth={4} dot={{r: 5, fill: '#4F05F8', strokeWidth: 2, stroke: '#fff'}} />
                <Line type="monotone" dataKey="signups" stroke="#704BD5" strokeWidth={4} dot={{r: 5, fill: '#704BD5', strokeWidth: 2, stroke: '#fff'}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-pureWhite p-8 rounded-[32px] border border-gray-100 shadow-sm">
          <h3 className="text-lg font-black text-charcoal mb-6">Top Performing Categories</h3>
          <div className="space-y-5">
            {[
              { label: 'Illustration', val: 85 },
              { label: 'Generative Art', val: 72 },
              { label: 'Photography', val: 64 },
              { label: '3D Renders', val: 51 }
            ].map((cat, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-mutedGray">{cat.label}</span>
                  <span className="text-charcoal">{cat.val}%</span>
                </div>
                <div className="h-3 bg-gray-50 rounded-full overflow-hidden p-0.5">
                  <div className="h-full bg-deepPurple rounded-full shadow-sm" style={{width: `${cat.val}%`}}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
