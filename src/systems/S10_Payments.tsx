import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { systems } from '../data/systems';
import { SystemHeader, Section, TheoryBox, InterviewTips, CompareTable, KeyValueGrid } from './SystemLayout';
import type { SystemPageProps } from './SystemPage';

const sys = systems[9]; // Payment

function PaymentFlowAnimation() {
  const [step, setStep] = useState(0);
  const steps = [
    { label: 'User initiates payment', node: 'Client', icon: '👤', color: '#6366f1' },
    { label: 'Payment Service validates', node: 'Payment API', icon: '⚙️', color: '#8b5cf6' },
    { label: 'Idempotency check in Redis', node: 'Redis', icon: '🔴', color: '#ef4444' },
    { label: 'Debit sender account (DB transaction)', node: 'Ledger DB', icon: '🗄️', color: '#f59e0b' },
    { label: 'Call external payment gateway', node: 'Stripe/PSP', icon: '💳', color: '#0ea5e9' },
    { label: 'Credit receiver account', node: 'Ledger DB', icon: '🗄️', color: '#10b981' },
    { label: 'Notify both parties', node: 'Notification', icon: '🔔', color: '#6366f1' },
    { label: 'Return success to client', node: 'Client', icon: '✅', color: '#10b981' },
  ];

  useEffect(() => {
    const t = setInterval(() => setStep(s => (s + 1) % steps.length), 1600);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex gap-1">
        {steps.map((s, i) => (
          <motion.div
            key={i}
            className="flex-1 h-2 rounded-full"
            animate={{ backgroundColor: i <= step ? s.color : '#e5e7eb' }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{steps[step].icon}</span>
            <div>
              <div className="text-xs font-mono text-indigo-600 dark:text-indigo-400">{steps[step].node}</div>
              <div className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{steps[step].label}</div>
            </div>
          </div>
          <div className="mt-2 flex gap-1">
            {steps.map((_, i) => (
              <div key={i} className="text-xs font-mono" style={{ color: i === step ? steps[step].color : '#d1d5db' }}>
                {i === step ? '●' : '○'}
              </div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function IdempotencyDemo() {
  const [keys, setKeys] = useState<{key: string; status: string; seen: number}[]>([]);

  function sendPayment(idempotent: boolean) {
    const key = idempotent ? 'idem_abc123' : `req_${Date.now()}`;
    setKeys(prev => {
      const existing = prev.find(k => k.key === key);
      if (existing) {
        return prev.map(k => k.key === key ? { ...k, seen: k.seen + 1 } : k);
      }
      return [...prev, { key, status: 'charged $100', seen: 1 }];
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <button onClick={() => sendPayment(false)}
          className="flex-1 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-xl font-semibold text-sm transition-colors">
          💥 Without Idempotency
        </button>
        <button onClick={() => sendPayment(true)}
          className="flex-1 py-2 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-xl font-semibold text-sm transition-colors">
          ✅ With Idempotency Key
        </button>
      </div>
      {keys.length > 0 && (
        <div className="space-y-1.5">
          {keys.map(k => (
            <div key={k.key} className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs ${k.seen > 1 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-gray-50 dark:bg-gray-700/50'}`}>
              <span className="font-mono text-gray-600 dark:text-gray-400 truncate">{k.key}</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">{k.status}</span>
              <span className={`ml-2 ${k.seen > 1 ? 'text-red-600 font-bold' : 'text-gray-400'}`}>×{k.seen} {k.seen > 1 ? '⚠️ DUPLICATE CHARGE!' : ''}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function S10_Payments({ onProgress, onComplete }: SystemPageProps) {
  useEffect(() => {
    onProgress(80);  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-14">
      <SystemHeader sys={sys} />

      <Section step={1} title="Scale & Requirements"
        note="Payments are NOT eventually consistent. They require ACID transactions, exactly-once semantics, and audit trails.">
        <KeyValueGrid items={[
          { label: 'Stripe transactions/day', value: '400M' },
          { label: 'Peak QPS', value: '~20,000 TPS' },
          { label: 'Latency target (P99)', value: '< 500ms (user-facing)', color: 'text-amber-600' },
          { label: 'Consistency model', value: 'STRONG — always' },
        ]} />
      </Section>

      <Section step={2} title="Payment Flow Step-by-Step"
        note="A payment involves multiple distributed operations that must all succeed or all fail (distributed transaction).">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <PaymentFlowAnimation />
        </div>
      </Section>

      <Section step={3} title="Interactive: Idempotency Demo"
        note="Networks fail. Clients retry. Without idempotency keys, a retry charges the user twice.">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <IdempotencyDemo />
        </div>
      </Section>

      <Section step={4} title="Double-Booking Prevention: The Ledger Pattern">
        <TheoryBox title="Immutable Double-Entry Ledger" icon="📒">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Never UPDATE balances. Append ledger entries and compute balance as SUM of credits - SUM of debits. This is how all real financial systems work.
          </p>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 font-mono text-xs space-y-1">
            <div className="text-indigo-600 dark:text-indigo-400">-- WRONG (mutable)</div>
            <div className="text-gray-600 dark:text-gray-400">UPDATE accounts SET balance = balance - 100 WHERE id = :user</div>
            <div className="text-indigo-600 dark:text-indigo-400 mt-2">-- CORRECT (append-only ledger)</div>
            <div className="text-gray-600 dark:text-gray-400">INSERT INTO ledger (account_id, amount, type, tx_id)</div>
            <div className="text-gray-600 dark:text-gray-400">  VALUES (:sender, -100, 'DEBIT', :tx_id), (:receiver, 100, 'CREDIT', :tx_id);</div>
            <div className="text-emerald-600 dark:text-emerald-400 mt-2">-- Balance query</div>
            <div className="text-gray-600 dark:text-gray-400">SELECT SUM(amount) FROM ledger WHERE account_id = :id;</div>
          </div>
        </TheoryBox>
      </Section>

      <Section step={5} title="Distributed Transaction: Saga Pattern">
        <TheoryBox title="Why 2PC Fails at Scale — Use Saga Instead" icon="🔄">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Two-phase commit (2PC) requires all services to hold locks until the coordinator approves. At scale this causes massive contention. The Saga pattern uses a sequence of local transactions with compensating actions on failure.
          </p>
          <CompareTable
            headers={['Step', 'Action', 'Compensating Action']}
            rows={[
              ['1. Payment created', 'Reserve $100 from sender', 'Release reservation'],
              ['2. PSP charged', 'Charge external gateway', 'Issue refund via PSP'],
              ['3. Sender debited', 'DEBIT sender ledger', 'CREDIT sender (reverse)'],
              ['4. Receiver credited', 'CREDIT receiver ledger', 'DEBIT receiver (reverse)'],
            ]}
          />
        </TheoryBox>
      </Section>

      <InterviewTips tips={[
        'Every payment must use idempotency keys. The client generates a UUID per payment attempt. Server deduplicates in Redis with 24h TTL.',
        'Use PostgreSQL (not NoSQL) for the ledger — you need ACID transactions with foreign key constraints. Shard by account_id only when you reach 100M+ accounts.',
        'The Saga pattern over 2PC: each step is a local ACID transaction. Failures trigger compensating transactions (refunds). This is how Stripe and Uber handle payments.',
        'The PSP (Payment Service Provider like Stripe) handles card networks. You never store raw card numbers — store their tokenized reference.',
        'Audit log is mandatory: every state change (PENDING → PROCESSING → COMPLETED) must be recorded with timestamps for regulatory compliance.',
      ]} />
    </div>
  );
}
