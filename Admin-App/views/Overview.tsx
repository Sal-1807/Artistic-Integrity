
import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

const workflowData = [
  { day: 'Mon', submissions: 360, approvals: 210 },
  { day: 'Tue', submissions: 270, approvals: 160 },
  { day: 'Wed', submissions: 230, approvals: 260 },
  { day: 'Thu', submissions: 280, approvals: 200 },
  { day: 'Fri', submissions: 210, approvals: 170 },
  { day: 'Sat', submissions: 250, approvals: 210 },
  { day: 'Sun', submissions: 330, approvals: 280 },
];

const communityData = [
  { name: 'Creators', value: 28 },
  { name: 'Viewers', value: 72 },
];

const COLORS = ['#4F05F8', '#E0E7FF'];

const StatCard = ({ label, value, trend, trendUp, icon, colorClass }: any) => (
  <div className="bg-pureWhite p-5 rounded-[24px] border border-gray-100 shadow-sm">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-2.5 rounded-xl ${colorClass} text-white`}>
        {icon}
      </div>
      <div className={`flex items-center text-[10px] font-black px-1.5 py-0.5 rounded-lg ${trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
        {trendUp ? '↑' : '↓'} {trend}
      </div>
    </div>
    <h3 className="text-lightGray text-[10px] font-black uppercase tracking-widest mb-1">{label}</h3>
    <p className="text-2xl font-black text-charcoal tracking-tighter">{value}</p>
  </div>
);

const Overview: React.FC = () => {
  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Active Creators" 
          value="3,502" 
          trend="8.1%" 
          trendUp={true}
          colorClass="bg-deepPurple"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>}
        />
        <StatCard 
          label="AI Denials" 
          value="741" 
          trend="12.5%" 
          trendUp={true}
          colorClass="bg-indigoPurple"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
        />
        <StatCard 
          label="User Reports" 
          value="24" 
          trend="15.2%" 
          trendUp={false}
          colorClass="bg-softLavender"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" /></svg>}
        />
        <StatCard 
          label="Retention Rate" 
          value="94.2%" 
          trend="0.5%" 
          trendUp={true}
          colorClass="bg-brightOrange"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
        />
      </div>
      
      {/* Middle Row - Submission Workflow and Community Ratio */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Submission Workflow Card */}
        <div className="lg:col-span-2 bg-pureWhite p-8 rounded-[32px] border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-10">
            <div>
              <h3 className="text-xl font-black text-charcoal tracking-tight">Submission Workflow</h3>
              <p className="text-[10px] font-black text-lightGray uppercase tracking-widest">Track incoming work weekly</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-deepPurple"></div>
                <span className="text-[10px] font-black text-charcoal uppercase tracking-widest">Submissions</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-indigoPurple/30"></div>
                <span className="text-[10px] font-black text-charcoal uppercase tracking-widest">Approvals</span>
              </div>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={workflowData}>
                <defs>
                  <linearGradient id="colorSub" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F05F8" stopOpacity={0.05}/>
                    <stop offset="95%" stopColor="#4F05F8" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorApp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E0E7FF" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#E0E7FF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9A9B9E', fontSize: 11, fontWeight: 700 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9A9B9E', fontSize: 11, fontWeight: 700 }} 
                  ticks={[0, 90, 180, 270, 360]}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '20px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    padding: '12px'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="submissions" 
                  stroke="#4F05F8" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorSub)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="approvals" 
                  stroke="#E0E7FF" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorApp)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Community Ratio Card */}
        <div className="bg-pureWhite p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col">
          <h3 className="text-xl font-black text-charcoal tracking-tight mb-1">Community Ratio</h3>
          <p className="text-[10px] font-black text-lightGray uppercase tracking-widest mb-8">Distribution between creators and viewers</p>
          
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="h-48 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  {/* Fixed cornerRadius error: move cornerRadius to Pie component and remove from Cell */}
                  <Pie
                    data={communityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={0}
                    dataKey="value"
                    startAngle={90}
                    endAngle={450}
                    cornerRadius={10}
                  >
                    {communityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="w-full space-y-6 mt-8">
              {communityData.map((item, index) => (
                <div key={item.name} className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full`} style={{ backgroundColor: COLORS[index] }}></div>
                    <span className="text-xs font-black text-mutedGray">{item.name}</span>
                  </div>
                  <span className="text-xs font-black text-charcoal">{item.value.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row - Events and Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-pureWhite p-6 rounded-[24px] border border-gray-100 shadow-sm">
          <h3 className="text-sm font-black text-charcoal mb-6">Recent Platform Events</h3>
          <div className="space-y-4">
            {[
              { color: 'bg-rose-500', msg: 'System rejected work #1092 - 98% AI Match', time: '12m ago' },
              { color: 'bg-brightOrange', msg: '@user88 reported content for "Plagiarism"', time: '45m ago' },
              { color: 'bg-deepPurple', msg: 'Staff @SarahW approved high-tier artist @JulianV', time: '1h ago' },
              { color: 'bg-charcoal', msg: 'Admin login detected from new IP (London, UK)', time: '2h ago' }
            ].map((event, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className={`w-1 h-8 rounded-full shrink-0 ${event.color}`}></div>
                <div>
                  <p className="text-xs font-bold text-charcoal leading-tight">{event.msg}</p>
                  <p className="text-[9px] font-bold text-lightGray uppercase tracking-widest">{event.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-deepPurple via-indigoPurple to-brightOrange p-6 rounded-[24px] shadow-lg shadow-indigoPurple/20 flex flex-col justify-between relative overflow-hidden group">
          <div className="relative z-10">
            <h3 className="text-lg font-black text-pureWhite mb-1">Performance Goals</h3>
            <p className="text-pureWhite/70 text-[10px] font-medium leading-relaxed max-w-xs">Artistic Integrity platform is currently operating at <span className="text-pureWhite font-black">115% capacity</span> vs last month.</p>
          </div>
          <div className="mt-8 relative z-10">
            <div className="flex justify-between items-end text-pureWhite mb-2">
              <span className="text-[9px] font-black uppercase tracking-widest opacity-60">TARGET: 5K USERS</span>
              <span className="text-2xl font-black">78%</span>
            </div>
            <div className="h-2 bg-pureWhite/20 rounded-full overflow-hidden p-0.5">
              <div className="h-full bg-pureWhite rounded-full shadow-sm" style={{width: '78%'}}></div>
            </div>
          </div>
          <svg className="absolute -right-4 -bottom-4 w-40 h-40 text-pureWhite/5 group-hover:scale-110 transition-transform pointer-events-none" fill="currentColor" viewBox="0 0 20 20"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" /></svg>
        </div>
      </div>
    </div>
  );
};

export default Overview;
