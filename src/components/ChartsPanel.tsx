import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { MetaRow } from '../utils/metaLoader';

type Props = {
  boxes: MetaRow[];
};

const topLabelsData = (boxes: MetaRow[]) => {
  const counts = new Map<number, number>();
  boxes.forEach((box) => {
    if (box.labelId === null) return;
    counts.set(box.labelId, (counts.get(box.labelId) || 0) + 1);
  });

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([label, value]) => ({ label: label.toString(), value }));
};

const quarterAngleData = (boxes: MetaRow[]) => {
  const map = new Map<string, { quarter: string; side: number; top: number }>();
  boxes.forEach((box) => {
    const quarter = box.quarter.split('-')[0];
    if (!map.has(quarter)) {
      map.set(quarter, { quarter, side: 0, top: 0 });
    }
    const entry = map.get(quarter)!;
    entry[box.angle] += 1;
  });

  return Array.from(map.values()).sort((a, b) => a.quarter.localeCompare(b.quarter));
};

const chartBg = 'rgba(255,255,255,0.03)';

export function ChartsPanel({ boxes }: Props) {
  const labelsData = topLabelsData(boxes);
  const qaData = quarterAngleData(boxes);

  return (
    <div className="panel">
      <div className="grid" style={{ gridTemplateColumns: '1.2fr 1fr', gap: 16 }}>
        <div style={{ height: 280, background: chartBg, borderRadius: 12, padding: 10 }}>
          <div className="flex-between" style={{ marginBottom: 8 }}>
            <div>
              <div className="hint">Top labels by bbox count</div>
              <strong>Label distribution</strong>
            </div>
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={labelsData} margin={{ top: 12, right: 12, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="label" tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1f2937' }} />
              <Bar dataKey="value" fill="#0ea5e9" radius={6} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ height: 280, background: chartBg, borderRadius: 12, padding: 10 }}>
          <div className="flex-between" style={{ marginBottom: 8 }}>
            <div>
              <div className="hint">Quarter x angle</div>
              <strong>Coverage overview</strong>
            </div>
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={qaData} margin={{ top: 12, right: 12, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="quarter" tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1f2937' }} />
              <Legend />
              <Bar dataKey="side" stackId="a" fill="#f97316" radius={[6, 6, 0, 0]} />
              <Bar dataKey="top" stackId="a" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default ChartsPanel;
