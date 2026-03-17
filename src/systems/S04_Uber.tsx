import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { systems } from '../data/systems';
import { SystemHeader, Section, TheoryBox, InterviewTips, CompareTable, KeyValueGrid } from './SystemLayout';
import type { SystemPageProps } from './SystemPage';

const sys = systems[3]; // Uber

function MatchingAnimation() {
  const [phase, setPhase] = useState<'searching' | 'found' | 'matched'>('searching');
  const drivers = [
    { id: 1, x: 120, y: 80, available: true },
    { id: 2, x: 280, y: 110, available: true },
    { id: 3, x: 180, y: 200, available: false },
    { id: 4, x: 340, y: 60, available: true },
    { id: 5, x: 440, y: 150, available: true },
  ];
  const [selectedDriver, setSelectedDriver] = useState<number | null>(null);
  const riderX = 260, riderY = 220;

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('found'), 2000);
    const t2 = setTimeout(() => { setPhase('matched'); setSelectedDriver(2); }, 3500);
    const t3 = setTimeout(() => { setPhase('searching'); setSelectedDriver(null); }, 6000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [phase]);

  const radius = phase !== 'searching' ? 130 : 0;

  return (
    <div className="space-y-3">
      <svg viewBox="0 0 560 290" className="w-full">
        {/* Map background */}
        <rect width="560" height="290" rx="12" fill="#1e293b" />
        {/* Grid lines */}
        {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
          <line key={`h${i}`} x1="0" y1={i * 40} x2="560" y2={i * 40} stroke="#334155" strokeWidth="0.5" />
        ))}
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map(i => (
          <line key={`v${i}`} x1={i * 40} y1="0" x2={i * 40} y2="290" stroke="#334155" strokeWidth="0.5" />
        ))}

        {/* Search radius */}
        <motion.circle
          cx={riderX} cy={riderY} r={radius}
          fill="none" stroke="#6366f133" strokeWidth="1.5" strokeDasharray="6 3"
          animate={{ r: radius, opacity: phase !== 'searching' ? 1 : 0 }}
          transition={{ duration: 0.8 }}
        />

        {/* Driver pins */}
        {drivers.map((d) => {
          const dist = Math.sqrt((d.x - riderX) ** 2 + (d.y - riderY) ** 2);
          const inRadius = dist < 130;
          const isSelected = selectedDriver === d.id;
          return (
            <g key={d.id}>
              {isSelected && (
                <motion.circle cx={d.x} cy={d.y} r="20" fill="#10b98133"
                  animate={{ r: [20, 30, 20] }} transition={{ duration: 1, repeat: Infinity }} />
              )}
              <motion.circle
                cx={d.x} cy={d.y} r="12"
                fill={isSelected ? '#10b981' : inRadius && phase !== 'searching' ? '#6366f1' : d.available ? '#3b82f6' : '#64748b'}
                animate={{ scale: isSelected ? [1, 1.2, 1] : 1 }}
              />
              <text x={d.x} y={d.y + 4} textAnchor="middle" fontSize="10">🚗</text>
            </g>
          );
        })}

        {/* Rider pin */}
        <motion.circle cx={riderX} cy={riderY} r="14"
          fill="#ef4444"
          animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
        />
        <text x={riderX} y={riderY + 5} textAnchor="middle" fontSize="11">📍</text>

        {/* Route line when matched */}
        {phase === 'matched' && selectedDriver && (
          <motion.line
            x1={drivers[selectedDriver - 1].x} y1={drivers[selectedDriver - 1].y}
            x2={riderX} y2={riderY}
            stroke="#10b981" strokeWidth="2.5" strokeDasharray="6 3"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          />
        )}

        {/* Status overlay */}
        <rect x="170" y="255" width="220" height="26" rx="8" fill="#0f172a" />
        <text x="280" y="273" textAnchor="middle" fontSize="11" fill="white" fontWeight="600">
          {phase === 'searching' ? '🔍 Finding nearby drivers...' :
           phase === 'found' ? '✅ 3 drivers found in range' :
           '🚗 Driver matched! ETA: 4 min'}
        </text>
      </svg>
    </div>
  );
}

