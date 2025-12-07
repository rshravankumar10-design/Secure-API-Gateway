export enum SecurityLevel {
  STANDARD = 'STANDARD',
  HIGH = 'HIGH',
  PARANOID = 'PARANOID'
}

export interface GatewayConfig {
  rateLimitEnabled: boolean;
  rateLimitMax: number;
  jwtRequired: boolean;
  reverseAttackEnabled: boolean;
  securityLevel: SecurityLevel;
}

export interface RequestPayload {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  headers: Record<string, string>;
  body?: string;
  timestamp: number;
  clientIp: string;
  authToken?: string;
  username?: string; // Track who sent it
}

export interface LogEntry {
  id: string;
  requestId: string;
  timestamp: number;
  method: string;
  endpoint: string;
  status: number;
  duration: number;
  clientIp: string;
  username?: string;
  actionTaken: 'ALLOWED' | 'BLOCKED' | 'REDIRECTED';
  threatDetected?: string;
  details: string;
}

export interface GatewayStats {
  totalRequests: number;
  blockedRequests: number;
  avgLatency: number;
  activeThreats: number;
  globalBans: number;
}

export interface ClientProfile {
  username: string;
  ip: string;
  loginCount: number;
  lastActive: number;
  riskScore: number;
  status: 'ACTIVE' | 'FLAGGED' | 'BANNED';
  activityLog: { action: string; timestamp: number }[];
}