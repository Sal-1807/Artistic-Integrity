
import React from 'react';
import { AuditLogItem } from '../types';

interface AuditLogsProps {
  logs: AuditLogItem[];
}

const AuditLogs: React.FC<AuditLogsProps> = ({ logs }) => {
  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h3 className="text-2xl font-black text-gray-900">Audit Logs</h3>
          <p className="text-gray-400 font-bold text-sm">Compliance record for administrative actions.</p>
        </div>
        <div className="flex gap-3">
          <input type="date" className="bg-white border border-gray-100 rounded-2xl px-6 py-3 text-sm font-bold text-gray-600 outline-none shadow-sm" />
          <button className="px-8 py-3 bg-gray-900 text-white rounded-2xl text-sm font-black shadow-lg">Download CSV</button>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-gray-100 shadow-xl shadow-gray-200/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Admin User</th>
                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Action Taken</th>
                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Target Object</th>
                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Timestamp</th>
                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-xs">
                        {log.user.charAt(0)}
                      </div>
                      <span className="text-sm font-black text-gray-900">{log.user}</span>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <span className="text-sm text-gray-700 font-bold px-4 py-1.5 bg-gray-50 rounded-xl">{log.action}</span>
                  </td>
                  <td className="px-10 py-6">
                    <span className="text-sm text-indigo-600 font-black">{log.target}</span>
                  </td>
                  <td className="px-10 py-6 text-sm text-gray-400 font-bold">{log.time}</td>
                  <td className="px-10 py-6 text-xs text-gray-400 font-black font-mono text-right">{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {logs.length === 0 && (
            <div className="py-24 text-center">
              <p className="text-gray-300 font-black text-sm">No activity recorded.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
