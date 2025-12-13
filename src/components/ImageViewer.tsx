import { useEffect, useMemo, useRef, useState } from 'react';
import { ImageRecord, MetaRow } from '../utils/metaLoader';

type Props = {
  image: ImageRecord | null;
  visibleBoxes: MetaRow[];
  currentIndex: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  onPrevFrameInSession: () => void;
  onNextFrameInSession: () => void;
  isPlaying: boolean;
  playInterval: number;
  onTogglePlay: () => void;
  onPlayIntervalChange: (ms: number) => void;
  sessionFrames: ImageRecord[];
  sessionIndex: number;
  onSeekSessionIndex: (index: number) => void;
  sessionOptions: number[];
  onPrevSession: () => void;
  onNextSession: () => void;
  onSelectSession: (session: number) => void;
  showBoxes: boolean;
  onToggleBoxes: () => void;
};

type Size = { w: number; h: number } | null;

const colorForLabel = (label: number | null) => {
  if (label === null) return '#eab308';
  const hue = (label * 37) % 360;
  return `hsl(${hue}, 76%, 58%)`;
};

const TEST_CANVAS = { w: 3840, h: 2160 };

export function ImageViewer({
  image,
  visibleBoxes,
  currentIndex,
  total,
  onPrev,
  onNext,
  onPrevFrameInSession,
  onNextFrameInSession,
  isPlaying,
  playInterval,
  onTogglePlay,
  onPlayIntervalChange,
  sessionFrames,
  sessionIndex,
  onSeekSessionIndex,
  sessionOptions,
  onPrevSession,
  onNextSession,
  onSelectSession,
  showBoxes,
  onToggleBoxes
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [naturalSize, setNaturalSize] = useState<Size>(null);
  const [renderSize, setRenderSize] = useState<Size>(null);
  const [hoveredBoxId, setHoveredBoxId] = useState<string | null>(null);

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setRenderSize({
          w: containerRef.current.clientWidth,
          h: containerRef.current.clientHeight
        });
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    // Reset base size when画像が切り替わったとき。testは固定キャンバスサイズ。
    const isTest = image?.source === 'test';
    setNaturalSize(isTest ? TEST_CANVAS : null);
    if (isTest && containerRef.current) {
      setRenderSize({
        w: containerRef.current.clientWidth,
        h: containerRef.current.clientHeight
      });
    } else {
      setRenderSize(null);
    }
    setHoveredBoxId(null);
  }, [image?.id, image?.source]);

  useEffect(() => {
    setHoveredBoxId(null);
  }, [visibleBoxes]);

  const scale = useMemo(() => {
    if (!naturalSize || !renderSize) return { x: 1, y: 1 };
    return {
      x: renderSize.w / naturalSize.w,
      y: renderSize.h / naturalSize.h
    };
  }, [naturalSize, renderSize]);

  const sortedBoxes = useMemo(
    () =>
      [...visibleBoxes].sort((a, b) => {
        const la = a.labelId ?? -Infinity;
        const lb = b.labelId ?? -Infinity;
        if (la === lb) return a.id.localeCompare(b.id);
        return la - lb;
      }),
    [visibleBoxes]
  );

  if (!image) {
    return (
      <div className="panel" style={{ minHeight: 320, display: 'grid', placeItems: 'center' }}>
        <div className="muted">No image matches the current filters.</div>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="flex-between" style={{ marginBottom: 12 }}>
        <div>
          <div className="badge" style={{ marginBottom: 6 }}>
            <span>{image.source}</span>
            <span>•</span>
            <span>{image.angle}</span>
            <span>•</span>
            <span>
              session {image.session} / frame {image.frame}
            </span>
          </div>
          <div className="hint">
            {image.quarter} • {visibleBoxes.length} boxes (original {image.boxes.length})
          </div>
          <div className="hint" style={{ marginTop: 6, fontFamily: 'monospace' }}>
            file: {image.imagePath.split('/').pop()}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button className="pill" onClick={onPrev} disabled={currentIndex <= 0} title="前の一致画像へ">
            ← Prev
          </button>
          <div className="hint">
            {currentIndex + 1} / {total}
          </div>
          <button className="pill" onClick={onNext} disabled={currentIndex >= total - 1} title="次の一致画像へ">
            Next →
          </button>
        </div>
      </div>

      <div className="flex-between" style={{ marginBottom: 12, gap: 8, flexWrap: 'wrap' }}>
        <div className="hint">ビューア: フィルタに一致した1枚を表示。BBoxはラベル色分け。</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="pill"
              onClick={onPrevSession}
              disabled={sessionOptions.length <= 1}
              title="同じ quarter/angle の前セッションへ"
            >
              ← Prev session
            </button>
            <button
              className="pill"
              onClick={onNextSession}
              disabled={sessionOptions.length <= 1}
              title="同じ quarter/angle の次セッションへ"
            >
              Next session →
            </button>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="pill" onClick={onPrevFrameInSession} title="同セッション内の前フレーム">
              ← Session frame
            </button>
            <button className="pill" onClick={onNextFrameInSession} title="同セッション内の次フレーム">
              Session frame →
            </button>
          </div>
          <select
            className="input"
            style={{ width: 140 }}
            value={sessionOptions.includes(image.session) ? image.session : ''}
            onChange={(e) => onSelectSession(Number(e.target.value))}
            title="同じ quarter/angle のセッションを指定"
          >
            {sessionOptions.map((s) => (
              <option key={s} value={s}>
                session {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 260px', alignItems: 'start' }}>
        <div>
          <div
            ref={containerRef}
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '16 / 9',
              background: '#000',
              borderRadius: 12,
              border: '1px solid var(--border)',
              overflow: 'hidden'
            }}
          >
            {image.source === 'train' ? (
              <img
                ref={imgRef}
                src={image.imagePath}
                alt={image.id}
                style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                onLoad={(e) => {
                  setNaturalSize({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight });
                  setRenderSize({
                    w: containerRef.current?.clientWidth ?? e.currentTarget.clientWidth,
                    h: containerRef.current?.clientHeight ?? e.currentTarget.clientHeight
                  });
                }}
              />
            ) : (
              // test: 背景は黒。すべての crop 画像を bbox 座標に貼り付ける
              (renderSize && naturalSize) && (
                <>
                  {visibleBoxes.map((box) => {
                    const left = box.x * scale.x;
                    const top = box.y * scale.y;
                    const width = box.w * scale.x;
                    const height = box.h * scale.y;
                    return (
                      <img
                        key={`${box.id}-img`}
                        src={box.cropPath ?? image.imagePath}
                        alt={image.id}
                        style={{
                          position: 'absolute',
                          left,
                          top,
                          width,
                          height,
                          objectFit: 'fill'
                        }}
                      />
                    );
                  })}
                </>
              )
            )}

            {naturalSize && renderSize && showBoxes && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  pointerEvents: 'none'
                }}
              >
                {visibleBoxes.map((box) => {
                  const left = box.x * scale.x;
                  const top = box.y * scale.y;
                  const width = box.w * scale.x;
                  const height = box.h * scale.y;
                  const isDimmed = hoveredBoxId !== null && box.id !== hoveredBoxId;
                  const isHighlighted = hoveredBoxId !== null && box.id === hoveredBoxId;

                  return (
                    <div
                      key={box.id}
                      style={{
                        position: 'absolute',
                        left,
                        top,
                        width,
                        height,
                        border: `2px solid ${colorForLabel(box.labelId)}`,
                        borderRadius: 8,
                        boxShadow: isHighlighted
                          ? '0 0 0 2px rgba(255,255,255,0.6)'
                          : '0 0 0 1px rgba(0,0,0,0.3)',
                        opacity: isDimmed ? 0.35 : 1
                      }}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          top: -24,
                          left: 0,
                          padding: '4px 8px',
                          borderRadius: 8,
                          background: 'rgba(0,0,0,0.7)',
                          color: 'white',
                          fontSize: 12,
                          fontWeight: 700
                        }}
                      >
                        {box.labelId === null ? 'unlabeled' : `label ${box.labelId}`}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
            <button className="pill" onClick={onTogglePlay} style={{ padding: '10px 12px' }} title="同セッション内を自動再生">
              {isPlaying ? '⏸ Pause' : '▶ Play'}
            </button>
            <div style={{ flex: 1 }}>
              <input
                type="range"
                min={0}
                max={Math.max(sessionFrames.length - 1, 0)}
                value={Math.max(sessionIndex, 0)}
                onChange={(e) => onSeekSessionIndex(Number(e.target.value))}
                style={{ width: '100%' }}
                disabled={sessionFrames.length <= 1}
                title="セッション内フレームをシーク"
              />
              <div className="hint" style={{ marginTop: 4 }}>
                {sessionFrames.length > 0
                  ? `session frames: ${sessionIndex + 1}/${sessionFrames.length} (frame ${image.frame})`
                  : 'session frames: n/a'}
              </div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="hint">interval (ms)</span>
              <input
                className="input"
                style={{ width: 90 }}
                type="number"
                min={100}
                step={100}
                value={playInterval}
                onChange={(e) => onPlayIntervalChange(Math.max(100, Number(e.target.value)))}
              />
            </label>
          </div>
        </div>

        <div style={{ minWidth: 220 }}>
          <div className="badge" style={{ marginBottom: 10 }}>
            {visibleBoxes.length} boxes in this view
            <button className="pill" style={{ marginLeft: 8 }} onClick={onToggleBoxes} title="BBoxとラベルの表示/非表示">
              {showBoxes ? 'Hide boxes' : 'Show boxes'}
            </button>
          </div>
          <table className="table">
            <thead>
              <tr className="muted">
                <th align="left">Label</th>
                <th align="left">Pos</th>
                <th align="left">Size</th>
              </tr>
            </thead>
            <tbody>
              {sortedBoxes.slice(0, 20).map((box) => {
                const isHovered = hoveredBoxId !== null && hoveredBoxId === box.id;
                return (
                  <tr
                    key={box.id}
                    onMouseEnter={() => setHoveredBoxId(box.id)}
                    onMouseLeave={() => setHoveredBoxId(null)}
                    style={{
                      background: isHovered ? 'rgba(14,165,233,0.1)' : 'transparent',
                      cursor: 'pointer'
                    }}
                  >
                    <td>{box.labelId ?? '—'}</td>
                    <td>
                      {box.x}, {box.y}
                    </td>
                    <td>
                      {box.w}×{box.h}
                    </td>
                  </tr>
                );
              })}
              {sortedBoxes.length === 0 && (
                <tr>
                  <td colSpan={3} className="muted">
                    No boxes match the label filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ImageViewer;
