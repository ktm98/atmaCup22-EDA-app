import { CameraAngle, Source } from '../utils/metaLoader';

export type SummaryStats = {
  totalBoxes: number;
  totalImages: number;
  uniqueLabels: number;
  averageBoxArea: number;
  angleCounts: Record<CameraAngle, number>;
  datasetCounts: Record<Source, number>;
};

const fmt = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

const renderChips = (counts: Record<string, number>) =>
  Object.entries(counts)
    .filter(([, value]) => value > 0)
    .map(([key, value]) => (
      <span key={key} className="chip">
        {key}: {fmt.format(value)}
      </span>
    ));

export function SummaryCards({ stats }: { stats: SummaryStats }) {
  return (
    <div className="cards">
      <div className="card">
        <h4>Total boxes</h4>
        <div className="value">{fmt.format(stats.totalBoxes)}</div>
        <div style={{ marginTop: 6, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {renderChips(stats.datasetCounts)}
        </div>
      </div>
      <div className="card">
        <h4>Images in view</h4>
        <div className="value">{fmt.format(stats.totalImages)}</div>
        <div style={{ marginTop: 6, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {renderChips(stats.angleCounts)}
        </div>
      </div>
      <div className="card">
        <h4>Unique labels (filtered)</h4>
        <div className="value">{fmt.format(stats.uniqueLabels)}</div>
        <div className="small">train labels only</div>
      </div>
      <div className="card">
        <h4>Avg bbox area</h4>
        <div className="value">
          {stats.averageBoxArea ? fmt.format(Math.round(stats.averageBoxArea)) : '0'} px²
        </div>
        <div className="small">using current filters</div>
      </div>
    </div>
  );
}

export default SummaryCards;
