import React, { useState } from 'react';
import { View, RequestItem, ReportItem, AuditLogItem } from './types';
import Login from './views/Login';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Overview from './views/Overview';
import IncomingRequests from './views/IncomingRequests';
import VerificationWorkbench from './views/VerificationWorkbench';
import ModerationHistory from './views/ModerationHistory';
import Reports from './views/Reports';
import UserManagement from './views/UserManagement';
import RolesPermissions from './views/RolesPermissions';
import AuditLogs from './views/AuditLogs';
import Notifications from './views/Notifications';
import AdminProfile from './views/AdminProfile';
import StaffApproval from './views/StaffApproval';

const INITIAL_REQUESTS: RequestItem[] = [
  { 
    id: '1', artist: 'Julian Vane', work: 'Neon Horizon', type: 'Digital Illustration', date: '2 mins ago', status: 'Priority', img: 'https://picsum.photos/1200/800?random=20', aiScore: '92.4%',
    metadata: [{ label: 'File Type', value: 'PNG' }, { label: 'Software', value: 'Midjourney v6' }]
  },
  { 
    id: '2', artist: 'Elena Kosta', work: 'The Silent Peak', type: 'Oil on Canvas', date: '15 mins ago', status: 'Regular', img: 'https://picsum.photos/1200/800?random=21', aiScore: '12.1%',
    metadata: [{ label: 'File Type', value: 'JPG' }, { label: 'Software', value: 'Adobe Photoshop' }]
  },
  { 
    id: '3', artist: 'Markus T.', work: 'Binary Soul', type: 'Generative Art', date: '1 hour ago', status: 'Priority', img: 'https://picsum.photos/1200/800?random=22', aiScore: '88.5%',
    metadata: [{ label: 'File Type', value: 'WEBP' }, { label: 'Software', value: 'Stable Diffusion' }]
  },
  { 
    id: '4', artist: 'Sophie L.', work: 'Glass Garden', type: '3D Render', date: '2 hours ago', status: 'Flagged', img: 'https://picsum.photos/1200/800?random=23', aiScore: '45.0%',
    metadata: [{ label: 'File Type', value: 'PNG' }, { label: 'Software', value: 'Blender' }]
  },
  { 
    id: 'report_link_1', artist: '@jul_vane', work: 'City Lights', type: 'Digital Art', date: '3 hours ago', status: 'Flagged', img: 'https://picsum.photos/1200/800?random=55', aiScore: '75.0%',
    metadata: [{ label: 'File Type', value: 'PNG' }, { label: 'Software', value: 'Unknown' }]
  }
];

const INITIAL_REPORTS: ReportItem[] = [
  { id: '#880', content: 'City Lights', artist: '@jul_vane', reason: 'Spam / Repeated', reporter: '@user_12', status: 'Pending', severity: 'Low', requestId: 'report_link_1' },
  { id: '#878', content: 'Neon Dreams', artist: '@cyber_a', reason: 'Low Quality', reporter: '@mod_human', status: 'Resolved', severity: 'Low' },
];

