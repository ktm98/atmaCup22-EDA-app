import { ImageRecord } from '../utils/metaLoader';

type Props = {
  images: ImageRecord[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function ImageList({ images, selectedId, onSelect }: Props) {
  const display = images.slice(0, 25);

  return (
    <div className="panel">
      <div className="flex-between" style={{ marginBottom: 10 }}>
        <div>
          <strong>Image navigator</strong>
          <div className="hint">Showing first {display.length} of {images.length} matches</div>
        </div>
      </div>
      <div className="scroll-area">
        <table className="table">
          <thead>
            <tr className="muted">
              <th align="left">ID</th>
              <th align="left">Dataset</th>
              <th align="left">Angle</th>
              <th align="left">Session</th>
              <th align="left">Frame</th>
              <th align="left">Boxes</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {display.map((img) => (
              <tr key={img.id} style={{ background: img.id === selectedId ? 'rgba(14,165,233,0.08)' : 'transparent' }}>
                <td style={{ fontFamily: 'monospace' }}>{img.quarter}</td>
                <td>{img.source}</td>
                <td>{img.angle}</td>
                <td>{img.session}</td>
                <td>{img.frame}</td>
                <td>{img.boxes.length}</td>
                <td>
                  <button className="pill" onClick={() => onSelect(img.id)}>
                    View
                  </button>
                </td>
              </tr>
            ))}
            {display.length === 0 && (
              <tr>
                <td colSpan={7} className="muted">
                  No images with the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ImageList;
