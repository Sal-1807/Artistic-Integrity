
import React, { useState, useEffect } from 'react';
import { RequestItem } from '../types';

interface VerificationWorkbenchProps {
  requests: RequestItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAction: (id: string, action: 'Approved' | 'Rejected', notes?: string) => void;
}

const VerificationWorkbench: React.FC<VerificationWorkbenchProps> = ({ requests, selectedId, onSelect, onAction }) => {
  const [activeTab, setActiveTab] = useState<'scan' | 'metadata' | 'history'>('scan');
  const [analysisNotes, setAnalysisNotes] = useState('');
  
  const activeRequest = requests.find(r => r.id === selectedId) || requests.find(r => r.status !== 'Approved' && r.status !== 'Rejected') || requests[0];

  useEffect(() => {
    // Reset notes when changing active request
    setAnalysisNotes('');
  }, [selectedId]);

  const handleAudit = (decision: 'Approved' | 'Rejected') => {
    if (activeRequest) {
      onAction(activeRequest.id, decision, analysisNotes);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex-1">
          <h3 className="text-2xl font-black text-gray-900">AI Integrity Lab</h3>
          <p className="text-gray-400 font-bold text-sm">Deep forensic analysis for generative content detection.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <select 
              value={selectedId || ''} 
              onChange={(e) => onSelect(e.target.value)}
              className="bg-white border border-gray-100 rounded-2xl px-6 py-3 text-xs font-black outline-none shadow-sm cursor-pointer appearance-none pr-10"
            >
              <option value="" disabled>Select Work to Analyze</option>
              {requests.filter(r => r.status !== 'Approved' && r.status !== 'Rejected').map(r => (
                <option key={r.id} value={r.id}>{r.work} - {r.artist}</option>
              ))}
            </select>
            <svg className="w-4 h-4 absolute right-4 top-3.5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
          </div>

          <div className="flex items-center p-1 bg-white border border-gray-100 rounded-2xl shadow-sm">
            {(['scan', 'metadata', 'history'] as const).map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === tab ? 'bg-gradient-to-r from-deepPurple to-brightOrange text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {tab.replace('history', 'Artist History')}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white p-2 rounded-[40px] border border-gray-100 shadow-xl shadow-gray-200/40 relative group overflow-hidden">
          {activeTab === 'scan' && (
            <div className="animate-fadeIn relative">
              <img 
                src={activeRequest?.img || 'https://picsum.photos/1200/800?random=88'} 
                alt="Analysis target" 
                className="w-full h-[600px] object-cover rounded-[36px] border border-gray-50" 
              />
              <div className="absolute top-10 left-10">
                <div className="bg-white/95 backdrop-blur px-6 py-4 rounded-[28px] shadow-2xl border border-white/50">
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">AI Match Confidence</p>
                  <p className={`text-3xl font-black ${parseFloat(activeRequest?.aiScore || '0') > 50 ? 'text-rose-600' : 'text-emerald-500'}`}>{activeRequest?.aiScore || '0%'}</p>
                </div>
              </div>
              <div className="absolute inset-x-10 bottom-10">
                <div className="bg-gray-900/90 backdrop-blur-md p-8 rounded-[36px] flex items-center justify-between text-white border border-white/10 shadow-2xl">
                  <div className="flex gap-12">
                    <div>
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Asset ID</p>
                      <p className="text-sm font-bold">#REQ-{activeRequest?.id || '000'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Source Prob</p>
                      <p className="text-sm font-bold">{activeRequest?.metadata[1]?.value || 'Unknown'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Status</p>
                      <p className="text-sm font-bold uppercase tracking-widest text-indigo-400">{activeRequest?.status}</p>
                    </div>
                  </div>
                  <button className="p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'metadata' && (
            <div className="p-12 animate-fadeIn h-[600px] overflow-y-auto">
              <h4 className="text-2xl font-black text-gray-900 mb-10 flex items-center gap-4">
                <div className="w-12 h-12 bg-indigoPurple/10 rounded-2xl flex items-center justify-center text-indigoPurple">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                Technical Metadata Analysis
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-16 gap-y-10">
                {activeRequest?.metadata.map((item, i) => (
                  <div key={i} className="border-b border-gray-50 pb-6">
                    <label className="block text-[10px] font-black text-gray-300 uppercase tracking-widest mb-2">{item.label}</label>
                    <p className="text-base font-bold text-gray-800">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="p-12 animate-fadeIn h-[600px] overflow-y-auto">
               <h4 className="text-2xl font-black text-gray-900 mb-10">Submissions from {activeRequest?.artist}</h4>
               <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="p-6 bg-gray-50/50 rounded-3xl border border-gray-50 flex justify-between items-center">
                       <div className="flex gap-4 items-center">
                          <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                          <div>
                             <p className="font-bold text-gray-900">Previous Work #{i+100}</p>
                             <p className="text-xs text-gray-400 font-bold">Verified Nov 2024</p>
                          </div>
                       </div>
                       <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase rounded-lg">Verified Clear</span>
                    </div>
                  ))}
               </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-xl shadow-gray-200/40">
            <h3 className="text-xl font-black text-gray-900 mb-8">Reviewer Decision</h3>
            <div className="space-y-6">
              <div className="p-6 bg-rose-50/50 border border-rose-100 rounded-3xl">
                <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-3">AI Detection Flags</p>
                <ul className="text-xs text-rose-700 space-y-2 list-disc pl-4 font-bold">
                  <li>Inconsistent shadow mapping</li>
                  <li>Pixel-level noise signature match</li>
                  <li>Geometric perspective anomalies</li>
                </ul>
              </div>
              
              <div>
                <label className="block text-[10px] font-black text-gray-300 uppercase tracking-widest mb-3">Analysis Notes</label>
                <textarea 
                  value={analysisNotes}
                  onChange={(e) => setAnalysisNotes(e.target.value)}
                  className="w-full h-36 p-6 bg-gray-50/50 border border-transparent focus:bg-white focus:border-indigo-600/20 rounded-[32px] outline-none text-sm text-gray-700 font-bold transition-all resize-none"
                  placeholder="Enter detailed analysis findings..."
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <button 
                  onClick={() => handleAudit('Rejected')}
                  className="py-5 bg-gray-900 text-white rounded-3xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg"
                >
                  Reject Work
                </button>
                <button 
                  onClick={() => handleAudit('Approved')}
                  className="py-5 bg-white border border-gray-100 text-gray-600 rounded-3xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all shadow-sm"
                >
                  Pass Audit
                </button>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-deepPurple/5 via-transparent to-brightOrange/5 p-10 rounded-[40px] border border-indigo-600/5 shadow-inner">
            <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-8 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              Comparison Forensics
            </h4>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="aspect-square bg-gray-100 rounded-[28px] overflow-hidden shadow-inner grayscale opacity-30">
                   <img src={activeRequest?.img} className="w-full h-full object-cover" />
                </div>
                <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest text-center">Reference</p>
              </div>
              <div className="space-y-3">
                <div className="aspect-square bg-indigoPurple/10 rounded-[28px] overflow-hidden shadow-2xl ring-2 ring-indigo-500/10">
                   <img src={activeRequest?.img} className="w-full h-full object-cover mix-blend-multiply opacity-80 hue-rotate-180" />
                </div>
                <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest text-center">AI Heatmap</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationWorkbench;
