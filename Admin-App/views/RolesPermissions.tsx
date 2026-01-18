
import React, { useState } from 'react';

const RolesPermissions: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState('Super Admin');

  const roles = [
    { name: 'Super Admin', description: 'Full system access across all modules.', userCount: 3 },
    { name: 'Moderator', description: 'Can handle reports, flags and verify content.', userCount: 5 },
    { name: 'Reviewer', description: 'Dedicated access to AI Verification workbench.', userCount: 4 },
    { name: 'Staff', description: 'Basic operational access and ticket handling.', userCount: 6 }
  ];

  // Mock data mapping staff to roles
  const staffByRole: Record<string, any[]> = {
    'Super Admin': [
      { name: 'Alex Riviera', email: 'alex.r@ai.com', avatar: 'https://picsum.photos/40/40?random=1', joined: 'Mar 2021' },
      { name: 'Sarah Wilson', email: 's.wilson@ai.com', avatar: 'https://picsum.photos/40/40?random=2', joined: 'Jan 2022' },
      { name: 'Marcus Bell', email: 'm.bell@ai.com', avatar: 'https://picsum.photos/40/40?random=3', joined: 'Jun 2022' },
    ],
    'Moderator': [
      { name: 'Tom Hardy', email: 't.hardy@ai.com', avatar: 'https://picsum.photos/40/40?random=10', joined: 'Feb 2023' },
      { name: 'Emily Chen', email: 'e.chen@ai.com', avatar: 'https://picsum.photos/40/40?random=11', joined: 'May 2023' },
      { name: 'Julian Vane', email: 'j.vane@ai.com', avatar: 'https://picsum.photos/40/40?random=12', joined: 'Aug 2023' },
      { name: 'Elena Kosta', email: 'e.kosta@ai.com', avatar: 'https://picsum.photos/40/40?random=13', joined: 'Nov 2023' },
      { name: 'David Wu', email: 'd.wu@ai.com', avatar: 'https://picsum.photos/40/40?random=14', joined: 'Dec 2023' },
    ],
    'Reviewer': [
      { name: 'Liam Neeson', email: 'l.neeson@ai.com', avatar: 'https://picsum.photos/40/40?random=50', joined: 'Jan 2024' },
      { name: 'Sofia Vergara', email: 's.vergara@ai.com', avatar: 'https://picsum.photos/40/40?random=51', joined: 'Jan 2024' },
      { name: 'Keanu Reeves', email: 'k.reeves@ai.com', avatar: 'https://picsum.photos/40/40?random=52', joined: 'Feb 2024' },
      { name: 'Sandra Bullock', email: 's.bullock@ai.com', avatar: 'https://picsum.photos/40/40?random=53', joined: 'Mar 2024' },
    ],
    'Staff': [
      { name: 'Alice Thompson', email: 'a.thom@ai.com', avatar: 'https://picsum.photos/40/40?random=30', joined: 'May 2023' },
      { name: 'Bob Smith', email: 'b.smith@ai.com', avatar: 'https://picsum.photos/40/40?random=31', joined: 'Jun 2023' },
      { name: 'Charlie Dean', email: 'c.dean@ai.com', avatar: 'https://picsum.photos/40/40?random=32', joined: 'Aug 2023' },
      { name: 'Diana Prince', email: 'd.prince@ai.com', avatar: 'https://picsum.photos/40/40?random=33', joined: 'Oct 2023' },
      { name: 'Evan Wright', email: 'e.wright@ai.com', avatar: 'https://picsum.photos/40/40?random=34', joined: 'Jan 2024' },
      { name: 'Fiona Gallagher', email: 'f.gall@ai.com', avatar: 'https://picsum.photos/40/40?random=35', joined: 'Mar 2024' },
    ]
  };

  const permissions = [
    { cat: 'Users', actions: ['View Users', 'Edit Users', 'Delete Users', 'Assign Roles'] },
    { cat: 'Content', actions: ['Verify Content', 'Delete Content', 'Override AI Score', 'Featured List'] },
    { cat: 'System', actions: ['View Audit Logs', 'Manage Staff', 'Edit Settings', 'Billing Access'] },
  ];

  return (
    <div className="space-y-8 animate-fadeIn pb-20">
      <div>
        <h3 className="text-2xl font-bold text-gray-900">Roles & Permissions</h3>
        <p className="text-gray-500">Define access levels and manage administrative personnel privileges.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Role Selection */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex justify-between items-center px-4 mb-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Available Roles</span>
            <button className="text-deepPurple text-[10px] font-bold uppercase tracking-widest hover:text-brightOrange transition-colors">+ New Role</button>
          </div>
          {roles.map((role) => (
            <button 
              key={role.name}
              onClick={() => setSelectedRole(role.name)}
              className={`w-full text-left p-6 rounded-3xl border transition-all relative overflow-hidden group ${selectedRole === role.name ? 'bg-gradient-to-br from-deepPurple via-softLavender to-brightOrange border-transparent shadow-xl shadow-indigoPurple/20 scale-[1.02]' : 'bg-white border-gray-100 hover:border-indigoPurple/30 shadow-sm'}`}
            >
              {selectedRole === role.name && (
                <div className="absolute top-0 right-0 p-2">
                  <svg className="w-4 h-4 text-white/50" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                </div>
              )}
              <div className="flex justify-between items-start mb-2">
                <h4 className={`font-bold text-base ${selectedRole === role.name ? 'text-white' : 'text-gray-900'}`}>{role.name}</h4>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${selectedRole === role.name ? 'bg-white/20 text-white' : 'bg-gray-50 text-gray-500'}`}>{role.userCount} Members</span>
              </div>
              <p className={`text-xs leading-relaxed ${selectedRole === role.name ? 'text-white/80' : 'text-gray-500'}`}>{role.description}</p>
            </button>
          ))}
        </div>

        {/* Right Column: Settings & Assigned Personnel */}
        <div className="lg:col-span-8 space-y-8">
          {/* Permissions Panel */}
          <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-50">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedRole} Privileges</h3>
                <p className="text-sm text-gray-500">Customizing granular access control for this tier.</p>
              </div>
              <button className="px-6 py-2.5 bg-gradient-to-r from-deepPurple to-brightOrange text-white rounded-xl text-sm font-bold shadow-lg shadow-indigoPurple/20 hover:opacity-90 transition-all active:scale-95">Save Changes</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              {permissions.map((p, i) => (
                <div key={i}>
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">{p.cat} Access</h4>
                  <div className="space-y-4">
                    {p.actions.map((action, j) => (
                      <div key={j} className="flex items-center justify-between group">
                        <span className="text-sm font-semibold text-gray-600 group-hover:text-gray-900 transition-colors">{action}</span>
                        <div className={`w-9 h-5 rounded-full relative cursor-pointer transition-colors duration-300 ${selectedRole === 'Super Admin' || (selectedRole === 'Moderator' && i < 2) || (selectedRole === 'Reviewer' && i === 1 && j === 0) ? 'bg-deepPurple' : 'bg-gray-200'}`}>
                          <div className={`absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-all duration-300 ${selectedRole === 'Super Admin' || (selectedRole === 'Moderator' && i < 2) || (selectedRole === 'Reviewer' && i === 1 && j === 0) ? 'right-1' : 'left-1'}`}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Assigned Personnel Panel */}
          <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Staff with this Access</h3>
                <p className="text-sm text-gray-500">Managing individuals currently assigned to the {selectedRole} role.</p>
              </div>
              <button className="text-indigoPurple text-sm font-bold hover:text-brightOrange transition-colors">+ Assign More Staff</button>
            </div>

            <div className="space-y-1">
              {staffByRole[selectedRole]?.map((staff, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img src={staff.avatar} alt={staff.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm" />
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 group-hover:text-deepPurple transition-colors">{staff.name}</h4>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400">{staff.email}</span>
                        <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                        <span className="text-xs text-gray-400">Joined {staff.joined}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="px-3 py-1.5 text-[10px] font-bold text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-indigoPurple/5 hover:text-indigoPurple hover:border-indigoPurple/30 transition-all">
                      Change Role
                    </button>
                    <button className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              ))}
              {(!staffByRole[selectedRole] || staffByRole[selectedRole].length === 0) && (
                <div className="py-12 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                  <p className="text-sm text-gray-500">No staff members assigned to this role yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RolesPermissions;
