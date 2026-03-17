import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ChapterProps { onProgress: (id: number) => void; }

/* ── OAuth 2.0 Flow Visualizer ── */
function OAuthFlow() {
  const [step, setStep] = useState(0);
  const steps = [
    { from: '👤 User', to: '📱 App', msg: 'Clicks "Login with Google"', color: '#6366f1' },
    { from: '📱 App', to: '🔐 Auth Server', msg: 'Redirects to Google OAuth (with client_id, redirect_uri, scope)', color: '#f59e0b' },
    { from: '👤 User', to: '🔐 Auth Server', msg: 'User logs in, grants permissions', color: '#10b981' },
    { from: '🔐 Auth Server', to: '📱 App', msg: 'Redirects back with authorization code', color: '#8b5cf6' },
    { from: '📱 App', to: '🔐 Auth Server', msg: 'Exchanges code for access_token + refresh_token (server-to-server)', color: '#0ea5e9' },
    { from: '📱 App', to: '🗄️ API', msg: 'Uses access_token to call protected APIs', color: '#10b981' },
  ];

  useEffect(() => {
    const t = setInterval(() => setStep(s => (s + 1) % (steps.length + 1)), 1800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="space-y-2">
      {steps.map((s, i) => (
        <motion.div key={i}
          animate={{ opacity: i < step ? 1 : 0.15 }}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs"
          style={{ backgroundColor: i < step ? `${s.color}11` : 'transparent' }}>
          <span className="w-5 h-5 rounded-full text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: i < step ? s.color : '#d1d5db' }}>{i + 1}</span>
          <span className="font-semibold w-28 flex-shrink-0" style={{ color: s.color }}>{s.from} → {s.to}</span>
          <span className="text-gray-700 dark:text-gray-300">{s.msg}</span>
        </motion.div>
      ))}
    </div>
  );
}

export default function Chapter19_Security({ onProgress }: ChapterProps) {
  useEffect(() => { onProgress(19); }, []);
  const fadeUp = { initial: { opacity: 0, y: 16 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-10 space-y-14">
      <motion.div {...fadeUp}>
        <div className="text-xs font-mono text-indigo-500 uppercase tracking-widest mb-1">Chapter 18</div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">🔐 Security & Authentication</h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg">OAuth 2.0, JWT tokens, encryption at rest and in transit, and common web vulnerabilities.</p>
      </motion.div>

      {/* Why Security Matters */}
      <motion.section {...fadeUp} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">🧠 Security in System Design</h2>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          Security in system design isn't about memorizing OWASP — it's about understanding <strong className="text-gray-800 dark:text-gray-200">two fundamental questions</strong>: (1) <strong>Authentication</strong> — "Who are you?" and (2) <strong>Authorization</strong> — "What are you allowed to do?" Every system must answer both. Authentication verifies identity (login). Authorization checks permissions (access control).
        </p>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          Think of it like an airport: <strong className="text-gray-800 dark:text-gray-200">authentication is showing your passport</strong> (proving who you are). <strong className="text-gray-800 dark:text-gray-200">Authorization is your boarding pass</strong> (proving what you're allowed to access — economy seat 14A, not the cockpit). A good security system ensures both checks happen at every request.
        </p>
      </motion.section>

      {/* Auth methods */}
      <motion.section {...fadeUp} className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">1</span>
          Authentication Methods — Compared
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 ml-9">
          There are three main approaches to authentication. The choice depends on your architecture: sessions for traditional web apps, JWTs for APIs and SPAs, and OAuth for third-party login.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: 'Session-Based', icon: '🍪', desc: 'Server creates a session on login and stores it (Redis/DB). A session ID is sent as a cookie with every request. The server looks up the session to identify the user.', pros: 'Easy to revoke — just delete the session. Server-controlled.', cons: 'Stateful — requires shared session store for multiple servers. Doesn\'t work well for mobile APIs.', use: 'Traditional web apps (Rails, Django)' },
            { name: 'JWT (Token-Based)', icon: '🎫', desc: 'Server creates a signed token containing user info (claims). Client stores the token and sends it in the Authorization header. Server verifies the signature — no database lookup needed.', pros: 'Stateless — any server can verify. Perfect for microservices and mobile.', cons: 'Can\'t revoke until expiry (unless you maintain a blocklist, which defeats the purpose).', use: 'APIs, SPAs, mobile apps, microservices' },
            { name: 'OAuth 2.0', icon: '🔑', desc: 'A delegation protocol — lets users grant limited access to third-party apps without sharing their password. The app gets an access token, not the user\'s credentials.', pros: 'Industry standard for SSO. Supports multiple grant types for different scenarios.', cons: 'Complex — 4 grant types, token management, refresh flows.', use: '"Login with Google/GitHub/Apple"' },
          ].map(m => (
            <div key={m.name} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 space-y-2">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm">{m.icon} {m.name}</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{m.desc}</p>
              <div className="text-xs text-emerald-600">✅ {m.pros}</div>
              <div className="text-xs text-red-500">❌ {m.cons}</div>
              <div className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">{m.use}</div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* JWT Anatomy */}
      <motion.section {...fadeUp} className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">2</span>
          JWT Token — Anatomy & Security
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 ml-9">
          A JWT is three Base64-encoded JSON objects separated by dots. It's <strong className="text-gray-800 dark:text-gray-200">signed, not encrypted</strong> — anyone can read the payload, but no one can modify it without the server's secret key. This is why you should never put sensitive data (passwords, credit cards) in a JWT.
        </p>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 space-y-3">
          <div className="font-mono text-xs">
            <span className="text-red-500">eyJhbGciOiJIUzI1NiJ9</span>
            <span className="text-gray-400">.</span>
            <span className="text-purple-500">eyJ1c2VyX2lkIjoiMTIzIn0</span>
            <span className="text-gray-400">.</span>
            <span className="text-blue-500">SflKxwRJSMeKKF2QT4fwpM</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {[
              { part: 'Header', color: '#ef4444', content: '{"alg": "HS256", "typ": "JWT"}', desc: 'Algorithm (HS256 = HMAC-SHA256) and token type' },
              { part: 'Payload', color: '#8b5cf6', content: '{"user_id": "123", "role": "admin", "exp": 1700000}', desc: 'Claims: user data + expiry. NOT encrypted — just base64-encoded.' },
              { part: 'Signature', color: '#3b82f6', content: 'HMAC-SHA256(header.payload, secret)', desc: 'Prevents tampering. Server verifies this on every request.' },
            ].map(p => (
              <div key={p.part} className="rounded-xl p-3 border" style={{ borderColor: `${p.color}33`, backgroundColor: `${p.color}08` }}>
                <div className="font-bold" style={{ color: p.color }}>{p.part}</div>
                <code className="text-[10px] text-gray-600 dark:text-gray-400 block mt-1">{p.content}</code>
                <div className="text-gray-500 mt-1">{p.desc}</div>
              </div>
            ))}
          </div>
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-3 border border-amber-200 dark:border-amber-800 text-xs text-gray-700 dark:text-gray-300">
            <strong>Best practice:</strong> Use short-lived access tokens (15 min) + long-lived refresh tokens (7 days). Access token is stateless (no DB lookup). Refresh token is stored in DB (revocable). On access token expiry, client sends refresh token to get a new access token.
          </div>
        </div>
      </motion.section>

      {/* OAuth Flow */}
      <motion.section {...fadeUp} className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">3</span>
          OAuth 2.0 Authorization Code Flow
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 ml-9">
          This is the most secure and most common OAuth flow — used for "Login with Google" on web apps. The key insight: the user's password NEVER touches your server. Google authenticates the user and gives your app a token.
        </p>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <OAuthFlow />
        </div>
      </motion.section>

      {/* RBAC vs ABAC */}
      <motion.section {...fadeUp} className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">4</span>
          Authorization: RBAC vs ABAC
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 ml-9">
          After verifying WHO the user is (authentication), you need to verify WHAT they can do (authorization). RBAC groups permissions into roles (simple, covers 80% of cases). ABAC evaluates dynamic attributes for fine-grained control.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="font-bold text-blue-600 dark:text-blue-400 mb-2">👥 RBAC (Role-Based)</h3>
            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-2">
              <p>Permissions are assigned to <strong>roles</strong>, and users are assigned to roles. Simple, auditable, and fits most applications.</p>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded p-2 font-mono space-y-0.5">
                <div>admin → [read, write, delete, manage_users]</div>
                <div>editor → [read, write]</div>
                <div>viewer → [read]</div>
              </div>
              <p>✅ Simple to understand, implement, and audit. Widely supported by frameworks.</p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="font-bold text-emerald-600 dark:text-emerald-400 mb-2">🎯 ABAC (Attribute-Based)</h3>
            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-2">
              <p>Decisions based on <strong>attributes</strong> of the user, resource, and context. Much more powerful but complex.</p>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded p-2 font-mono space-y-0.5">
                <div>if user.dept == doc.dept</div>
                <div>  && time.hour in 9..17</div>
                <div>  && user.clearance {'>'} doc.level</div>
                <div>→ ALLOW</div>
              </div>
              <p>✅ Context-aware, dynamic. "Can edit documents only during business hours in their department."</p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Encryption */}
      <motion.section {...fadeUp} className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">5</span>
          Encryption — At Rest & In Transit
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 ml-9">
          Encryption protects data in two states: when it's <strong className="text-gray-800 dark:text-gray-200">stored on disk</strong> (at rest) and when it's <strong className="text-gray-800 dark:text-gray-200">moving over the network</strong> (in transit). In interviews, always mention both — they protect against different threats.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="font-bold text-amber-600 dark:text-amber-400 mb-2">🔒 At Rest (disk)</h3>
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1.5">
              <li>→ <strong className="text-gray-800 dark:text-gray-200">Full-disk encryption:</strong> AES-256 on entire volumes (EBS encryption, LUKS)</li>
              <li>→ <strong className="text-gray-800 dark:text-gray-200">Database TDE:</strong> Transparent Data Encryption — DB encrypts/decrypts automatically</li>
              <li>→ <strong className="text-gray-800 dark:text-gray-200">Application-level:</strong> Encrypt sensitive fields before storing (PII, SSN, credit cards)</li>
              <li>→ <strong className="text-gray-800 dark:text-gray-200">Passwords:</strong> Never store plaintext! bcrypt (cost 12+) or Argon2id with salt</li>
              <li>→ <strong className="text-gray-800 dark:text-gray-200">Key management:</strong> AWS KMS, HashiCorp Vault, Google Cloud KMS</li>
              <li className="text-amber-600 dark:text-amber-400 font-semibold pt-1">Protects against: stolen disks, database dumps, backup theft</li>
            </ul>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="font-bold text-blue-600 dark:text-blue-400 mb-2">🔐 In Transit (network)</h3>
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1.5">
              <li>→ <strong className="text-gray-800 dark:text-gray-200">TLS 1.3</strong> for all external communication (HTTPS). Non-negotiable.</li>
              <li>→ <strong className="text-gray-800 dark:text-gray-200">mTLS</strong> for service-to-service — both sides present certificates (zero-trust)</li>
              <li>→ <strong className="text-gray-800 dark:text-gray-200">Certificate management:</strong> cert-manager (K8s), ACM (AWS), Let's Encrypt</li>
              <li>→ <strong className="text-gray-800 dark:text-gray-200">Database connections:</strong> VPN, PrivateLink, or TLS-encrypted connections</li>
              <li>→ <strong className="text-gray-800 dark:text-gray-200">API keys:</strong> Transmit only over HTTPS, never in URL query params (they get logged)</li>
              <li className="text-blue-600 dark:text-blue-400 font-semibold pt-1">Protects against: man-in-the-middle, packet sniffing, eavesdropping</li>
            </ul>
          </div>
        </div>
      </motion.section>

      {/* Common Attacks */}
      <motion.section {...fadeUp} className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">6</span>
          Common Attack Vectors & Defenses
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 ml-9">
          Knowing the top attack vectors helps you proactively design secure systems. In interviews, mentioning these defenses shows security awareness — a trait interviewers look for at senior levels.
        </p>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {[
              { name: 'SQL Injection', desc: 'Attacker crafts malicious SQL in user input: \' OR 1=1 --', fix: 'Parameterized queries (prepared statements), ORMs, input validation. NEVER concatenate user input into SQL strings.', severity: '🔴 Critical' },
              { name: 'XSS (Cross-Site Scripting)', desc: 'Inject malicious JavaScript into web pages viewed by other users (steal cookies, redirect).', fix: 'Output encoding (escape HTML), Content Security Policy (CSP) headers, sanitize user-generated HTML.', severity: '🔴 Critical' },
              { name: 'CSRF (Cross-Site Request Forgery)', desc: 'Trick an authenticated user into making unwanted requests (e.g., transfer money) via a malicious page.', fix: 'Anti-CSRF tokens in forms, SameSite cookie attribute, check Origin/Referer headers.', severity: '🟡 Medium' },
              { name: 'DDoS (Distributed Denial of Service)', desc: 'Overwhelm your servers with massive traffic to make the service unavailable to legitimate users.', fix: 'Rate limiting, CDN/WAF (Cloudflare), auto-scaling, geographic IP blocking, connection limits.', severity: '🔴 Critical' },
            ].map(a => (
              <div key={a.name} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 space-y-1">
                <div className="font-semibold text-gray-800 dark:text-gray-200">{a.severity} {a.name}</div>
                <p className="text-gray-600 dark:text-gray-400">{a.desc}</p>
                <p className="text-emerald-600 dark:text-emerald-400 font-semibold">Fix: {a.fix}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Interview Tips */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl border border-indigo-200 dark:border-indigo-800 p-6">
        <h3 className="text-base font-bold text-indigo-800 dark:text-indigo-300 mb-3">🎯 Interview Key Points</h3>
        <ul className="space-y-2">
          {[
            'JWT for stateless APIs: short-lived access token (15 min) + long-lived refresh token (7 days). Access token is validated without DB. Refresh token is stored in DB for revocation.',
            'OAuth 2.0 authorization code flow is the standard for web apps. The code-to-token exchange happens server-to-server, so the access token is never exposed to the browser.',
            'Never store passwords in plaintext. Use bcrypt (cost factor 12+) or Argon2id. These algorithms include salt automatically and are intentionally slow to prevent brute-force.',
            'RBAC for 80% of applications. ABAC when you need context-aware policies (time of day, location, document sensitivity level).',
            'In system design interviews, always mention: TLS everywhere, encrypt PII at rest (AES-256), rate limiting on all APIs, input validation, and principle of least privilege.',
            'API security checklist: Rate limiting, authentication (JWT/API key), authorization checks on every endpoint, input validation, audit logging, CORS configuration.',
          ].map((tip, i) => (
            <li key={i} className="flex gap-2 text-sm text-gray-700 dark:text-gray-300">
              <span className="text-indigo-500 flex-shrink-0">→</span><span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
