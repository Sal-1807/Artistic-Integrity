
import React, { useState } from 'react';

interface AdminProfileProps {
  onViewLogs?: () => void;
}

const AdminProfile: React.FC<AdminProfileProps> = ({ onViewLogs }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tfa, setTfa] = useState(true);
  const [notifications, setNotifications] = useState(false);

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-fadeIn pt-4">
      {/* Search Bar - Matching the screenshot top area */}
      <div className="flex justify-center mb-8">
        <div className="relative w-full max-w-4xl flex gap-4">
          <div className="relative flex-1">
            <input 
              type="text" 
              placeholder="Search users, content, posts by name, email, ID or status..." 
              className="w-full pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm outline-none text-sm text-gray-600 focus:ring-2 focus:ring-deepPurple/5 transition-all"
            />
            <svg className="w-5 h-5 absolute left-4 top-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <button className="px-8 bg-indigo-600 text-white rounded-2xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-indigo-200">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
            Filters
          </button>
        </div>
      </div>

      {/* Main Profile Header Card */}
      <div className="bg-white rounded-[40px] border border-gray-100 shadow-xl shadow-gray-200/40 overflow-hidden">
        {/* Banner */}
        <div className="h-44 bg-indigo-600 relative overflow-hidden">
           {/* Decorative abstract elements can go here */}
        </div>
        
        <div className="relative px-12 pb-12">
          {/* Overlapping Avatar */}
          <div className="absolute -top-16 left-12">
            <div className="relative">
              <img 
                src="https://picsum.photos/200/200?random=alex" 
                alt="Profile" 
                className="w-32 h-32 rounded-[32px] border-4 border-white shadow-2xl object-cover"
              />
              <button className="absolute bottom-1 right-1 p-2.5 bg-white rounded-xl shadow-lg border border-gray-100 text-gray-500 hover:text-indigo-600 transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </button>
            </div>
          </div>

          {/* Name and Action Buttons */}
          <div className="pt-20 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">Alex Riviera</h2>
              <p className="text-gray-400 font-bold text-sm mt-1">Head of Operations & Platform Security</p>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={onViewLogs}
                className="px-8 py-3 bg-white border border-gray-100 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all shadow-sm"
              >
                View Logs
              </button>
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className={`px-8 py-3 rounded-xl text-sm font-bold transition-all shadow-lg ${
                  isEditing 
                  ? 'bg-emerald-500 text-white shadow-emerald-100' 
                  : 'bg-indigo-600 text-white shadow-indigo-200 hover:opacity-95'
                }`}
              >
                {isEditing ? 'Save Changes' : 'Edit Profile'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Personal Information Panel */}
        <div className="bg-white p-12 rounded-[40px] border border-gray-100 shadow-xl shadow-gray-200/40">
          <h3 className="text-xl font-black text-gray-900 mb-10">Personal Information</h3>
          
          <div className="space-y-8">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Full Name</label>
              {isEditing ? (
                <input type="text" defaultValue="Alexandria Riviera" className="w-full py-2 border-b border-gray-100 text-base font-bold text-gray-900 outline-none focus:border-indigo-600" />
              ) : (
                <p className="text-base font-bold text-gray-900">Alexandria Riviera</p>
              )}
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Email Address</label>
              {isEditing ? (
                <input type="email" defaultValue="alex.r@artisticintegrity.com" className="w-full py-2 border-b border-gray-100 text-base font-bold text-gray-900 outline-none focus:border-indigo-600" />
              ) : (
                <p className="text-base font-bold text-gray-900">alex.r@artisticintegrity.com</p>
              )}
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Employee ID</label>
              <p className="text-base font-bold text-gray-900">ADM-9021-02</p>
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Joined Company</label>
              <p className="text-base font-bold text-gray-900">March 2021 (3 years ago)</p>
            </div>
          </div>
        </div>

        {/* Security Panel */}
        <div className="bg-white p-12 rounded-[40px] border border-gray-100 shadow-xl shadow-gray-200/40">
          <h3 className="text-xl font-black text-gray-900 mb-10">Security & Preferences</h3>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between p-6 bg-gray-50/40 rounded-3xl group transition-all hover:bg-white border border-transparent hover:border-indigo-600/10">
              <div>
                <p className="text-sm font-black text-gray-900">Two-Factor Authentication</p>
                <p className="text-xs text-gray-400 font-bold mt-0.5">Secure your account with 2FA</p>
              </div>
              <button 
                onClick={() => setTfa(!tfa)}
                className={`w-12 h-6 rounded-full relative transition-all duration-300 ${tfa ? 'bg-indigo-600' : 'bg-gray-200'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300 ${tfa ? 'right-1' : 'left-1'}`}></div>
              </button>
            </div>

            <div className="flex items-center justify-between p-6 bg-gray-50/40 rounded-3xl group transition-all hover:bg-white border border-transparent hover:border-indigo-600/10">
              <div>
                <p className="text-sm font-black text-gray-900">Push Notifications</p>
                <p className="text-xs text-gray-400 font-bold mt-0.5">Alerts for high-priority requests</p>
              </div>
              <button 
                onClick={() => setNotifications(!notifications)}
                className={`w-12 h-6 rounded-full relative transition-all duration-300 ${notifications ? 'bg-indigo-600' : 'bg-gray-200'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300 ${notifications ? 'right-1' : 'left-1'}`}></div>
              </button>
            </div>

            <button className="w-full flex items-center justify-between p-6 rounded-3xl border border-gray-100 hover:border-rose-200 hover:bg-rose-50 transition-all text-left">
              <span className="text-sm font-black text-rose-600">Reset Master Password</span>
              <svg className="w-5 h-5 text-rose-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
