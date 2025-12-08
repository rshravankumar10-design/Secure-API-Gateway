🛡️ Sentinel API Gateway

Sentinel is a next-generation, AI-aware **API Gateway simulation platform** designed for cybersecurity learning, red-team practice, and defensive architecture demonstrations. It showcases real-time threat detection, traffic shaping, SIEM-style monitoring, and simulated auto-ban logic—wrapped in a modern cyberpunk UI.

🔗 **Live Demo:**
👉 [https://secure-api-gateway.vercel.app/](https://secure-api-gateway.vercel.app/)

🚀 Overview

Sentinel is built for:

* Cybersecurity students
* Red/Blue team training labs
* API security demonstrations
* Classroom or workshop simulations

It simulates how a professional API gateway responds to:

| Behavior                | Response Type            |
| ----------------------- | ------------------------ |
| Normal traffic          | 200 OK                   |
| Rate limit exceeded     | 429 Throttled            |
| Malicious payload       | 403 Blocked + Risk Score |
| Severe repeated threats | 🔥 Auto-Ban              |

AI detection is **optional** — you can run Sentinel using rule-based logic only or plug in your own self-hosted inference engine.

---

 🧠 Key Capabilities

 🧩 Threat Detection

Detects suspicious behavior such as:

* SQL Injection
* XSS payloads
* Command Injection patterns
* Sensitive data leaks (PII)
* Repeated malicious traffic signatures

⚡ Traffic Control Engine

* Customizable request rate limits (RPM)
* Distinction between throttled vs blocked requests
* Auto-ban + cooldown timers
* Rule-based and AI-assisted modes

 🎛 Developer + Attacker Simulation

* Load generator for stress tests
* Toggle auth tokens on/off
* Attack payload presets
* Risk scoring per user session

---

📊 Real-Time Dashboard

Sentinel includes a built-in monitoring system with:

✔ Live traffic graph
✔ Method distribution chart
✔ Latency tracking
✔ Terminal-style live event logs
✔ Client intelligence panel (risk score, ban status, violations)

---

 🧰 Tech Stack

| Category          | Technology                                                                        |
| ----------------- | --------------------------------------------------------------------------------- |
| Frontend          | React 19, TypeScript, Vite                                                        |
| UI                | TailwindCSS (Custom cyberpunk theme), Lucide Icons                                |
| Visualizations    | Recharts                                                                          |
| State Persistence | LocalStorage + Hooks                                                              |
| Optional ML Layer | Can connect to **any self-hosted or external inference service** (no vendor lock) |

---

 🏁 Installation

 📌 Requirements

* Node.js 18+
* (Optional) ML backend for AI mode

 ⬇️ Clone Repository

```bash

git clone https://github.com/yourusername/sentinel-api-gateway.git
cd sentinel-api-gateway
```

 📦 Install Dependencies

```bash
npm install
```

 ⚙ Configure Environment

Create `.env` in root:

```env
VITE_AI_ENABLED=false
VITE_RATE_LIMIT_RPM=120
```

(Set `VITE_AI_ENABLED=true` only if connecting to external inference.)

▶ Run Locally

```bash
npm run dev
```

---

 🔐 Demo Credentials

| Role                | Username | Password |
| ------------------- | -------- | -------- |
| Admin               | `server` | `server` |
| Standard            | `zap`    | `lklkl`  |
| Standard            | `ness`   | `pass`   |
| Red-Team Simulation | `blue`   | `hack`   |
| Malicious Actor     | `shark`  | `fail`   |
| Tester              | `hat`    | `test`   |

---

 🧪 How To Use

 🧨 Simulate Attack Traffic

1. Login as a user (ex: `blue`)
2. Click **Load Attack Payload**
3. Enable token if needed
4. Press **Send Request**
5. View blocked status + log output

🚀 Stress Test Rate Limit

1. Open **Traffic Generator**
2. Set **Requests Per Second (RPS)**
3. Click **Start Auto-Fire**
4. Watch the dashboard respond dynamically

---

 ⚙ System Policy Controls

Admins may adjust:

| Setting             | Options                    |
| ------------------- | -------------------------- |
| Security Level      | Standard / High / Paranoid |
| RPM Limit           | 10 → 300                   |
| AI Analysis         | On/Off                     |
| Strict Sanitization | On/Off                     |
| Ban Threshold       | Customizable               |

All settings apply **live without restart**.

---

🧩 Roadmap

* 🔐 JWT Role-Based Access Simulation
* 📦 Persistent backend logging (SQLite/Postgres)
* 🌐 Distributed node simulation
* 🎯 Custom attack builder playground

---

⚠️ Ethical Use Notice

Sentinel is strictly for:

✔ training
✔ research
✔ simulation
✔ ethical pentesting

🚫 Do not use payloads or simulated attacks outside authorized environments.

---

 📄 License

Licensed under the **MIT License**.

---

👤 Author

**Maintainer:** Shravan Kumar
🔗 [https://secure-api-gateway.vercel.app/](https://secure-api-gateway.vercel.app/)


