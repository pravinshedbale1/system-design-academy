export interface GlossaryTerm {
  term: string;
  definition: string;
  category: 'General' | 'Networking' | 'Storage' | 'Databases' | 'Architecture';
}

export const glossaryData: GlossaryTerm[] = [
  {
    term: "Latency",
    category: "General",
    definition: "The time it takes for a single piece of data to travel from its source to its destination and back. Think of it as the delivery time for a single package."
  },
  {
    term: "Throughput",
    category: "General",
    definition: "The amount of data or number of requests a system can handle in a given amount of time (e.g., requests per second). Think of it as the width of a highway—wider means more cars can pass through at once."
  },
  {
    term: "Bandwidth",
    category: "Networking",
    definition: "The maximum capacity of a network pipe to carry data. Even if you have high bandwidth (a very wide pipe), latency (how long the pipe is) can still make things slow."
  },
  {
    term: "Load Balancer",
    category: "Architecture",
    definition: "A system that acts like a traffic cop, sitting in front of your servers and distributing incoming user requests evenly across them so no single server gets overwhelmed."
  },
  {
    term: "Stateless Server",
    category: "Architecture",
    definition: "A server that doesn't remember anything about previous requests. Like a cashier who treats every interaction as a brand new customer, requiring you to show your ID (auth token) every time."
  },
  {
    term: "Stateful Server",
    category: "Architecture",
    definition: "A server that remembers information about a user between requests, like saving a session file locally. If the user hits a different server next time, they might be forced to log in again."
  },
  {
    term: "Vertical Scaling (Scaling Up)",
    category: "Architecture",
    definition: "Adding more power (CPU, RAM, disk space) to an existing single server. Think of it as upgrading from a Toyota to an 18-wheeler to carry more cargo."
  },
  {
    term: "Horizontal Scaling (Scaling Out)",
    category: "Architecture",
    definition: "Adding more servers to your pool of resources to handle load. Think of it as hiring 10 people with Toyota Camrys instead of buying one massive 18-wheeler."
  },
  {
    term: "Caching",
    category: "Storage",
    definition: "Storing a copy of frequently accessed, expensive-to-compute data in high-speed memory (like RAM). It's like keeping your most-used tools on your desk instead of walking to the shed every time."
  },
  {
    term: "CDN (Content Delivery Network)",
    category: "Networking",
    definition: "A network of servers distributed globally that cache static assets (images, CSS, JS). They serve content from the server geographically closest to the user to reduce latency."
  },
  {
    term: "Database Index",
    category: "Databases",
    definition: "A special data structure (usually a B-tree) that allows a database to find rows extremely quickly without scanning the entire table. It works exactly like the index at the back of a book."
  },
  {
    term: "Sharding",
    category: "Databases",
    definition: "Splitting a single massive database into smaller, faster, more easily managed pieces (shards) across multiple servers. For example, storing users A-M on Server 1 and N-Z on Server 2."
  },
  {
    term: "Replica / Replication",
    category: "Databases",
    definition: "Creating exact copies of a database. Usually, an architecture has one 'Primary' database for writing data, and multiple 'Read Replicas' that copy the data and handle read-heavy traffic."
  },
  {
    term: "CAP Theorem",
    category: "Databases",
    definition: "A rule stating that a distributed system can only guarantee two out of three things: Consistency (all nodes see the same data), Availability (system always responds), and Partition Tolerance (system works even if network drops)."
  },
  {
    term: "Consistent Hashing",
    category: "Databases",
    definition: "A clever mathematical way to distribute data across multiple servers so that when you add or remove a server, only a tiny fraction of the data needs to be moved around."
  },
  {
    term: "Microservices",
    category: "Architecture",
    definition: "Breaking down a massive, single application (Monolith) into tiny, independent services that communicate over a network. E.g., separating the 'Payment System' from the 'User Profile System'."
  },
  {
    term: "API Gateway",
    category: "Architecture",
    definition: "The single entry point for all clients into a microservices architecture. It handles routing requests to the correct service, authentication, and rate limiting."
  },
  {
    term: "Rate Limiting",
    category: "Architecture",
    definition: "Putting a cap on how many requests a user or IP address can make in a given timeframe. This prevents abuse, saves money, and stops DDoS attacks from taking down the system."
  },
  {
    term: "Message Queue",
    category: "Architecture",
    definition: "An asynchronous buffer (like Kafka or RabbitMQ) where services can drop messages (tasks) to be processed later by another service. It prevents the system from locking up during heavy load."
  },
  {
    term: "Eventual Consistency",
    category: "Databases",
    definition: "A database model where if you stop sending updates to the system, eventually all replicas will catch up and have the exact same data. You might see slightly stale data for a few milliseconds, but it's much faster."
  },
  {
    term: "Strong Consistency",
    category: "Databases",
    definition: "A database model where a read operation is guaranteed to see the absolute latest written data. It is safer but slower, because the system has to wait for all replicas to agree before responding."
  },
  {
    term: "Single Point of Failure (SPOF)",
    category: "Architecture",
    definition: "A piece of your system that, if it crashes, takes the entire application down with it. Good architecture avoids SPOFs by having backups or replicas for every component."
  },
  {
    term: "DNS (Domain Name System)",
    category: "Networking",
    definition: "The phonebook of the internet. It translates human-readable domain names (like google.com) into machine-readable IP addresses (like 142.250.190.46)."
  },
  {
    term: "TCP (Transmission Control Protocol)",
    category: "Networking",
    definition: "A networking protocol that guarantees data is delivered accurately and in the right order. It's slower because it requires a 'handshake' to establish a connection (used for web pages and texts)."
  },
  {
    term: "UDP (User Datagram Protocol)",
    category: "Networking",
    definition: "A 'fire and forget' networking protocol that sends data as fast as possible without checking if it actually arrived. It is faster but less reliable (used for video streaming and live gaming)."
  },
  {
    term: "Proxy Server",
    category: "Networking",
    definition: "A server that acts as an intermediary. A 'Forward Proxy' hides the client's identity from the internet (like a VPN). A 'Reverse Proxy' hides the backend servers from the internet (like a Load Balancer)."
  },
  {
    term: "Blob Storage / Object Storage",
    category: "Storage",
    definition: "A way to store massive amounts of unstructured data like images, videos, and backups. Instead of a hard drive file system, data is stored as 'objects' in a flat namespace (like AWS S3)."
  },
  {
    term: "SQL (Relational Database)",
    category: "Databases",
    definition: "Databases (like PostgreSQL or MySQL) that store data in strict, predefined tables with rows and columns. Best when data relationships are complex and require strict rules (ACID)."
  },
  {
    term: "NoSQL (Non-Relational Database)",
    category: "Databases",
    definition: "Databases (like MongoDB or Cassandra) that store data flexibly (usually as JSON documents or key-value pairs) without strict tables. Better for unstructured data and massive horizontal scaling."
  },
  {
    term: "Idempotency",
    category: "Architecture",
    definition: "A property of an API where making the exact same request once has the same effect as making it 100 times. E.g., 'Set volume to 5' is idempotent. 'Increase volume by 1' is not."
  },
  {
    term: "ACID",
    category: "Databases",
    definition: "A set of strict rules (Atomicity, Consistency, Isolation, Durability) that guarantee database transactions are processed reliably. Think of it as a bank transfer — either the whole transfer happens, or none of it happens. No half-measures."
  },
  {
    term: "BASE",
    category: "Databases",
    definition: "An alternative to ACID used by NoSQL databases. It prioritizes keeping the system available and fast, even if it means users might temporarily see slightly out-of-date information (Eventual Consistency)."
  },
  {
    term: "Primary Key & Foreign Key",
    category: "Databases",
    definition: "A Primary Key is a unique ID for a specific record (like your Social Security Number). A Foreign Key is a reference in another table that points back to that ID, creating a link between the two tables."
  },
  {
    term: "Data Lake vs Data Warehouse",
    category: "Storage",
    definition: "A Data Lake is a massive pool of raw, unstructured data (like tossing all your receipts in a shoebox). A Data Warehouse is highly structured, processed data ready for business analysis (like an organized Excel spreadsheet of your expenses)."
  },
  {
    term: "WebSocket",
    category: "Networking",
    definition: "A persistent, two-way connection between a user and a server. Instead of the user constantly asking 'Are we there yet?' (polling), the server leaves the phone line open and tells the user instantly when something happens."
  },
  {
    term: "REST API",
    category: "Architecture",
    definition: "A standard set of rules for how computers talk to each other over the internet using standard HTTP methods (GET to fetch data, POST to create it, DELETE to remove it). It operates like a traditional restaurant menu."
  },
  {
    term: "gRPC",
    category: "Networking",
    definition: "A modern, ultra-fast alternative to REST created by Google. Instead of sending bulky JSON text, it sends highly compressed binary data. Perfect for internal servers talking to each other at lightning speed."
  },
  {
    term: "TLS / SSL",
    category: "Networking",
    definition: "Cryptographic protocols that secure the connection between your browser and a server. It scrambles the data so that if a hacker intercepts it in transit, all they see is gibberish."
  },
  {
    term: "Subnetting",
    category: "Networking",
    definition: "Taking a massive network of IP addresses and slicing it into smaller, isolated mini-networks. It improves security by keeping internal databases hidden from public-facing web servers."
  },
  {
    term: "Monolithic Architecture",
    category: "Architecture",
    definition: "Building an application as one massive, single codebase where everything runs together in the same process. It is easy to start with but becomes a nightmare to maintain as the team grows."
  },
  {
    term: "Pub/Sub (Publish-Subscribe)",
    category: "Architecture",
    definition: "A messaging pattern where a 'Publisher' shouts out an event (e.g., 'User Uploaded Video') without knowing who is listening. Any interested 'Subscribers' (e.g., 'Video Compressor', 'Notification Sender') react automatically."
  },
  {
    term: "Consensus Algorithm",
    category: "Databases",
    definition: "A voting process (like Paxos or Raft) used by distributed systems so multiple servers can agree on what the 'truth' is, even if some servers crash or network links fail."
  },
  {
    term: "Leader Election",
    category: "Architecture",
    definition: "When a cluster of servers automatically votes to promote one server as the 'Leader' (Main) to coordinate tasks or handle writes. If the Leader dies, they hold a new election instantly."
  },
  {
    term: "Circuit Breaker Pattern",
    category: "Architecture",
    definition: "Just like the electrical breaker in your house. If a backend service is failing, the circuit breaker 'trips' and stops sending requests to it immediately, preventing the entire system from backing up and crashing."
  },
  {
    term: "Quorum",
    category: "Databases",
    definition: "The minimum number of database nodes that must agree on a read or write operation for it to be considered successful. Usually > 50% (a majority rule) to handle conflicting data."
  },
  {
    term: "Load Testing",
    category: "Architecture",
    definition: "Intentionally throwing a massive amount of fake traffic at your own system to see at what breaking point it crashes, and finding out exactly what component breaks first."
  },
  {
    term: "Service Mesh",
    category: "Architecture",
    definition: "A dedicated infrastructure layer (like a smart network cable) that handles all the complex communication between Microservices automatically—like retrying failed requests, encryption, and routing."
  },
  {
    term: "Autoscaling",
    category: "Architecture",
    definition: "The ability of cloud infrastructure to automatically boot up new servers when traffic spikes (like Black Friday), and shut them down when traffic drops to save money."
  },
  {
    term: "Dead Letter Queue (DLQ)",
    category: "Architecture",
    definition: "A special queue where messages/tasks get dumped if the system fails to process them after several retries. Developers can look at the DLQ later to debug what went wrong."
  },
  {
    term: "OAuth",
    category: "Architecture",
    definition: "An open standard for access delegation. It's the protocol that allows you to click 'Log in with Google' on a random website without giving that website your Google password."
  },
  {
    term: "JWT (JSON Web Token)",
    category: "Architecture",
    definition: "A secure, compact text string used to verify a user's identity. Once you log in, the server gives you a JWT. You show this token with every subsequent request like a VIP wristband to prove who you are."
  },
  {
    term: "Zero Trust Architecture",
    category: "Architecture",
    definition: "A security model where absolutely no user or system is trusted by default, even if they are already inside the private corporate network. Every single request must be strictly verified."
  },
  {
    term: "Gossip Protocol",
    category: "Networking",
    definition: "A decentralized way for nodes in a distributed system to share information. Just like rumors in a high school, one server tells a few random peers, who then tell a few more, until the whole network knows."
  },
  {
    term: "Heartbeat",
    category: "Architecture",
    definition: "A tiny, regular signal sent from one server to another just to say 'I am still alive.' If a load balancer stops receiving heartbeats from a server, it assumes the server died and stops sending it traffic."
  },
  {
    term: "Split Brain",
    category: "Architecture",
    definition: "A catastrophic failure where a network drops, causing a distributed cluster to split into two halves. Both halves think the other half died, so both try to elect a new Leader, causing massive data corruption."
  },
  {
    term: "Bloom Filter",
    category: "Databases",
    definition: "A super-fast, memory-efficient data structure that asks: 'Have I seen this item before?' It can answer 'Definitely Not', or 'Probably Yes', but never 'Definitely Yes'. Used heavily in caches to avoid checking the database for items that don't exist."
  },
  {
    term: "Write-Ahead Log (WAL)",
    category: "Databases",
    definition: "Before a database actually writes a permanent change to its main data files, it first quickly appends the change to an append-only log. This ensures that if the server crashes mid-write, the database can reconstruct what it was doing from the log when it reboots."
  },
  {
    term: "B-Tree vs LSM Tree",
    category: "Databases",
    definition: "B-Trees are the standard data structure for SQL databases, great at random reads and writes. LSM Trees (Log-Structured Merge-Trees) are used by NoSQL databases (like Cassandra) because they are incredibly fast at sequential writes."
  },
  {
    term: "Long Polling",
    category: "Networking",
    definition: "A bridge between standard HTTP and WebSockets. The client asks the server 'Any updates?' The server doesn't reply immediately—it holds the request hostage until it actually has new data, then replies."
  },
  {
    term: "Server-Sent Events (SSE)",
    category: "Networking",
    definition: "A one-way connection where the server streams updates down to the client continuously via standard HTTP (e.g., live stock tickers or Twitter feeds). Unlike WebSockets, the client cannot send data back up the same pipe."
  },
  {
    term: "WebRTC",
    category: "Networking",
    definition: "A protocol that allows two web browsers to connect directly to each other (Peer-to-Peer) for high-performance audio and video streaming, completely bypassing the backend server after the initial connection."
  },
  {
    term: "PACELC Theorem",
    category: "Databases",
    definition: "An extension of the CAP theorem. It states: in case of a Network Partition (P), you must choose Availability (A) or Consistency (C). Else (E), when the network is normal, you must choose Latency (L) or Consistency (C)."
  },
  {
    term: "Two-Phase Commit (2PC)",
    category: "Architecture",
    definition: "A protocol for ensuring a transaction succeeds across multiple totally separate databases. Phase 1: A coordinator asks all databases 'Are you ready to commit?'. Phase 2: If everyone says yes, it says 'Do it!'. If anyone says no, it aborts everything."
  },
  {
    term: "Saga Pattern",
    category: "Architecture",
    definition: "A way to handle multi-step transactions in Microservices without locks. If you book a flight, then try to book a hotel and it fails, the Saga pattern triggers a 'Compensating Action' to automatically cancel the flight."
  },
  {
    term: "Sidecar Pattern",
    category: "Architecture",
    definition: "Deploying a helper program right alongside your main application container. The sidecar handles operational tasks like logging, proxying, and encrypting data, so the main application only has to focus on business logic."
  },
  {
    term: "Backpressure",
    category: "Architecture",
    definition: "When a fast data producer overwhelms a slow consumer, the consumer applies 'backpressure' by signaling the producer to slow down. If it didn't, the consumer's memory buffer would overflow and crash."
  },
  {
    term: "Throttling vs Rate Limiting",
    category: "Architecture",
    definition: "Rate Limiting blocks users who make too many requests. Throttling intentionally slows down the response time for abusive users, making them wait longer instead of just giving them a harsh error."
  },
  {
    term: "Sticky Sessions (Session Affinity)",
    category: "Architecture",
    definition: "A load balancer configuration that ensures all requests from 'User A' always get routed to 'Server 1'. This is bad for modern scaling, but required if 'Server 1' stores the user's login session solely in its local RAM."
  },
  {
    term: "SLI (Service Level Indicator)",
    category: "Architecture",
    definition: "A measurable metric that describes a service's performance. E.g., 'The average latency of the checkout API over the last 5 minutes was 120ms'."
  },
  {
    term: "SLO (Service Level Objective)",
    category: "Architecture",
    definition: "An internal target score set by the engineering team. E.g., 'We want our SLI (checkout latency) to be under 200ms for 99% of requests this month'."
  },
  {
    term: "SLA (Service Level Agreement)",
    category: "Architecture",
    definition: "A legally binding contract with customers. E.g., 'If our system isn't available 99.9% of the time this month, we will refund you 10% of your bill'."
  },
  {
    term: "MapReduce",
    category: "Storage",
    definition: "A classic big data algorithm. 'Map' splits a massive problem into small chunks and gives them to thousands of servers to compute in parallel. 'Reduce' takes all their answers and aggregates them into one final result."
  },
  {
    term: "Merkle Tree",
    category: "Databases",
    definition: "A 'tree of hashes' used by blockchains and distributed databases (like DynamoDB) to very quickly verify if two massive sets of data are exactly identical, or to pinpoint exactly which tiny piece of data changed."
  },
  {
    term: "Vector Clock",
    category: "Databases",
    definition: "A mathematical way for a distributed system to track the order of events without relying on system timestamps (which are notorious for drifting out of sync across different servers)."
  },
  {
    term: "Range vs Hash Partitioning",
    category: "Databases",
    definition: "Range partitioning splits data by logic (Server A gets Users A-M, Server B gets N-Z). Hash partitioning runs the User ID through an equation to determine the server randomly, which prevents alphabetical 'hot spots'."
  },
  {
    term: "Block Storage vs File Storage",
    category: "Storage",
    definition: "File Storage organizes data into files and folders (like Google Drive). Block Storage chops data into equal, raw, unformatted chunks (blocks) and manages them directly via the hard drive for absolute maximum raw performance (like AWS EBS)."
  },
  {
    term: "Blue-Green Deployment",
    category: "Architecture",
    definition: "Running two identical production environments (Blue and Green). Only Blue takes live traffic. You deploy new code to Green, test it fully, and then instantly flip the router to point all users to Green."
  },
  {
    term: "Canary Deployment",
    category: "Architecture",
    definition: "Deploying a new feature to only 1% of your live userbase. If their systems don't crash, you slowly roll it out to 10%, 50%, and then 100%. Like sending a canary into a coal mine to test for poison."
  },
  {
    term: "Chaos Engineering",
    category: "Architecture",
    definition: "Intentionally breaking things in a live production environment (e.g., randomly terminating servers, pulling network cables) to verify that your system is actually as fault-tolerant as you designed it to be (famous example: Netflix Chaos Monkey)."
  },
  {
    term: "Dark Launching",
    category: "Architecture",
    definition: "Deploying new backend features to production without exposing them to users in the UI. Instead, the backend silently runs the new code alongside the old code, comparing the results to verify it works perfectly before turning it on for real."
  }
];
