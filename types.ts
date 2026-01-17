import React from 'react';

export enum View {
  LOGIN = 'LOGIN',
  OVERVIEW = 'OVERVIEW',
  REQUESTS = 'REQUESTS',
  VERIFICATION_WORKBENCH = 'VERIFICATION_WORKBENCH',
  MODERATION_HISTORY = 'MODERATION_HISTORY',
  USER_REPORTED = 'USER_REPORTED',
  USERS = 'USERS',
  ROLES = 'ROLES',
  AUDIT_LOGS = 'AUDIT_LOGS',
  SYSTEM_ALERTS = 'SYSTEM_ALERTS',
  NOTIFICATIONS = 'NOTIFICATIONS',
  PROFILE = 'PROFILE',
  STAFF_APPROVAL = 'STAFF_APPROVAL'
}

export type RequestStatus = 'Priority' | 'Regular' | 'Flagged' | 'Approved' | 'Rejected';

export interface RequestItem {
  id: string;
  artist: string;
  work: string;
  type: string;
  date: string;
  status: RequestStatus;
  img: string;
  aiScore: string;
  metadata: { label: string; value: string }[];
  notes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface ReportItem {
  id: string;
  content: string;
  artist: string;
  reason: string;
  reporter: string;
  status: 'Pending' | 'In Review' | 'Resolved';
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  requestId?: string; // Link to a request item for workbench review
}

export interface AuditLogItem {
  id: number;
  user: string;
  action: string;
  target: string;
  time: string;
  ip: string;
}

export interface StatCardProps {
  label: string;
  value: string;
  trend: string;
  trendUp: boolean;
  icon: React.ReactNode;
}