const INITIAL_LOGS: AuditLogItem[] = [
  { id: 1, user: 'Alex Riviera', action: 'System Login', target: 'Admin Portal', time: '1 hour ago', ip: '192.168.1.1' },
];

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.LOGIN);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Global Shared States
  const [requests, setRequests] = useState<RequestItem[]>(INITIAL_REQUESTS);
  const [reports, setReports] = useState<ReportItem[]>(INITIAL_REPORTS);
  const [logs, setLogs] = useState<AuditLogItem[]>(INITIAL_LOGS);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  const addLog = (action: string, target: string) => {
    const newLog: AuditLogItem = {
      id: Date.now(),
      user: 'Alex Riviera',
      action,
      target,
      time: 'Just now',
      ip: '192.168.1.1'
    };
    setLogs(prev => [newLog, ...prev]);
  };

  const handleAction = (requestId: string, action: 'Approved' | 'Rejected', notes?: string) => {
    const request = requests.find(r => r.id === requestId);
    if (!request) return;

    // 1. Update Request Status and add Notes
    setRequests(prev => prev.map(r => r.id === requestId ? { 
      ...r, 
      status: action, 
      notes: notes || 'No reviewer notes provided.',
      reviewedBy: 'Alex Riviera',
      reviewedAt: new Date().toLocaleString()
    } : r));

    // 2. Add to Reports if Rejected or Significant
    const newReport: ReportItem = {
      id: `#${request.id}${Date.now().toString().slice(-2)}`,
      content: request.work,
      artist: request.artist,
      reason: action === 'Rejected' ? 'AI Integrity Violation' : 'Standard Verification',
      reporter: '@system_integrity',
      status: 'Resolved',
      severity: action === 'Rejected' ? 'High' : 'Low'
    };
    setReports(prev => [newReport, ...prev]);

    // 3. Update the matching User Report if it exists
    setReports(prev => prev.map(rep => (rep.requestId === requestId || rep.content === request.work) ? { ...rep, status: 'Resolved' } : rep));

    // 4. Add to Audit Logs
    addLog(`${action} Content`, `${request.work} by ${request.artist}`);
    
    // Reset selection
    if (selectedRequestId === requestId) setSelectedRequestId(null);
  };

  const startReview = (id: string) => {
    setSelectedRequestId(id);
    setCurrentView(View.VERIFICATION_WORKBENCH);
  };

  const handleReportReview = (report: ReportItem) => {
    let reqId = report.requestId;
    if (!reqId) {
       const found = requests.find(r => r.work === report.content);
       if (found) {
         reqId = found.id;
       } else {
         const newId = `temp_${Date.now()}`;
         const newReq: RequestItem = {
           id: newId,
           artist: report.artist,
           work: report.content,
           type: 'Digital Media',
           date: 'Reported',
           status: 'Flagged',
           img: 'https://picsum.photos/1200/800?random=' + Math.floor(Math.random() * 100),
           aiScore: 'Pending',
           metadata: [{ label: 'Reason', value: report.reason }, { label: 'Reporter', value: report.reporter }]
         };
         setRequests(prev => [...prev, newReq]);
         reqId = newId;
       }
    }
    setReports(prev => prev.map(r => r.id === report.id ? { ...r, requestId: reqId } : r));
    startReview(reqId);
  };

  if (currentView === View.LOGIN) {
    return <Login onLogin={() => setCurrentView(View.OVERVIEW)} />;
  }

  const renderView = () => {
    switch (currentView) {
      case View.OVERVIEW: return <Overview />;
      case View.REQUESTS: 
        return <IncomingRequests 
          requests={requests} 
          onReview={startReview}
          onBulkAction={(ids, action) => ids.forEach(id => handleAction(id, action as any))}
        />;
      case View.VERIFICATION_WORKBENCH: 
        return <VerificationWorkbench 
          requests={requests}
          selectedId={selectedRequestId}
          onSelect={setSelectedRequestId}
          onAction={handleAction}
        />;
      case View.MODERATION_HISTORY:
        return <ModerationHistory requests={requests} />;
      case View.USER_REPORTED: 
        return <Reports reports={reports} onReview={handleReportReview} />;
      case View.USERS: return <UserManagement />;
      case View.ROLES: return <RolesPermissions />;
      case View.AUDIT_LOGS: return <AuditLogs logs={logs} />;
      case View.SYSTEM_ALERTS: return <Notifications />; 
      case View.NOTIFICATIONS: return <Notifications />;
      case View.PROFILE: return <AdminProfile onViewLogs={() => setCurrentView(View.AUDIT_LOGS)} />;
      case View.STAFF_APPROVAL: return <StaffApproval />;
      default: return <Overview />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 text-gray-900">
      <Sidebar 
        currentView={currentView} 
        onViewChange={setCurrentView} 
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header 
          title={currentView.replace(/_/g, ' ')} 
          onProfileClick={() => setCurrentView(View.PROFILE)} 
        />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto animate-fadeIn pb-12">
            {renderView()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;