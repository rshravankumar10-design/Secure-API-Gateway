export enum SecurityLevel {
  STANDARD = 'STANDARD',
  HIGH = 'HIGH',
  PARANOID = 'PARANOID'
}

export interface GatewayConfig {
  rateLimitEnabled: boolean;
  rateLimitMax: number; // requests per minute
  jwtRequired: boolean;
  aiThreatDetection: boolean; // AI-powered threat analysis
  reverseAttackEnabled: boolean; // Simulate reverse attack countermeasures
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
  status: number; // HTTP status
  duration: number; // ms
  clientIp: string;
  username?: string; // Track who did it
  actionTaken: 'ALLOWED' | 'BLOCKED' | 'REDIRECTED' | 'REVERSE_ATTACK';
  threatDetected?: string;
  details: string;
  aiAnalysis?: AIAnalysisResult;
}

export interface AIAnalysisResult {
  isSafe: boolean;
  threatType?: 'SQL_INJECTION' | 'XSS' | 'COMMAND_INJECTION' | 'XXE' | 'PATH_TRAVERSAL' | 'ANOMALY' | null;
  confidenceScore: number; // 0-100
  explanation: string;
  suggestedAction: 'ALLOW' | 'BLOCK' | 'REVERSE_ATTACK';
  detectedPatterns: string[];
  reverseAttackPayload?: string; // Counter-attack payload for reverse attack mode
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
  riskScore: number; // 0-100
  status: 'ACTIVE' | 'FLAGGED' | 'BANNED';
  activityLog: { action: string; timestamp: number }[];
}