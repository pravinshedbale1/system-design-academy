export interface Chapter {
  id: number;
  title: string;
  description: string;
  emoji: string;
  estimatedTime: string;
}

export const chapters: Chapter[] = [
  {
    id: 1,
    title: 'Introduction to Scalability',
    description: 'Traffic simulators, vertical vs horizontal scaling, and stateless servers.',
    emoji: '📈',
    estimatedTime: '20 min',
  },
  {
    id: 2,
    title: 'The CAP Theorem',
    description: 'Consistency, Availability, Partition Tolerance — pick any two.',
    emoji: '🔺',
    estimatedTime: '15 min',
  },
  {
    id: 3,
    title: 'Latency & Throughput',
    description: 'Every number you need to know, and throughput calculators.',
    emoji: '⚡',
    estimatedTime: '15 min',
  },
  {
    id: 4,
    title: 'Caching Deep Dive',
    description: 'Cache-aside patterns, invalidation strategies, and danger zones.',
    emoji: '🗄️',
    estimatedTime: '25 min',
  },
  {
    id: 5,
    title: 'Load Balancing',
    description: 'Algorithms, L4 vs L7, and animated request routing.',
    emoji: '⚖️',
    estimatedTime: '20 min',
  },
  {
    id: 6,
    title: 'Databases',
    description: 'SQL vs NoSQL, replication, sharding, and decision trees.',
    emoji: '🗃️',
    estimatedTime: '25 min',
  },
  {
    id: 7,
    title: 'Networking Fundamentals',
    description: 'TCP vs UDP, HTTP versions, TLS handshake, WebSockets, and real-time protocols.',
    emoji: '🌐',
    estimatedTime: '25 min',
  },
  {
    id: 8,
    title: 'API Design',
    description: 'REST vs GraphQL vs gRPC, pagination, versioning, and idempotency patterns.',
    emoji: '🔌',
    estimatedTime: '20 min',
  },
  {
    id: 9,
    title: 'DNS Deep Dive',
    description: 'Resolution flow, record types, GeoDNS, and DNS-based load balancing.',
    emoji: '🗺️',
    estimatedTime: '15 min',
  },
  {
    id: 10,
    title: 'Content Delivery Networks',
    description: 'Push vs pull CDN, edge caching, Anycast routing, and cache invalidation.',
    emoji: '🚀',
    estimatedTime: '15 min',
  },
  {
    id: 11,
    title: 'Storage Systems',
    description: 'Block vs file vs object storage, RAID, HDFS, and S3 architecture.',
    emoji: '💾',
    estimatedTime: '20 min',
  },
  {
    id: 12,
    title: 'Replication',
    description: 'Leader-follower, multi-leader, leaderless, quorum, and conflict resolution.',
    emoji: '🔄',
    estimatedTime: '20 min',
  },
  {
    id: 13,
    title: 'Sharding & Partitioning',
    description: 'Consistent hashing, virtual nodes, hot-spot mitigation, and resharding.',
    emoji: '🧩',
    estimatedTime: '25 min',
  },
  {
    id: 14,
    title: 'Consistency Models',
    description: 'Strong vs eventual, linearizability, ACID vs BASE, and real-world tradeoffs.',
    emoji: '🎯',
    estimatedTime: '20 min',
  },
  {
    id: 15,
    title: 'Message Queues',
    description: 'Pub/sub, delivery guarantees, dead letter queues, and backpressure handling.',
    emoji: '📬',
    estimatedTime: '20 min',
  },
  {
    id: 16,
    title: 'Proxies & API Gateway',
    description: 'Forward vs reverse proxy, service mesh, sidecar pattern, and Envoy/Nginx.',
    emoji: '🛡️',
    estimatedTime: '15 min',
  },
  {
    id: 17,
    title: 'Microservices Architecture',
    description: 'Service discovery, circuit breaker, saga pattern, and API composition.',
    emoji: '🏗️',
    estimatedTime: '25 min',
  },
  {
    id: 18,
    title: 'Security & Authentication',
    description: 'OAuth 2.0, JWT, RBAC/ABAC, encryption, and common attack vectors.',
    emoji: '🔐',
    estimatedTime: '20 min',
  },
  {
    id: 19,
    title: 'Monitoring & Observability',
    description: 'Logging, metrics, tracing, SLI/SLO/SLA, and alerting strategies.',
    emoji: '📊',
    estimatedTime: '20 min',
  },
  {
    id: 20,
    title: 'Back-of-Envelope Estimation',
    description: 'Powers of 2, QPS math, storage/bandwidth calculations, and estimation drills.',
    emoji: '🧮',
    estimatedTime: '20 min',
  },
];
