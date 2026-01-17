
import React, { useState } from 'react';
import { ReportItem } from '../types';

type ReportFilter = 'All reports' | 'Pending' | 'Resolved';

interface ReportsProps {
  reports: ReportItem[];
  onReview?: (report: ReportItem) => void;
}

const Reports: React.FC<ReportsProps> = ({ reports, onReview }) => {
  const [activeTab, setActiveTab] = useState<ReportFilter>('All reports');

  const filteredReports = reports.filter(report => {
    if (activeTab === 'All reports') return true;
    if (activeTab === 'Pending') return report.status === 'Pending' || report.status === 'In Review';
    if (activeTab === 'Resolved') return report.status === 'Resolved';
    return true;
  });

  const getSeverityColor = (sev: string) => {
    switch(sev) {
      case 'Critical': return 'text-rose-600 bg-rose-50';
      case 'High': return 'text-orange-600 bg-orange-50';
      case 'Medium': return 'text-amber-600 bg-amber-50';
      default: return 'text-emerald-600 bg-emerald-50';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h3 className="text-2xl font-black text-gray-900">User Reported</h3>
          <p className="text-gray-400 font-bold text-sm">Review and moderate content flagged by the community.</p>
        </div>
        
        <div className="flex p-1.5 bg-white border border-gray-100 rounded-3xl shadow-sm self-start md:self-auto">
          {(['All reports', 'Pending', 'Resolved'] as ReportFilter[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-3 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all ${
                activeTab === tab 
                  ? 'bg-gradient-to-r from-deepPurple via-indigoPurple to-brightOrange text-white shadow-xl shadow-indigo-100' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab}
              <span className={`ml-2 px-2 py-0.5 rounded-lg text-[9px] ${
                activeTab === tab ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'
              }`}>
                {tab === 'All reports' ? reports.length : reports.filter(r => {
                  if (tab === 'Pending') return r.status === 'Pending' || r.status === 'In Review';
                  return r.status === 'Resolved';
                }).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-gray-100 shadow-xl shadow-gray-200/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Case ID</th>
                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Content</th>
                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Reason</th>
                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Severity</th>
                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Reporter</th>
                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredReports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-10 py-6 text-sm font-black text-gray-400">{report.id}</td>
                  <td className="px-10 py-6">
                    <div>
                      <p className="text-sm font-black text-gray-900">{report.content}</p>
                      <p className="text-xs text-indigoPurple font-bold">{report.artist}</p>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <p className="text-sm text-gray-500 font-bold">{report.reason}</p>
                  </td>
                  <td className="px-10 py-6">
                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase ${getSeverityColor(report.severity)}`}>
                      {report.severity}
                    </span>
                  </td>
                  <td className="px-10 py-6 text-sm text-gray-400 font-bold">{report.reporter}</td>
                  <td className="px-10 py-6 text-right">
                    <button 
                      onClick={() => onReview?.(report)}
                      className="p-3 bg-gray-50 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all"
                      title="Move to AI Check Lab"
                    >
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredReports.length === 0 && (
            <div className="py-24 text-center">
              <p className="text-gray-400 font-black text-sm">No reported content found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
