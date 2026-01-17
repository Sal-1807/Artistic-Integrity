import React from 'react';
import { View } from '../types';

interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, isOpen, onToggle }) => {
  const navGroups = [
    {
      label: 'Main',
      items: [
        { view: View.OVERVIEW, label: 'Dashboard', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
      ]
    },
    {
      label: 'Moderation',
      items: [
        { view: View.REQUESTS, label: 'Verification Queue', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg> },
        { view: View.VERIFICATION_WORKBENCH, label: 'AI Check Lab', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg> },
        { view: View.MODERATION_HISTORY, label: 'Moderation History', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
        { view: View.USER_REPORTED, label: 'User Reported', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" /></svg> },
      ]
    },
    {
      label: 'Management',
      items: [
        { view: View.USERS, label: 'User Directory', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg> },
        { view: View.ROLES, label: 'Roles & Access', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg> },
        { view: View.STAFF_APPROVAL, label: 'Staff Approval', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4" /></svg> },
      ]
    },
    {
      label: 'System',
      items: [
        { view: View.AUDIT_LOGS, label: 'Audit Logs', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
        { view: View.SYSTEM_ALERTS, label: 'System Alerts', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
      ]
    }
  ];

  return (
    <aside className={`bg-pureWhite border-r border-gray-100 transition-all duration-300 flex flex-col ${isOpen ? 'w-64' : 'w-20'}`}>
      <div className="p-6 flex items-center justify-between gap-3 overflow-hidden">
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 bg-gradient-to-br from-deepPurple via-indigoPurple to-brightOrange rounded-lg flex items-center justify-center text-pureWhite font-black text-sm shrink-0 shadow-lg shadow-deepPurple/20">AI</div>
          {isOpen && <h1 className="font-bold text-charcoal text-sm tracking-tight whitespace-nowrap">Artistic Admin</h1>}
          {isOpen && <svg className="w-4 h-4 text-gray-300 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>}
        </div>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-6 overflow-y-auto custom-scrollbar">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {isOpen && <h3 className="px-3 text-[10px] font-black text-lightGray uppercase tracking-widest mb-1">{group.label}</h3>}
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <button
                  key={item.view}
                  onClick={() => onViewChange(item.view)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all group ${
                    currentView === item.view 
                      ? 'bg-gradient-to-r from-deepPurple via-indigoPurple to-brightOrange text-white shadow-md shadow-indigoPurple/20' 
                      : 'text-mutedGray hover:bg-gray-50 hover:text-charcoal'
                  }`}
                >
                  <span className={currentView === item.view ? 'text-white' : 'text-lightGray group-hover:text-mutedGray'}>
                    {item.icon}
                  </span>
                  {isOpen && <span className="font-bold text-xs whitespace-nowrap">{item.label}</span>}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-gray-50">
        <button 
          onClick={() => onViewChange(View.PROFILE)}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all group ${
            currentView === View.PROFILE 
              ? 'bg-indigoPurple/5 ring-1 ring-indigoPurple/20' 
              : 'hover:bg-gray-50'
          }`}
        >
          <img src="https://picsum.photos/32/32?random=1" alt="Profile" className="w-8 h-8 rounded-full border border-gray-100 shrink-0 object-cover" />
          {isOpen && (
            <div className="text-left overflow-hidden flex-1">
              <p className="text-xs font-black text-charcoal truncate">Alex Riviera</p>
              <p className="text-[10px] text-lightGray uppercase font-bold tracking-tighter truncate">Super Admin</p>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;