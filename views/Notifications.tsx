
import React from 'react';

const Notifications: React.FC = () => {
  const notifications = [
    { id: 1, title: 'System Alert', message: 'Database backup completed successfully at 02:00 AM UTC.', time: '2 hours ago', type: 'success', read: false },
    { id: 2, title: 'High Priority Request', message: 'New staff application from "Leo Sterling" requires your immediate attention.', time: '4 hours ago', type: 'warning', read: false },
    { id: 3, title: 'Content Flagged', message: 'Artwork ID #8292 has been flagged by automated integrity checks for similarity.', time: '1 day ago', type: 'error', read: true },
    { id: 4, title: 'Security Patch', message: 'Admin system updated to v2.4.1. Check release notes for new features.', time: '2 days ago', type: 'info', read: true },
    { id: 5, title: 'New Artist Milestone', message: 'Artist @JulianVane reached 1k verified sales! Sending automated congrats.', time: '3 days ago', type: 'info', read: true },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg></div>;
      case 'warning': return <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg></div>;
      case 'error': return <div className="p-2 bg-rose-50 text-rose-600 rounded-lg"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>;
      default: return <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-gray-900">Notifications</h3>
        <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">Mark all as read</button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm divide-y divide-gray-50 overflow-hidden">
        {notifications.map((notif) => (
          <div key={notif.id} className={`p-6 flex gap-4 hover:bg-gray-50/80 transition-all ${!notif.read ? 'bg-indigo-50/10' : ''}`}>
            {getIcon(notif.type)}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className={`text-sm font-bold ${!notif.read ? 'text-gray-900' : 'text-gray-600'}`}>{notif.title}</h4>
                <span className="text-xs text-gray-400 whitespace-nowrap">{notif.time}</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">{notif.message}</p>
            </div>
            {!notif.read && <div className="w-2 h-2 bg-indigo-600 rounded-full mt-1.5 shrink-0"></div>}
          </div>
        ))}
      </div>
      
      <div className="text-center">
        <button className="px-6 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">Load Older History</button>
      </div>
    </div>
  );
};

export default Notifications;
