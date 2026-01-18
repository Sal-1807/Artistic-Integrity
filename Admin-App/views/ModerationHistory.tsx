
import React, { useState } from 'react';
import { RequestItem } from '../types';

interface ModerationHistoryProps {
  requests: RequestItem[];
}

type HistoryTab = 'All' | 'Approved' | 'Rejected';

const ModerationHistory: React.FC<ModerationHistoryProps> = ({ requests }) => {
  const [activeTab, setActiveTab] = useState<HistoryTab>('All');
  const [selectedDetail, setSelectedDetail] = useState<RequestItem | null>(null);

  const historyItems = requests.filter(r => r.status === 'Approved' || r.status === 'Rejected');
  
  const filteredHistory = historyItems.filter(item => {
    if (activeTab === 'All') return true;
    return item.status === activeTab;
  });

  const getStatusBadge = (status: string) => {
    if (status === 'Approved') {
      return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    }
    return 'bg-rose-50 text-rose-700 border-rose-100';
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-20 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h3 className="text-2xl font-black text-gray-900">Moderation History</h3>
          <p className="text-sm text-gray-400 font-bold">Comprehensive record of all final moderation decisions.</p>
        </div>
        
        <div className="flex p-1.5 bg-white border border-gray-100 rounded-[20px] shadow-sm">
          {(['All', 'Approved', 'Rejected'] as HistoryTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                activeTab === tab 
                  ? 'bg-gradient-to-r from-deepPurple via-indigoPurple to-brightOrange text-white shadow-lg' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-gray-100 shadow-xl shadow-gray-200/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Artwork</th>
                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Artist</th>
                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Decision</th>
                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Type</th>
                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">AI Score</th>
                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">View Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredHistory.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <img src={item.img} alt={item.work} className="w-14 h-14 rounded-2xl object-cover shadow-lg" />
                      <div>
                        <p className="text-sm font-black text-gray-900 leading-tight">{item.work}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">ID: {item.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <p className="text-sm font-bold text-gray-600">{item.artist}</p>
                  </td>
                  <td className="px-10 py-6">
                    <span className={`px-4 py-1.5 text-[10px] font-black uppercase rounded-xl border ${getStatusBadge(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-10 py-6 text-sm font-bold text-gray-400">{item.type}</td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-2">
                       <div className={`w-1.5 h-1.5 rounded-full ${parseFloat(item.aiScore) > 50 ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                       <span className="text-sm font-black text-gray-700">{item.aiScore}</span>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <button 
                      onClick={() => setSelectedDetail(item)}
                      className="p-3 bg-gray-50 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all"
                    >
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredHistory.length === 0 && (
            <div className="py-24 text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-200">
                 <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <p className="text-gray-400 font-black text-sm">No historical records match your filter.</p>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-charcoal/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-4xl rounded-[48px] shadow-2xl overflow-hidden border border-gray-100 flex flex-col md:flex-row h-[80vh]">
            <div className="md:w-1/2 relative bg-gray-50">
              <img src={selectedDetail.img} alt={selectedDetail.work} className="w-full h-full object-cover" />
              <button 
                onClick={() => setSelectedDetail(null)}
                className="absolute top-6 left-6 p-3 bg-white/90 backdrop-blur rounded-full text-gray-900 shadow-xl hover:bg-white transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="md:w-1/2 p-12 overflow-y-auto space-y-10 custom-scrollbar">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-3xl font-black text-gray-900 tracking-tight">{selectedDetail.work}</h4>
                  <p className="text-indigoPurple font-bold text-sm">Artist: {selectedDetail.artist}</p>
                </div>
                <span className={`px-4 py-1.5 text-[10px] font-black uppercase rounded-xl border ${getStatusBadge(selectedDetail.status)}`}>
                  {selectedDetail.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest block mb-1">AI Score</label>
                  <p className={`text-xl font-black ${parseFloat(selectedDetail.aiScore) > 50 ? 'text-rose-600' : 'text-emerald-500'}`}>
                    {selectedDetail.aiScore}
                  </p>
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest block mb-1">Reviewed By</label>
                  <p className="text-base font-bold text-gray-800">{selectedDetail.reviewedBy || 'N/A'}</p>
                </div>
                <div className="col-span-2">
                   <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest block mb-1">Review Timestamp</label>
                   <p className="text-xs font-bold text-gray-500">{selectedDetail.reviewedAt || 'N/A'}</p>
                </div>
              </div>

              <div className="p-8 bg-gray-50 rounded-[32px] border border-gray-100">
                <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  Analyst Notes
                </label>
                <p className="text-sm font-bold text-gray-700 leading-relaxed italic">
                  "{selectedDetail.notes || 'No specific analysis findings recorded.'}"
                </p>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest block">Metadata</label>
                <div className="space-y-2">
                  {selectedDetail.metadata.map((m, i) => (
                    <div key={i} className="flex justify-between text-xs py-2 border-b border-gray-50">
                      <span className="text-gray-400 font-bold">{m.label}</span>
                      <span className="text-gray-900 font-bold">{m.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => setSelectedDetail(null)}
                className="w-full py-5 bg-charcoal text-white rounded-3xl text-sm font-black uppercase tracking-widest shadow-lg shadow-gray-200"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModerationHistory;
