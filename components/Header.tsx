import React, { useState } from 'react';

interface HeaderProps {
  title: string;
  onProfileClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, onProfileClick }) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  return (
    <header className="bg-pureWhite border-b border-gray-100 z-30 sticky top-0">
      {/* Top Header Row */}
      <div className="h-16 flex items-center justify-between px-8">
        <div className="flex items-center gap-4">
          <h2 className="text-sm font-black text-charcoal capitalize tracking-tight whitespace-nowrap">
            {title.replace(/_/g, ' ')}
          </h2>
        </div>

        <div className="flex items-center gap-5">
          <div className="flex items-center gap-3">
            <button className="text-gray-400 hover:text-indigo-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
            </button>
            <button className="relative text-gray-400 hover:text-indigo-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-rose-500 rounded-full ring-2 ring-pureWhite"></span>
            </button>
          </div>
          <button 
            onClick={onProfileClick}
            className="flex items-center gap-3 border-l border-gray-100 pl-5 group hover:opacity-80 transition-opacity"
          >
            <div className="text-right">
              <p className="text-[11px] font-black text-charcoal group-hover:text-deepPurple transition-colors">Alex Riviera</p>
              <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest">Online</p>
            </div>
            <img src="https://picsum.photos/32/32?random=1" alt="Admin" className="w-8 h-8 rounded-full border border-gray-100 object-cover" />
          </button>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="px-8 pb-4 space-y-3">
        {/* Search Row */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 group">
            <input 
              type="text" 
              placeholder="Search users, content, posts by name, email, ID or status..." 
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-indigo-300 outline-none transition-all text-xs font-medium shadow-sm"
            />
            <svg className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm border ${
              isFilterOpen 
                ? 'bg-gradient-to-r from-deepPurple via-indigoPurple to-brightOrange text-white border-transparent' 
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <svg className={`w-4 h-4 ${isFilterOpen ? 'text-white' : 'text-indigoPurple'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
          </button>
        </div>

        {/* Expandable Filter Panel */}
        {isFilterOpen && (
          <div className="p-6 bg-white border border-gray-200 rounded-2xl shadow-xl animate-slideDown overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-4 items-end gap-6 mb-8">
              {/* Type Dropdown */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[11px] font-bold text-gray-700">
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                  Type
                </label>
                <select className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 outline-none focus:border-indigo-300 transition-all cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M7%2010L12%2015L17%2010%22%20stroke%3D%22%2394A3B8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:1.25rem] bg-[right_0.75rem_center] bg-no-repeat">
                  <option>Content</option>
                  <option>Users</option>
                  <option>Staff</option>
                </select>
              </div>

              {/* Date Range Dropdown */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[11px] font-bold text-gray-700">
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  Date Range
                </label>
                <select className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 outline-none focus:border-indigo-300 transition-all cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M7%2010L12%2015L17%2010%22%20stroke%3D%22%2394A3B8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:1.25rem] bg-[right_0.75rem_center] bg-no-repeat">
                  <option>Custom Range</option>
                  <option>Today</option>
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                </select>
              </div>

              {/* Status Dropdown */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[11px] font-bold text-gray-700">
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  Status
                </label>
                <select className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 outline-none focus:border-indigo-300 transition-all cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M7%2010L12%2015L17%2010%22%20stroke%3D%22%2394A3B8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:1.25rem] bg-[right_0.75rem_center] bg-no-repeat">
                  <option>Pending</option>
                  <option>Approved</option>
                  <option>Rejected</option>
                  <option>Flagged</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-deepPurple to-brightOrange text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:opacity-90 transition-all shadow-md shadow-indigoPurple/20">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h-2v5.586l-1.293-1.293z" /><path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4zm12 2v12H4V4h12z" clipRule="evenodd" /></svg>
                  Save
                </button>
                <button 
                  onClick={() => setIsFilterOpen(false)}
                  className="p-2.5 bg-white border border-gray-200 text-gray-400 hover:text-gray-600 rounded-xl transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>

            {/* Saved Filters Tags */}
            <div className="pt-6 border-t border-gray-100 flex flex-col gap-3">
              <span className="text-[11px] font-bold text-gray-800">Saved Filters</span>
              <div className="flex flex-wrap gap-2">
                {['Pending Reviews', "Today's Users", 'Flagged Content'].map((filter) => (
                  <button 
                    key={filter} 
                    className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-50 hover:border-indigoPurple/30 transition-all"
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;