export default function S04_Uber({ onProgress, onComplete }: SystemPageProps) {
  useEffect(() => {
    onProgress(74);
    const t = setTimeout(() => onComplete(74), 8000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-14">
      <SystemHeader sys={sys} />

      <Section step={1} title="Scale Estimation">
        <KeyValueGrid items={[
          { label: 'Daily trips', value: '25M' },
          { label: 'Active drivers at peak', value: '5M' },
          { label: 'Location updates/sec', value: '5M (every 4s/driver)', color: 'text-red-500' },
          { label: 'Matching latency target', value: '< 1 second' },
        ]} />
      </Section>

      <Section step={2} title="Real-time Driver Matching"
        note="Find all available drivers within 5km of a rider, rank by ETA, and assign the closest one — in under 1 second.">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <MatchingAnimation />
        </div>
      </Section>

      <Section step={3} title="Geospatial Data Structure: Quadtrees & Geohash">
        <TheoryBox title="Why Regular Databases Fail for Geo Queries" icon="🗺️">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            A naive "SELECT * WHERE distance &lt; 5km" requires scanning millions of driver rows. You need a spatial index.
          </p>
          <CompareTable
            headers={['Approach', 'How It Works', 'Used By']}
            rows={[
              ['Geohash', 'Encode lat/lng into a string prefix. Nearby locations share prefixes. Stored in Redis.', 'Uber, Google Maps'],
              ['Quadtree', 'Recursively subdivide map into 4 quadrants. Query only relevant cells.', 'Yelp, location search'],
              ['H3 hex grid', 'Hexagonal tiling of the earth. Fixed-size cells at multiple zoom levels.', 'Uber (current)'],
              ['PostGIS', 'PostgreSQL extension with native spatial indexes.', 'Smaller scale systems'],
            ]}
          />
        </TheoryBox>
      </Section>

      <Section step={4} title="Location Update Pipeline">
        <TheoryBox title="Handling 5M GPS Updates/Second" icon="📡">
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <li>→ Driver app sends GPS update every 4 seconds via WebSocket → Location Service</li>
            <li>→ Location Service writes to <strong className="text-gray-800 dark:text-gray-200">Redis Geospatial</strong> index (GEOADD): O(log N)</li>
            <li>→ Matching Service queries: GEORADIUS driver_locations {'{lat}'} {'{lng}'} 5km → list of nearby driver IDs</li>
            <li>→ For each driver ID, fetch full status from Redis hash: HGET drivers:{'{id}'} status,rating,car_type</li>
            <li>→ Rank by ETA (estimated from road network, not straight-line distance)</li>
          </ul>
        </TheoryBox>
      </Section>

      <Section step={5} title="Trip State Machine">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between text-xs font-mono">
            {['REQUESTING', 'DRIVER_ASSIGNED', 'DRIVER_EN_ROUTE', 'PICKUP', 'IN_TRIP', 'COMPLETED'].map((state, i, arr) => (
              <div key={state} className="flex items-center">
                <div className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded">{state}</div>
                {i < arr.length - 1 && <span className="text-gray-400 mx-1">→</span>}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">Each state transition stored in Cassandra with timestamp. Enables trip replay, billing reconciliation, and fraud detection.</p>
        </div>
      </Section>

      <InterviewTips tips={[
        'The core data structure is Uber H3 / Geohash in Redis. GEORADIUS returns nearby drivers in O(log N + M) time.',
        'Drivers update location every 4 seconds × 5M drivers = 1.25M writes/second. Use Redis pipelines and batch these.',
        'Surge pricing is a control mechanism: when supply (drivers) < demand (riders) in a geohash cell, multiply price by 1.5–3x to attract more drivers.',
        'Trip state machine is persisted in Cassandra — never in-memory only. If a matching service crashes, the trip state must survive.',
        'Payment is async and post-trip. Uber charges after dropoff — don\'t block the ride experience on payment processing.',
      ]} />
    </div>
  );
}
