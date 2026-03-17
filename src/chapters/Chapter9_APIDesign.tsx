import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ChapterProps { onProgress: (id: number) => void; }

/* ── REST vs GraphQL Request Visualizer ── */
function APIComparison() {
  const [api, setApi] = useState<'rest' | 'graphql' | 'grpc'>('rest');

  const examples = {
    rest: {
      request: `GET /users/123
GET /users/123/posts
GET /users/123/followers`,
      response: `// 3 separate HTTP requests needed
// Over-fetching: each returns full objects
// even if client only needs names + titles`,
      color: '#6366f1',
    },
    graphql: {
      request: `POST /graphql
{
  user(id: "123") {
    name
    posts { title }
    followers { name }
  }
}`,
      response: `// Single request, exact fields returned
// No over-fetching or under-fetching
// Client specifies the shape of data`,
      color: '#e535ab',
    },
    grpc: {
      request: `// Protocol Buffers (binary)
message GetUserRequest {
  string user_id = 1;
}
service UserService {
  rpc GetUser(GetUserRequest)
    returns (User);
}`,
      response: `// Binary serialization (10x faster)
// Strong typing via .proto files
// HTTP/2 streaming by default
// Code-gen for client & server`,
      color: '#10b981',
    },
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {(['rest', 'graphql', 'grpc'] as const).map(a => (
          <button key={a} onClick={() => setApi(a)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${api === a ? 'text-white border-transparent' : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400'}`}
            style={api === a ? { backgroundColor: examples[a].color } : {}}>
            {a === 'rest' ? 'REST' : a === 'graphql' ? 'GraphQL' : 'gRPC'}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-900 dark:bg-gray-950 rounded-xl p-4">
          <div className="text-xs font-mono text-gray-400 mb-1">Request</div>
          <pre className="text-xs font-mono text-emerald-400 whitespace-pre-wrap">{examples[api].request}</pre>
        </div>
        <div className="bg-gray-900 dark:bg-gray-950 rounded-xl p-4">
          <div className="text-xs font-mono text-gray-400 mb-1">Why?</div>
          <pre className="text-xs font-mono text-amber-400 whitespace-pre-wrap">{examples[api].response}</pre>
        </div>
      </div>
    </div>
  );
}

export default function Chapter9_APIDesign({ onProgress }: ChapterProps) {
  useEffect(() => { onProgress(9); }, []);
  const fadeUp = { initial: { opacity: 0, y: 16 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-14">
      <motion.div {...fadeUp}>
        <div className="text-xs font-mono text-indigo-500 uppercase tracking-widest mb-1">Chapter 8</div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">🔌 API Design</h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg">REST vs GraphQL vs gRPC, pagination strategies, versioning, rate limiting, and idempotency.</p>
      </motion.div>

      {/* API Comparison */}
      <motion.section {...fadeUp} className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">1</span>
          REST vs GraphQL vs gRPC
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 ml-9">Three dominant API paradigms. Each is optimized for different use cases. Understanding the tradeoffs is essential.</p>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <APIComparison />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100 dark:border-gray-700">
              <th className="text-left py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300 text-xs">Aspect</th>
              <th className="text-left py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300 text-xs">REST</th>
              <th className="text-left py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300 text-xs">GraphQL</th>
              <th className="text-left py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300 text-xs">gRPC</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50 text-xs text-gray-600 dark:text-gray-400">
              <tr><td className="py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300">Format</td><td className="py-2 pr-4">JSON</td><td className="py-2 pr-4">JSON</td><td className="py-2 pr-4">Protobuf (binary)</td></tr>
              <tr><td className="py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300">Transport</td><td className="py-2 pr-4">HTTP/1.1+</td><td className="py-2 pr-4">HTTP</td><td className="py-2 pr-4">HTTP/2</td></tr>
              <tr><td className="py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300">Caching</td><td className="py-2 pr-4 text-emerald-500">Easy (HTTP caching)</td><td className="py-2 pr-4 text-red-500">Complex</td><td className="py-2 pr-4 text-red-500">No native caching</td></tr>
              <tr><td className="py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300">Best for</td><td className="py-2 pr-4">Public APIs, CRUD</td><td className="py-2 pr-4">Mobile, complex UIs</td><td className="py-2 pr-4">Microservices internal</td></tr>
            </tbody>
          </table>
        </div>
      </motion.section>

      {/* Pagination */}
      <motion.section {...fadeUp} className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">2</span>
          Pagination Strategies
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="font-bold text-amber-600 dark:text-amber-400 mb-2">📄 Offset Pagination</h3>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 font-mono text-xs text-gray-600 dark:text-gray-400 mb-2">
              GET /posts?offset=20&limit=10
            </div>
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <li>✅ Simple to implement</li>
              <li>✅ Can jump to any page</li>
              <li className="text-red-500">❌ Slow for large offsets (DB scans N rows)</li>
              <li className="text-red-500">❌ Inconsistent if data changes between pages</li>
            </ul>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="font-bold text-emerald-600 dark:text-emerald-400 mb-2">🔖 Cursor Pagination</h3>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 font-mono text-xs text-gray-600 dark:text-gray-400 mb-2">
              GET /posts?after=eyJ0Ijox&limit=10
            </div>
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <li>✅ Consistent results (uses indexed cursor)</li>
              <li>✅ Performant at any depth (WHERE id {'>'} cursor LIMIT 10)</li>
              <li className="text-amber-500">⚠️ Cannot jump to arbitrary page</li>
              <li className="text-emerald-600 font-semibold">Preferred for feeds, timelines, infinite scroll</li>
            </ul>
          </div>
        </div>
      </motion.section>

      {/* Idempotency */}
      <motion.section {...fadeUp} className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">3</span>
          Idempotency
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 ml-9">An operation is <strong className="text-gray-800 dark:text-gray-200">idempotent</strong> if calling it multiple times produces the same result as calling it once. Critical for payment and mutation APIs.</p>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-100 dark:border-gray-700">
                <th className="text-left py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300 text-xs">Method</th>
                <th className="text-left py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300 text-xs">Idempotent?</th>
                <th className="text-left py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300 text-xs">Safe?</th>
                <th className="text-left py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300 text-xs">Explanation</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50 text-xs text-gray-600 dark:text-gray-400">
                <tr><td className="py-2 pr-4 font-mono font-semibold text-indigo-600">GET</td><td className="py-2 text-emerald-500">✅ Yes</td><td className="py-2 text-emerald-500">✅ Yes</td><td className="py-2">Read-only, no state change</td></tr>
                <tr><td className="py-2 pr-4 font-mono font-semibold text-indigo-600">PUT</td><td className="py-2 text-emerald-500">✅ Yes</td><td className="py-2 text-red-500">❌ No</td><td className="py-2">Replaces entire resource — same result each time</td></tr>
                <tr><td className="py-2 pr-4 font-mono font-semibold text-indigo-600">DELETE</td><td className="py-2 text-emerald-500">✅ Yes</td><td className="py-2 text-red-500">❌ No</td><td className="py-2">Deleting a resource twice = same end state</td></tr>
                <tr><td className="py-2 pr-4 font-mono font-semibold text-red-600">POST</td><td className="py-2 text-red-500">❌ No</td><td className="py-2 text-red-500">❌ No</td><td className="py-2">Creates new resource each call — use idempotency keys!</td></tr>
                <tr><td className="py-2 pr-4 font-mono font-semibold text-amber-600">PATCH</td><td className="py-2 text-amber-500">⚠️ Depends</td><td className="py-2 text-red-500">❌ No</td><td className="py-2">Depends on the patch operation (set vs increment)</td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <strong>💡 Idempotency Key Pattern:</strong> Client sends <code className="text-xs bg-gray-200 dark:bg-gray-700 px-1 rounded">Idempotency-Key: uuid-v4</code> header. Server stores key → result in Redis with 24h TTL. On retry, returns cached result instead of executing again.
          </p>
        </div>
      </motion.section>

      {/* Rate Limiting */}
      <motion.section {...fadeUp} className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">4</span>
          Rate Limiting at the API Level
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">Rate limiting protects your API from abuse and ensures fair usage. Standard response headers communicate limits to clients:</p>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 font-mono text-xs space-y-0.5">
            <div className="text-gray-600 dark:text-gray-400">HTTP/1.1 429 Too Many Requests</div>
            <div className="text-indigo-600 dark:text-indigo-400">X-RateLimit-Limit: 100</div>
            <div className="text-indigo-600 dark:text-indigo-400">X-RateLimit-Remaining: 0</div>
            <div className="text-indigo-600 dark:text-indigo-400">X-RateLimit-Reset: 1672531200</div>
            <div className="text-amber-600 dark:text-amber-400">Retry-After: 30</div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Common algorithms: Token Bucket (Stripe), Sliding Window Log (more accurate), Fixed Window Counter (simpler). For distributed rate limiting, use Redis with MULTI/EXEC or Lua scripts for atomicity.</p>
        </div>
      </motion.section>

      {/* API Versioning */}
      <motion.section {...fadeUp} className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">5</span>
          API Versioning Strategies
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {[
            { name: 'URL Path', ex: '/api/v2/users', pros: 'Clear, cached by CDN', cons: 'Pollutes URL namespace', used: 'Stripe, Twitter' },
            { name: 'Query Param', ex: '/api/users?v=2', pros: 'Keeps URL clean', cons: 'Easy to forget, caching issues', used: 'Google Maps' },
            { name: 'Header', ex: 'Accept: application/vnd.api+json;v=2', pros: 'Clean URLs, content negotiation', cons: 'Invisible, harder to test', used: 'GitHub API' },
          ].map(v => (
            <div key={v.name} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 text-sm space-y-1.5">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm">{v.name}</h3>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded px-2 py-1 font-mono text-xs text-indigo-600 dark:text-indigo-400">{v.ex}</div>
              <div className="text-xs text-emerald-600">✅ {v.pros}</div>
              <div className="text-xs text-red-500">❌ {v.cons}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Used by: {v.used}</div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Interview Tips */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl border border-indigo-200 dark:border-indigo-800 p-6">
        <h3 className="text-base font-bold text-indigo-800 dark:text-indigo-300 mb-3">🎯 Interview Key Points</h3>
        <ul className="space-y-2">
          {[
            'REST for public, cacheable APIs (CRUD). GraphQL for mobile/complex UIs (single request, exact fields). gRPC for internal microservices (binary, streaming, code-gen).',
            'Always use cursor-based pagination for feeds and timelines. Offset-based only for admin dashboards where jumping to page N matters.',
            'POST is not idempotent. For payment/mutation endpoints, always implement idempotency keys (UUID → Redis with 24h TTL).',
            'API Gateway handles: rate limiting, auth, routing, request transformation, logging. It\'s the single entry point for all client traffic.',
            'Version your API from day one. URL path versioning (/v1/) is the most common and easiest to reason about.',
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
