import { Filters } from '../types';
import { CameraAngle, Source } from '../utils/metaLoader';

type Props = {
  filters: Filters;
  bounds: {
    frame: { min: number; max: number };
    session: { min: number; max: number };
    quarters: string[];
  };
  onChange: (patch: Partial<Filters>) => void;
};

const sourceLabel: Record<Source, string> = {
  train: 'train',
  test: 'test',
  test_top: 'test_top'
};

const angleLabel: Record<CameraAngle, string> = {
  side: 'side',
  top: 'top'
};

const quarterOptions: Filters['quarterGroup'][] = ['all', 'Q1', 'Q2', 'Q3', 'Q4'];

const clampRange = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

function RangeInputs({
  label,
  value,
  min,
  max,
  onChange
}: {
  label: string;
  value: [number, number];
  min: number;
  max: number;
  onChange: (next: [number, number]) => void;
}) {
  return (
    <div className="grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
      <div>
        <label>{label} min</label>
        <input
          className="input"
          type="number"
          value={value[0]}
          min={min}
          max={max}
          onChange={(e) => {
            const v = clampRange(Number(e.target.value), min, value[1]);
            onChange([v, value[1]]);
          }}
        />
      </div>
      <div>
        <label>{label} max</label>
        <input
          className="input"
          type="number"
          value={value[1]}
          min={min}
          max={max}
          onChange={(e) => {
            const v = clampRange(Number(e.target.value), value[0], max);
            onChange([value[0], v]);
          }}
        />
      </div>
    </div>
  );
}

export function FilterPanel({ filters, bounds, onChange }: Props) {
  const toggleItem = <T,>(list: T[], value: T) =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

  return (
    <div className="panel">
      <div className="flex-between">
        <div>
          <h3 style={{ margin: 0 }}>Filters</h3>
          <div className="hint">angle / dataset / label / frame range</div>
        </div>
      </div>

      <div className="grid" style={{ marginTop: 14, gap: 12 }}>
        <div>
          <label title="train/test/test_top を複数選択可">Dataset</label>
          <div className="pill-toggle">
            {(Object.keys(sourceLabel) as Source[]).map((source) => {
              const active = filters.sources.includes(source);
              return (
                <button
                  key={source}
                  className={`pill ${active ? 'active' : ''}`}
                  onClick={() => onChange({ sources: toggleItem(filters.sources, source) })}
                  title={active ? `${source} を外す` : `${source} を含める`}
                >
                  {sourceLabel[source]}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label title="side / top を複数選択可">Camera angle</label>
          <div className="pill-toggle">
            {(Object.keys(angleLabel) as CameraAngle[]).map((angle) => {
              const active = filters.angles.includes(angle);
              return (
                <button
                  key={angle}
                  className={`pill ${active ? 'active' : ''}`}
                  onClick={() => onChange({ angles: toggleItem(filters.angles, angle) })}
                  title={active ? `${angle} を外す` : `${angle} を含める`}
                >
                  {angleLabel[angle]}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label title="Q1~Q4 単位での大まかな絞り込み">Quarter group</label>
            <select
              value={filters.quarterGroup}
              onChange={(e) => onChange({ quarterGroup: e.target.value as Filters['quarterGroup'] })}
            >
              {quarterOptions.map((q) => (
                <option key={q} value={q}>
                  {q === 'all' ? 'All' : q}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label title="正確な quarter コードで絞り込み (例: Q1-000)">Quarter code (exact)</label>
            <select
              value={filters.quarterCode}
              onChange={(e) => onChange({ quarterCode: e.target.value as Filters['quarterCode'] })}
            >
              <option value="all">All quarters</option>
              {bounds.quarters.map((q) => (
                <option key={q} value={q}>
                  {q}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label title="部分一致。unlabeled でラベルなしのみ">Label contains</label>
          <input
            className="input"
            placeholder="e.g. 12 or -1 or unlabeled"
            value={filters.labelQuery}
            onChange={(e) => onChange({ labelQuery: e.target.value })}
            title="部分一致でラベル番号を検索。unlabeled でラベルなしのみ。"
          />
        </div>

        <RangeInputs
          label="Session"
          value={filters.sessionRange}
          min={bounds.session.min}
          max={bounds.session.max}
          onChange={(next) => onChange({ sessionRange: next })}
        />
        <RangeInputs
          label="Frame"
          value={filters.frameRange}
          min={bounds.frame.min}
          max={bounds.frame.max}
          onChange={(next) => onChange({ frameRange: next })}
        />
      </div>
    </div>
  );
}

export default FilterPanel;
