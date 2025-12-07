import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { RequestSimulator } from './components/RequestSimulator';
import { LiveLogs } from './components/LiveLogs';
import { Settings } from './components/Settings';
import { Splash } from './components/Splash';
import { Login } from './components/Login';
import { ClientIntel } from './components/ClientIntel';
import { GatewayConfig, SecurityLevel, RequestPayload, LogEntry, GatewayStats, ClientProfile } from './types';

const INITIAL_CLIENTS: ClientProfile[] = [
  { username: 'zap', ip: '192.168.1.101', loginCount: 0, lastActive: 0, riskScore: 0, status: 'ACTIVE', activityLog: [] },
  { username: 'ness', ip: '192.168.1.102', loginCount: 0, lastActive: 0, riskScore: 0, status: 'ACTIVE', activityLog: [] },
  { username: 'shark', ip: '192.168.1.103', loginCount: 0, lastActive: 0, riskScore: 0, status: 'ACTIVE', activityLog: [] },
  { username: 'hat', ip: '192.168.1.104', loginCount: 0, lastActive: 0, riskScore: 0, status: 'ACTIVE', activityLog: [] },
  { username: 'blue', ip: '192.168.1.105', loginCount: 0, lastActive: 0, riskScore: 0, status: 'ACTIVE', activityLog: [] },
];

const STORAGE_KEYS = {
  CLIENTS: 'sentinel_clients_v1',
  LOGS: 'sentinel_logs_v1',
  STATS: 'sentinel_stats_v1',
  CONFIG: 'sentinel_config_v1',
  BLOCKED_IPS: 'sentinel_blocked_ips_v1',
  VIOLATIONS: 'sentinel_violations_v1'
};

const loadFromStorage = <T,>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error(`Error loading ${key} from storage`, e);
    return fallback;
  }
};

