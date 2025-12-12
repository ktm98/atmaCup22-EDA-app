import { useMemo } from 'react';
import { ImageRecord } from '../utils/metaLoader';
import { matchesLabel } from '../utils/filters';

type Props = {
  groupImages: ImageRecord[];
  activeId: string | null;
  labelQuery: string;
  onSelect: (id: string) => void;
};

export default function MultiViewPanel({ groupImages, activeId, labelQuery, onSelect }: Props) {
  const title =
    groupImages.length > 0
      ? `${groupImages[0].quarter} • session ${groupImages[0].session} • frame ${groupImages[0].frame}`
      : 'No matching time slice';

  const items = useMemo(
    () =>
      groupImages.map((img) => ({
        ...img,
        visibleBoxes: img.boxes.filter((b) => matchesLabel(b, labelQuery))
      })),
    [groupImages, labelQuery]
  );

  return (
    <div className="panel">
      <div className="flex-between" style={{ marginBottom: 10 }}>
        <div>
          <strong>同期ビュー</strong>
          <div className="hint">{title} の全アングル/データセットを並べて表示</div>
        </div>
        <div className="badge">views: {items.length}</div>
      </div>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 12 }}>
        {items.map((img) => (
          <div
            key={img.id}
            className="card"
            style={{
              borderColor: img.id === activeId ? 'rgba(14,165,233,0.6)' : undefined,
              cursor: 'pointer'
            }}
            onClick={() => onSelect(img.id)}
          >
            <div className="flex-between" style={{ marginBottom: 8 }}>
              <div className="badge">
                {img.source} • {img.angle}
              </div>
              <div className="hint">{img.boxes.length} boxes</div>
            </div>
            <div style={{ position: 'relative' }}>
              <img
                src={img.imagePath}
                alt={img.id}
                style={{ width: '100%', borderRadius: 10, border: '1px solid var(--border)' }}
              />
              {img.visibleBoxes.slice(0, 3).map((box) => {
                const hue = ((box.labelId ?? -1) * 37) % 360;
                return (
                  <span
                    key={box.id}
                    style={{
                      position: 'absolute',
                      bottom: 6,
                      left: 6,
                      padding: '4px 6px',
                      borderRadius: 8,
                      background: 'rgba(0,0,0,0.6)',
                      color: `hsl(${hue},76%,70%)`,
                      fontSize: 11,
                      marginRight: 4
                    }}
                  >
                    {box.labelId ?? '—'}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="muted">同期するビューがありません。</div>}
      </div>
    </div>
  );
}
