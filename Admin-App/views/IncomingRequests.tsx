
import React, { useState } from 'react';
import { RequestItem, RequestStatus } from '../types';

interface IncomingRequestsProps {
  requests: RequestItem[];
  onReview: (id: string) => void;
  onBulkAction: (ids: string[], action: string) => void;
}

const IncomingRequests: React.FC<IncomingRequestsProps> = ({ requests, onReview, onBulkAction }) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<RequestStatus | 'All'>('All');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showBulkMenu, setShowBulkMenu] = useState(false);

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredRequests.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredRequests.map(r => r.id)));
    }
  };

  // Filter out items already completed for the queue view, unless specifically filtered
  const queueItems = requests.filter(r => r.status !== 'Approved' && r.status !== 'Rejected');
  const filteredRequests = queueItems.filter(r => filter === 'All' || r.status === filter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Priority': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case 'Flagged': return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'Approved': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Rejected': return 'bg-rose-100 text-rose-900 border-rose-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  const handleBulk = (action: string) => {
    onBulkAction(Array.from(selectedIds), action);
    setSelectedIds(new Set());
    setShowBulkMenu(false);
  };

  return (
    <div className="bg-white rounded-[40px] border border-gray-100 shadow-xl shadow-gray-200/40 overflow-hidden animate-fadeIn pb-12">
      <div className="p-10 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h3 className="text-2xl font-black text-gray-900 mb-1">Incoming Verification Queue</h3>
          <p className="text-sm text-gray-400 font-bold">Manage artworks awaiting human integrity analysis.</p>
        </div>
        <div className="flex gap-3 relative">
          {/* Filter Component - Removed Approved and Rejected options */}
          <div className="relative">
            <button 
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className={`px-6 py-3 border rounded-2xl text-xs font-black transition-all flex items-center gap-2 ${showFilterMenu ? 'border-deepPurple text-deepPurple bg-indigoPurple/5' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
              {filter === 'All' ? 'Filter Queue' : filter}
            </button>
            {showFilterMenu && (
              <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 p-3 animate-slideDown">
                {(['All', 'Priority', 'Regular', 'Flagged'] as const).map(f => (
                  <button 
                    key={f}
                    onClick={() => { setFilter(f); setShowFilterMenu(false); }}
                    className={`w-full text-left px-5 py-2.5 text-xs font-bold rounded-xl transition-colors ${filter === f ? 'bg-indigoPurple/10 text-indigoPurple' : 'text-gray-500 hover:bg-gray-50'}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Bulk Actions */}
          <div className="relative">
            <button 
              disabled={selectedIds.size === 0}
              onClick={() => setShowBulkMenu(!showBulkMenu)}
              className={`px-6 py-3 rounded-2xl text-xs font-black transition-all flex items-center gap-2 shadow-xl ${selectedIds.size > 0 ? 'bg-gradient-to-r from-deepPurple to-brightOrange text-white' : 'bg-gray-100 text-gray-300 cursor-not-allowed'}`}
            >
              Bulk Action {selectedIds.size > 0 && `(${selectedIds.size})`}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </button>
            {showBulkMenu && (
              <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 p-3 animate-slideDown">
                <button onClick={() => handleBulk('Approved')} className="w-full text-left px-5 py-3 text-xs font-bold rounded-xl text-emerald-600 hover:bg-emerald-50 transition-colors">Approve Selected</button>
                <button onClick={() => handleBulk('Rejected')} className="w-full text-left px-5 py-3 text-xs font-bold rounded-xl text-rose-600 hover:bg-rose-50 transition-colors">Reject Selected</button>
                <button onClick={() => handleBulk('Flagged')} className="w-full text-left px-5 py-3 text-xs font-bold rounded-xl text-amber-600 hover:bg-amber-50 transition-colors">Flag Selected</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-50">
              <th className="px-10 py-6 w-12">
                <input 
                  type="checkbox" 
                  checked={filteredRequests.length > 0 && selectedIds.size === filteredRequests.length}
                  onChange={toggleSelectAll}
                  className="w-5 h-5 rounded-lg text-deepPurple focus:ring-deepPurple cursor-pointer" 
                />
              </th>
              <th className="px-4 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Artwork</th>
              <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Artist</th>
              <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Type</th>
              <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Received</th>
              <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
              <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredRequests.map((req) => (
              <tr key={req.id} className={`hover:bg-gray-50/50 transition-colors group ${selectedIds.has(req.id) ? 'bg-indigoPurple/5' : ''}`}>
                <td className="px-10 py-6">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.has(req.id)}
                    onChange={() => toggleSelect(req.id)}
                    className="w-5 h-5 rounded-lg text-deepPurple focus:ring-deepPurple cursor-pointer" 
                  />
                </td>
                <td className="px-4 py-6">
                  <div className="flex items-center gap-4">
                    <img src={req.img} alt={req.work} className="w-14 h-14 rounded-2xl object-cover shadow-lg" />
                    <p className="text-sm font-black text-gray-900">{req.work}</p>
                  </div>
                </td>
                <td className="px-10 py-6 text-sm font-bold text-gray-600">{req.artist}</td>
                <td className="px-10 py-6 text-sm font-bold text-gray-400">{req.type}</td>
                <td className="px-10 py-6 text-sm font-bold text-gray-400">{req.date}</td>
                <td className="px-10 py-6">
                  <span className={`px-4 py-1.5 text-[10px] font-black uppercase rounded-xl border ${getStatusColor(req.status)}`}>
                    {req.status}
                  </span>
                </td>
                <td className="px-10 py-6 text-right">
                  <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => onReview(req.id)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md"
                    >
                      Review
                    </button>
                    <button 
                      onClick={() => onBulkAction([req.id], 'Rejected')}
                      className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredRequests.length === 0 && (
          <div className="py-24 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-200">
               <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
            </div>
            <p className="text-gray-400 font-black text-sm">Verification queue is empty.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default IncomingRequests;