export default function App() {
  const [viewMode, setViewMode] = useState<'SPLASH' | 'LOGIN' | 'APP'>('SPLASH');
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Auth State
  const [currentUser, setCurrentUser] = useState<string>('zap'); 
  const [isServerAdmin, setIsServerAdmin] = useState(false);
  
  // Initialize Clients from Storage to persist login counts and activity
  const [clients, setClients] = useState<ClientProfile[]>(() => 
    loadFromStorage(STORAGE_KEYS.CLIENTS, INITIAL_CLIENTS)
  );

  // App State - Persistence enabled
  const [logs, setLogs] = useState<LogEntry[]>(() => 
    loadFromStorage(STORAGE_KEYS.LOGS, [])
  );
  
  const [stats, setStats] = useState<GatewayStats>(() => 
    loadFromStorage(STORAGE_KEYS.STATS, {
      totalRequests: 0,
      blockedRequests: 0,
      avgLatency: 45,
      activeThreats: 0,
      globalBans: 0
    })
  );
  
  // Chart Data (Transient for this session's view)
  const [trafficData, setTrafficData] = useState<any[]>(() => {
    const data = [];
    const now = new Date();
    for (let i = 19; i >= 0; i--) {
       const t = new Date(now.getTime() - i * 1000);
       data.push({
         time: `${t.getHours()}:${t.getMinutes()}:${t.getSeconds()}`,
         valid: 0,
         blocked: 0
       });
    }
    return data;
  });

  // Config State - Persistence enabled
  const [config, setConfig] = useState<GatewayConfig>(() => 
    loadFromStorage(STORAGE_KEYS.CONFIG, {
      rateLimitEnabled: true,
      rateLimitMax: 60,
      jwtRequired: true,
      reverseAttackEnabled: false,
      securityLevel: SecurityLevel.HIGH
    })
  );

  const [validToken, setValidToken] = useState<string | null>(null);
  const [lastInvalidatedToken, setLastInvalidatedToken] = useState<string | null>(null);

  // Rate Limiting & Ban State
  const [ipRequestHistory, setIpRequestHistory] = useState<Record<string, number[]>>({});
  
  const [violationCounts, setViolationCounts] = useState<Record<string, number>>(() => 
    loadFromStorage(STORAGE_KEYS.VIOLATIONS, {})
  );
  
  const [blockedIps, setBlockedIps] = useState<Set<string>>(() => {
    const stored = loadFromStorage(STORAGE_KEYS.BLOCKED_IPS, []);
    return new Set(stored);
  });

  // --- Persistence Effects ---
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VIOLATIONS, JSON.stringify(violationCounts));
  }, [violationCounts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BLOCKED_IPS, JSON.stringify(Array.from(blockedIps)));
  }, [blockedIps]);
  // ---------------------------

  // Handle Login
  const handleLogin = (username: string, isAdmin: boolean) => {
    setCurrentUser(username);
    setIsServerAdmin(isAdmin);
    
    // Update Client Stats for Login if not admin
    if (!isAdmin) {
      setClients(prev => prev.map(c => {
        if (c.username === username) {
          return {
            ...c,
            loginCount: c.loginCount + 1,
            lastActive: Date.now(),
            activityLog: [...c.activityLog, { action: 'SYSTEM_LOGIN', timestamp: Date.now() }]
          };
        }
        return c;
      }));
      // Force clients to their simulator view
      setActiveTab('client');
    } else {
      setActiveTab('dashboard');
    }
    
    setViewMode('APP');
  };

  // Token Generator
  const generateToken = () => {
    const token = 'sk_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setValidToken(token);
    setLastInvalidatedToken(null); 
    
    // Log token generation for current user
    if (!isServerAdmin) {
      setClients(prev => prev.map(c => {
        if (c.username === currentUser) {
          return {
            ...c,
            activityLog: [...c.activityLog, { action: 'GENERATED_TOKEN', timestamp: Date.now() }]
          };
        }
        return c;
      }));
    }
    
    return token;
  };

  // Process Request Logic (The "Gateway")
  const handleRequest = async (req: RequestPayload): Promise<number> => {
    // Determine which client IP to use based on username in request (if admin simulating) or current user
    // If Admin is simulating traffic, 'req.username' will be set by the simulator.
    const effectiveUsername = req.username || currentUser;
    const clientProfile = clients.find(c => c.username === effectiveUsername);
    const clientIp = clientProfile ? clientProfile.ip : '127.0.0.1'; // Localhost for admin/unknown
    
    req.clientIp = clientIp; 
    req.username = effectiveUsername;

    // 0. Check Blacklist
    if (blockedIps.has(clientIp) || clientProfile?.status === 'BANNED') {
      const blockedLog: LogEntry = {
        id: crypto.randomUUID(),
        requestId: req.id,
        timestamp: Date.now(),
        method: req.method,
        endpoint: req.endpoint,
        status: 403,
        duration: 1,
        clientIp: clientIp,
        username: effectiveUsername,
        actionTaken: 'BLOCKED',
        threatDetected: 'BANNED_IP',
        details: "Connection refused: Client banned.",
      };

      setLogs(prev => [blockedLog, ...prev].slice(0, 100));
      return 403;
    }

    const startTime = performance.now();
    let action: LogEntry['actionTaken'] = 'ALLOWED';
    let threat: string | undefined = undefined;
    let status = 200;
    let details = "Request processed successfully.";

    const now = Date.now();

    // 1. Rate Limiting
    if (config.rateLimitEnabled) {
      const windowMs = 60000;
      const history = ipRequestHistory[clientIp] || [];
      const recentRequests = history.filter(t => t > now - windowMs);
      
      setIpRequestHistory(prev => ({
        ...prev,
        [clientIp]: [...recentRequests, now]
      }));

      if (recentRequests.length >= config.rateLimitMax) {
        action = 'BLOCKED';
        status = 429;
        details = `Rate limit exceeded. Max ${config.rateLimitMax} RPM.`;
        threat = "Rate Limit Violation";
      }
    }

    // 2. Auth Check
    if (action === 'ALLOWED' && config.jwtRequired) {
      if (!req.authToken) {
        action = 'BLOCKED';
        status = 401;
        details = "Missing authentication token.";
      } else if (req.authToken !== validToken) {
        action = 'BLOCKED';
        status = 403;
        details = "Invalid or expired token.";
        threat = "Unauthorized Access";
      } else {
        setLastInvalidatedToken(validToken);
        setValidToken(null); 
      }
    }

    // 3. AI Threat Detection (Disabled)

    // 5. Auto-Ban & Tracking Logic
    let newRiskScoreAdd = 0;
    if (action === 'BLOCKED') {
      newRiskScoreAdd = 20;
      setViolationCounts(prev => {
        const count = (prev[clientIp] || 0) + 1;
        if (count >= 5 && !blockedIps.has(clientIp)) {
           setBlockedIps(bans => new Set(bans).add(clientIp));
           details += " [CLIENT BANNED]";
        }
        return { ...prev, [clientIp]: count };
      });
    }

    // Update Client Profile Stats (Attributes activity to correct user even if Admin is simulating)
    if (clientProfile) {
      setClients(prev => prev.map(c => {
        if (c.username === effectiveUsername) {
          const updatedRisk = Math.min(100, c.riskScore + newRiskScoreAdd);
          return {
            ...c,
            lastActive: Date.now(),
            riskScore: updatedRisk,
            status: blockedIps.has(clientIp) || updatedRisk >= 100 ? 'BANNED' : updatedRisk > 50 ? 'FLAGGED' : 'ACTIVE',
            activityLog: [...c.activityLog, { action: `${req.method} ${req.endpoint} - ${action}`, timestamp: Date.now() }].slice(-20)
          };
        }
        return c;
      }));
    }

    // Update Global Stats
    const latency = Math.round(performance.now() - startTime);
    const newLog: LogEntry = {
      id: crypto.randomUUID(),
      requestId: req.id,
      timestamp: Date.now(),
      method: req.method,
      endpoint: req.endpoint,
      status,
      duration: latency,
      clientIp: clientIp,
      username: effectiveUsername,
      actionTaken: action,
      threatDetected: threat,
      details
    };

    setLogs(prev => [newLog, ...prev].slice(0, 100));
    setStats(prev => ({
      totalRequests: prev.totalRequests + 1,
      blockedRequests: action === 'BLOCKED' ? prev.blockedRequests + 1 : prev.blockedRequests,
      avgLatency: Math.round((prev.avgLatency + latency) / 2),
      activeThreats: action === 'BLOCKED' ? prev.activeThreats + 1 : prev.activeThreats,
      globalBans: blockedIps.size + (action === 'BLOCKED' && violationCounts[clientIp] >= 4 ? 1 : 0)
    }));
    
    // Chart Data
    setTrafficData(prev => {
       const now = new Date();
       const timeLabel = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
       // If last point is same second, update it, else append
       const last = prev[prev.length - 1];
       if (last && last.time === timeLabel) {
         const newLast = { ...last };
         if (action === 'BLOCKED') newLast.blocked += 1;
         else if (action === 'ALLOWED') newLast.valid += 1;
         return [...prev.slice(0, -1), newLast];
       }
       return [...prev.slice(1), { 
          time: timeLabel, 
          valid: action === 'ALLOWED' ? 1 : 0, 
          blocked: action === 'BLOCKED' ? 1 : 0 
       }];
    });

    return status;
  };

  // Keep traffic chart alive
  useEffect(() => {
    const interval = setInterval(() => {
      setTrafficData(prev => {
        if (prev.length === 0) return prev;
        const last = prev[prev.length - 1];
        const now = new Date();
        const timeLabel = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
        if (last.time !== timeLabel) {
           return [...prev.slice(1), { time: timeLabel, valid: 0, blocked: 0 }];
        }
        return prev;
      });
    }, 1000); // 1s interval
    return () => clearInterval(interval);
  }, []);

  const renderContent = () => {
    // Filter logs for the current user to display in the client simulator
    // If admin, show logs relevant to the simulation context, or all? 
    // Let's keep it simple: if Admin, show recent logs from EVERYONE in the simulator history, or just the simulated user?
    // Current behavior filters by 'currentUser'. If Admin, currentUser is 'server'.
    // We want admin to see logs for 'simulatedUser' or all. 
    // For now, let's just pass all logs if admin, or filter by currentUser if not.
    const clientLogs = isServerAdmin ? logs : logs.filter(l => l.username === currentUser);

    // Permission Check
    if (!isServerAdmin && activeTab !== 'client') {
       return <RequestSimulator 
          onSendRequest={handleRequest} 
          generateToken={generateToken} 
          currentToken={validToken} 
          lastUsedToken={lastInvalidatedToken} 
          rateLimitMax={config.rateLimitMax} 
          recentRequests={clientLogs}
        />;
    }

    switch(activeTab) {
      case 'dashboard': return <Dashboard stats={stats} trafficData={trafficData} />;
      case 'client': return <RequestSimulator 
          onSendRequest={handleRequest} 
          generateToken={generateToken} 
          currentToken={validToken} 
          lastUsedToken={lastInvalidatedToken} 
          rateLimitMax={config.rateLimitMax} 
          recentRequests={clientLogs}
          isAdmin={isServerAdmin}
          clients={clients}
        />;
      case 'logs': return <LiveLogs logs={logs} />;
      case 'intel': return <ClientIntel clients={clients} />;
      case 'settings': return <Settings config={config} setConfig={setConfig} />;
      default: return <Dashboard stats={stats} trafficData={trafficData} />;
    }
  };

  if (viewMode === 'SPLASH') return <Splash onComplete={() => setViewMode('LOGIN')} />;
  if (viewMode === 'LOGIN') return <Login onLogin={handleLogin} />;

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab} currentUser={currentUser} isAdmin={isServerAdmin}>
      {renderContent()}
    </Layout>
  );
}