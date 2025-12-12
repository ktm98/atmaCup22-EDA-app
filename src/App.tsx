import { useEffect, useMemo, useState } from 'react';
import ChartsPanel from './components/ChartsPanel';
import FilterPanel from './components/FilterPanel';
import ImageList from './components/ImageList';
import ImageViewer from './components/ImageViewer';
import MultiViewPanel from './components/MultiViewPanel';
import SummaryCards, { SummaryStats } from './components/SummaryCards';
import { DataBundle, Filters } from './types';
import { CameraAngle, ImageRecord, MetaRow, Source, loadAllMeta } from './utils/metaLoader';
import { matchesLabel } from './utils/filters';

const defaultFilters: Filters = {
  sources: ['train', 'test', 'test_top'],
  angles: ['side', 'top'],
  quarterGroup: 'all',
  quarterCode: 'all',
  sessionRange: [0, 3],
  frameRange: [1, 50],
  labelQuery: ''
};

function App() {
  const [data, setData] = useState<DataBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playInterval, setPlayInterval] = useState(500);
  const [showBoxes, setShowBoxes] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const result = await loadAllMeta();
        setData(result);
        setFilters((prev) => ({
          ...prev,
          sessionRange: [result.bounds.session.min, result.bounds.session.max],
          frameRange: [result.bounds.frame.min, result.bounds.frame.max]
        }));
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const filteredImages = useMemo(() => {
    if (!data) return [];
    const term = filters.labelQuery.trim();

    return data.images.filter((img) => {
      if (!filters.sources.includes(img.source)) return false;
      if (!filters.angles.includes(img.angle)) return false;
      if (filters.quarterGroup !== 'all' && !img.quarter.startsWith(filters.quarterGroup)) return false;
      if (filters.quarterCode !== 'all' && img.quarter !== filters.quarterCode) return false;
      if (img.session < filters.sessionRange[0] || img.session > filters.sessionRange[1]) return false;
      if (img.frame < filters.frameRange[0] || img.frame > filters.frameRange[1]) return false;
      if (!term) return true;
      return img.boxes.some((box) => matchesLabel(box, term));
    });
  }, [data, filters]);

  useEffect(() => {
    if (!filteredImages.length) {
      setSelectedImageId(null);
      return;
    }
    if (!selectedImageId || !filteredImages.some((img) => img.id === selectedImageId)) {
      setSelectedImageId(filteredImages[0].id);
    }
  }, [filteredImages, selectedImageId]);

  const selectedImage = useMemo(
    () => filteredImages.find((img) => img.id === selectedImageId) ?? null,
    [filteredImages, selectedImageId]
  );

  const visibleBoxes = useMemo(() => {
    if (!selectedImage) return [];
    return selectedImage.boxes.filter((box) => matchesLabel(box, filters.labelQuery));
  }, [selectedImage, filters.labelQuery]);

  const filteredBoxes = useMemo(() => {
    const term = filters.labelQuery.trim();
    return filteredImages.flatMap((img) => img.boxes.filter((box) => matchesLabel(box, term)));
  }, [filteredImages, filters.labelQuery]);

  const summary: SummaryStats = useMemo(() => {
    const datasetCounts: Record<Source, number> = { train: 0, test: 0, test_top: 0 };
    const angleCounts: Record<CameraAngle, number> = { side: 0, top: 0 };
    const labelSet = new Set<number>();

    filteredBoxes.forEach((box) => {
      datasetCounts[box.source] += 1;
      if (box.labelId !== null) {
        labelSet.add(box.labelId);
      }
    });

    filteredImages.forEach((img) => {
      angleCounts[img.angle] += 1;
    });

    const avgArea =
      filteredBoxes.length === 0
        ? 0
        : filteredBoxes.reduce((sum, box) => sum + box.w * box.h, 0) / filteredBoxes.length;

    return {
      totalBoxes: filteredBoxes.length,
      totalImages: filteredImages.length,
      uniqueLabels: labelSet.size,
      averageBoxArea: avgArea,
      datasetCounts,
      angleCounts
    };
  }, [filteredBoxes, filteredImages]);

  const currentIndex = selectedImage
    ? filteredImages.findIndex((img) => img.id === selectedImage.id)
    : -1;

  const getSessionFrames = (img: ImageRecord | null) => {
    if (!img) return [];
    return filteredImages
      .filter(
        (item) =>
          item.quarter === img.quarter && item.session === img.session && item.angle === img.angle
      )
      .sort((a, b) => a.frame - b.frame);
  };

  const sessionFrames = getSessionFrames(selectedImage);
  const sessionIndex = selectedImage
    ? sessionFrames.findIndex((img) => img.id === selectedImage.id)
    : -1;
  const sessionOptions = useMemo(() => {
    if (!selectedImage) return [];
    const set = new Set<number>();
    filteredImages.forEach((img) => {
      if (img.quarter === selectedImage.quarter && img.angle === selectedImage.angle) {
        set.add(img.session);
      }
    });
    return Array.from(set).sort((a, b) => a - b);
  }, [filteredImages, selectedImage]);

  const imagesByTime = useMemo(() => {
    if (!data) return new Map<string, ImageRecord[]>();
    const map = new Map<string, ImageRecord[]>();
    data.images.forEach((img) => {
      const key = `${img.quarter}|${img.session}|${img.frame}`;
      const arr = map.get(key) ?? [];
      arr.push(img);
      map.set(key, arr);
    });
    return map;
  }, [data]);

  const currentGroupImages = useMemo(() => {
    if (!selectedImage) return [];
    const key = `${selectedImage.quarter}|${selectedImage.session}|${selectedImage.frame}`;
    const arr = imagesByTime.get(key) ?? [];
    return arr.slice().sort((a, b) => a.angle.localeCompare(b.angle) || a.source.localeCompare(b.source));
  }, [imagesByTime, selectedImage]);

  const updateFilters = (patch: Partial<Filters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setSelectedImageId(filteredImages[currentIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (currentIndex >= 0 && currentIndex < filteredImages.length - 1) {
      setSelectedImageId(filteredImages[currentIndex + 1].id);
    }
  };

  const handlePrevFrameInSession = () => {
    if (!selectedImage) return;
    if (sessionIndex > 0) {
      setSelectedImageId(sessionFrames[sessionIndex - 1].id);
    }
  };

  const handleNextFrameInSession = () => {
    if (!selectedImage) return;
    if (sessionIndex >= 0 && sessionIndex < sessionFrames.length - 1) {
      setSelectedImageId(sessionFrames[sessionIndex + 1].id);
    }
  };

  const jumpToSession = (session: number) => {
    if (!selectedImage) return;
    const target = filteredImages
      .filter(
        (img) => img.quarter === selectedImage.quarter && img.angle === selectedImage.angle && img.session === session
      )
      .sort((a, b) => a.frame - b.frame)[0];
    if (target) {
      setSelectedImageId(target.id);
    }
  };

  const handlePrevSession = () => {
    if (!selectedImage) return;
    const idx = sessionOptions.indexOf(selectedImage.session);
    if (idx > 0) jumpToSession(sessionOptions[idx - 1]);
  };

  const handleNextSession = () => {
    if (!selectedImage) return;
    const idx = sessionOptions.indexOf(selectedImage.session);
    if (idx >= 0 && idx < sessionOptions.length - 1) jumpToSession(sessionOptions[idx + 1]);
  };

  useEffect(() => {
    if (sessionFrames.length <= 1 && isPlaying) {
      setIsPlaying(false);
    }
  }, [sessionFrames.length, isPlaying]);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      if (sessionIndex >= 0 && sessionIndex < sessionFrames.length - 1) {
        setSelectedImageId(sessionFrames[sessionIndex + 1].id);
      } else {
        setIsPlaying(false);
      }
    }, playInterval);
    return () => clearInterval(timer);
  }, [isPlaying, playInterval, sessionFrames, sessionIndex]);

  if (error) {
    return (
      <div className="app-shell">
        <div className="panel" style={{ color: '#fca5a5' }}>Error: {error}</div>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="app-shell">
        <div className="panel" style={{ minHeight: 200, display: 'grid', placeItems: 'center' }}>
          <div>Loading metadata...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="hero">
        <div>
          <h1>AtmaCup22 bbox EDA</h1>
          <p>Visualize bounding boxes, label coverage, and frame/session slices.</p>
          <div className="hint">
            Data rows: {data.rows.length} • Images: {data.images.length}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <div className="chip">sources: {filters.sources.join(', ')}</div>
          <div className="chip">angles: {filters.angles.join(', ')}</div>
          <div className="chip">Q: {filters.quarterGroup === 'all' ? 'all' : filters.quarterGroup}</div>
          {filters.labelQuery && <div className="chip">label: {filters.labelQuery}</div>}
        </div>
      </div>

      <div className="layout" style={{ marginTop: 16 }}>
        <aside className="sidebar">
          <FilterPanel bounds={data.bounds} filters={filters} onChange={updateFilters} />
        </aside>
        <div className="grid" style={{ gap: 16 }}>
          <ImageViewer
            image={selectedImage}
            visibleBoxes={visibleBoxes}
            currentIndex={currentIndex}
            total={filteredImages.length}
            onPrev={handlePrev}
            onNext={handleNext}
            onPrevFrameInSession={handlePrevFrameInSession}
            onNextFrameInSession={handleNextFrameInSession}
            isPlaying={isPlaying}
            playInterval={playInterval}
            onTogglePlay={() => setIsPlaying((p) => !p)}
            onPlayIntervalChange={(ms) => setPlayInterval(ms)}
            sessionFrames={sessionFrames}
            sessionIndex={sessionIndex}
            onSeekSessionIndex={(idx) => {
              const target = sessionFrames[idx];
              if (target) setSelectedImageId(target.id);
            }}
            sessionOptions={sessionOptions}
            onPrevSession={handlePrevSession}
            onNextSession={handleNextSession}
            onSelectSession={jumpToSession}
            showBoxes={showBoxes}
            onToggleBoxes={() => setShowBoxes((v) => !v)}
          />

          <MultiViewPanel
            groupImages={currentGroupImages}
            activeId={selectedImageId}
            labelQuery={filters.labelQuery}
            onSelect={setSelectedImageId}
          />

          <SummaryCards stats={summary} />
          <ChartsPanel boxes={filteredBoxes} />

          <ImageList images={filteredImages} selectedId={selectedImageId} onSelect={setSelectedImageId} />
        </div>
      </div>
    </div>
  );
}

export default App;
