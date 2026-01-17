
import React, { useState } from 'react';

type UserFilter = 'All Users' | 'Active' | 'Verified' | 'Suspended';

const UserManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<UserFilter>('All Users');

  const allUsers = [
    { id: '1', name: 'Alice Thompson', email: 'alice@example.com', role: 'Artist', status: 'Active', isVerified: true, joins: 'May 12, 2023', avatar: 'https://picsum.photos/40/40?random=30' },
    { id: '2', name: 'Bob Smith', email: 'bob@design.com', role: 'Collector', status: 'Active', isVerified: false, joins: 'Jun 08, 2023', avatar: 'https://picsum.photos/40/40?random=31' },
    { id: '3', name: 'Charlie Dean', email: 'dean@charlie.net', role: 'Artist', status: 'Suspended', isVerified: true, joins: 'Aug 22, 2023', avatar: 'https://picsum.photos/40/40?random=32' },
    { id: '4', name: 'Diana Prince', email: 'diana@themiscyra.io', role: 'Staff', status: 'Active', isVerified: true, joins: 'Oct 01, 2023', avatar: 'https://picsum.photos/40/40?random=33' },
    { id: '5', name: 'Evan Wright', email: 'evan@wright.com', role: 'Collector', status: 'Inactive', isVerified: false, joins: 'Jan 15, 2024', avatar: 'https://picsum.photos/40/40?random=34' },
    { id: '6', name: 'Julian Vane', email: 'vane@art.com', role: 'Artist', status: 'Active', isVerified: true, joins: 'Feb 10, 2024', avatar: 'https://picsum.photos/40/40?random=35' },
    { id: '7', name: 'Elena Kosta', email: 'elena@kosta.gr', role: 'Artist', status: 'Suspended', isVerified: false, joins: 'Mar 02, 2024', avatar: 'https://picsum.photos/40/40?random=36' },
  ];

  const filteredUsers = allUsers.filter(user => {
    if (activeTab === 'All Users') return true;
    if (activeTab === 'Active') return user.status === 'Active';
    if (activeTab === 'Verified') return user.isVerified;
    if (activeTab === 'Suspended') return user.status === 'Suspended';
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">User Directory</h3>
          <p className="text-gray-500">Manage all registered users, roles, and account permissions.</p>
        </div>
        
        {/* 4-Frame Filtering Tabs */}
        <div className="flex p-1.5 bg-white border border-gray-100 rounded-2xl shadow-sm self-start md:self-auto">
          {(['All Users', 'Active', 'Verified', 'Suspended'] as UserFilter[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                activeTab === tab 
                  ? 'bg-gradient-to-r from-deepPurple via-indigoPurple to-brightOrange text-white shadow-md shadow-indigoPurple/20' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab}
              <span className={`ml-2 px-1.5 py-0.5 rounded-md text-[9px] ${
                activeTab === tab ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'
              }`}>
                {tab === 'All Users' ? allUsers.length : allUsers.filter(u => {
                  if (tab === 'Active') return u.status === 'Active';
                  if (tab === 'Verified') return u.isVerified;
                  return u.status === 'Suspended';
                }).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex gap-4">
          <div className="relative flex-1">
            <input 
              type="text" 
              placeholder="Filter current view by name, email or ID..." 
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigoPurple/10 outline-none transition-all text-sm" 
            />
            <svg className="w-5 h-5 absolute left-4 top-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <button className="px-5 py-3 bg-gray-50 text-gray-600 rounded-2xl font-semibold text-sm hover:bg-gray-100 transition-colors">Export CSV</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/30">
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">User</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Role</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Verified</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Joined</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full border border-gray-100" />
                      <div>
                        <p className="text-sm font-bold text-gray-900 leading-none mb-1">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${user.role === 'Staff' ? 'bg-purple-50 text-purple-700' : user.role === 'Artist' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    {user.isVerified ? (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-indigoPurple">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.64.304 1.24.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                        Yes
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-gray-300">No</span>
                    )}
                  </td>
                  <td className="px-8 py-5 text-sm text-gray-500">{user.joins}</td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${user.status === 'Active' ? 'bg-emerald-500' : user.status === 'Suspended' ? 'bg-rose-500' : 'bg-gray-400'}`}></div>
                      <span className="text-sm font-medium text-gray-700">{user.status}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="text-gray-400 hover:text-deepPurple p-1.5 hover:bg-indigoPurple/5 rounded-lg transition-all">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-gray-400 font-bold text-sm">No users match the selected criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
