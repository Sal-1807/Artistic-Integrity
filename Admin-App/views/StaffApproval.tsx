
import React from 'react';

const StaffApproval: React.FC = () => {
  const applicants = [
    { id: '1', name: 'Liam Neeson', role: 'Art Curator', exp: '8 years', source: 'Internal Referral', date: 'Yesterday', avatar: 'https://picsum.photos/80/80?random=50' },
    { id: '2', name: 'Sofia Vergara', role: 'Verification Expert', exp: '4 years', source: 'Direct Application', date: '3 days ago', avatar: 'https://picsum.photos/80/80?random=51' },
    { id: '3', name: 'Keanu Reeves', role: 'Safety Moderator', exp: '12 years', source: 'LinkedIn', date: 'Last Week', avatar: 'https://picsum.photos/80/80?random=52' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-bold text-gray-900">Staff Approval Queue</h3>
        <p className="text-gray-500">Review and authorize new team members before they gain platform access.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {applicants.map((applicant) => (
          <div key={applicant.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col">
            <div className="flex items-start gap-4 mb-6">
              <img src={applicant.avatar} alt={applicant.name} className="w-16 h-16 rounded-2xl object-cover ring-4 ring-gray-50" />
              <div className="flex-1">
                <div className="flex justify-between">
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{applicant.role}</span>
                  <span className="text-[10px] font-bold text-gray-400">{applicant.date}</span>
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-1">{applicant.name}</h4>
                <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  {applicant.exp} experience
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-8">
              <div className="flex justify-between text-xs py-2 border-b border-gray-50">
                <span className="text-gray-400">Application Source</span>
                <span className="font-semibold text-gray-700">{applicant.source}</span>
              </div>
              <div className="flex justify-between text-xs py-2 border-b border-gray-50">
                <span className="text-gray-400">Background Check</span>
                <span className="font-semibold text-emerald-600 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  Verified
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-auto">
              <button className="py-2.5 px-4 bg-gray-50 text-gray-600 font-bold rounded-xl text-sm hover:bg-rose-50 hover:text-rose-600 transition-colors">Decline</button>
              <button className="py-2.5 px-4 bg-indigo-600 text-white font-bold rounded-xl text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">Approve</button>
            </div>
          </div>
        ))}
        
        <button className="h-full min-h-[300px] border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center gap-3 text-gray-400 hover:border-indigo-200 hover:text-indigo-400 transition-all group p-6">
          <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          </div>
          <span className="text-sm font-semibold">Invite New Staff</span>
        </button>
      </div>
    </div>
  );
};

export default StaffApproval;
