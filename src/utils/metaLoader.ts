import Papa from 'papaparse';

export type Source = 'train' | 'test';
export type CameraAngle = 'side' | 'top';

export type MetaRow = {
  id: string;
  quarter: string;
  angle: CameraAngle;
  session: number;
  frame: number;
  x: number;
  y: number;
  w: number;
  h: number;
  labelId: number | null;
  source: Source;
  imageId: string;
  imagePath: string;
  cropPath?: string;
};

export type ImageRecord = {
  id: string;
  quarter: string;
  angle: CameraAngle;
  session: number;
  frame: number;
  source: Source;
  imagePath: string;
  boxes: MetaRow[];
};

type TrainRow = {
  quarter: string;
  angle: CameraAngle;
  session: string;
  frame: string;
  x: string;
  y: string;
  w: string;
  h: string;
  label_id?: string;
};

type TestRow = {
  x: string;
  y: string;
  w: string;
  h: string;
  quarter: string;
  session_no: string;
  frame_in_session: string;
  angle: CameraAngle;
  rel_path: string;
};

const pad2 = (value: number | string) => String(value).padStart(2, '0');

const buildTrainImageId = (row: { quarter: string; angle: CameraAngle; session: number; frame: number }) => {
  return `${row.quarter}__${row.angle}__${pad2(row.session)}__${pad2(row.frame)}`;
};

async function loadTrain(): Promise<MetaRow[]> {
  const file = 'train_meta.csv';
  const response = await fetch(`/data/atmaCup22_2nd_meta/${file}`);
  if (!response.ok) {
    throw new Error(`Failed to load ${file}: ${response.status}`);
  }
  const text = await response.text();
  const parsed = Papa.parse<TrainRow>(text, { header: true, skipEmptyLines: true });
  if (parsed.errors.length) {
    console.warn(`Parse errors for ${file}`, parsed.errors.slice(0, 3));
  }

  return parsed.data.map((row, idx) => {
    const session = Number(row.session);
    const frame = Number(row.frame);
    const x = Number(row.x);
    const y = Number(row.y);
    const w = Number(row.w);
    const h = Number(row.h);
    const labelId = row.label_id === undefined || row.label_id === '' ? null : Number(row.label_id);
    const imageId = buildTrainImageId({ quarter: row.quarter, angle: row.angle, session, frame });

    return {
      id: `train-${idx}`,
      quarter: row.quarter,
      angle: row.angle,
      session,
      frame,
      x,
      y,
      w,
      h,
      labelId,
      source: 'train',
      imageId,
      imagePath: `/data/images/${imageId}.jpg`,
      cropPath: `/data/images/${imageId}.jpg`
    };
  });
}

async function loadTest(): Promise<MetaRow[]> {
  const file = 'test_meta.csv';
  const response = await fetch(`/data/atmaCup22_2nd_meta/${file}`);
  if (!response.ok) {
    throw new Error(`Failed to load ${file}: ${response.status}`);
  }
  const text = await response.text();
  const parsed = Papa.parse<TestRow>(text, { header: true, skipEmptyLines: true });
  if (parsed.errors.length) {
    console.warn(`Parse errors for ${file}`, parsed.errors.slice(0, 3));
  }

  return parsed.data.map((row, idx) => {
    const session = Number(row.session_no);
    const frame = Number(row.frame_in_session);
    const x = Number(row.x);
    const y = Number(row.y);
    const w = Number(row.w);
    const h = Number(row.h);
    const relPath = row.rel_path.replace(/^[/\\\\]+/, '');
    const imageId = `${row.quarter}|${row.angle}|${session}|${frame}`;

    return {
      id: `test-${idx}`,
      quarter: row.quarter,
      angle: row.angle,
      session,
      frame,
      x,
      y,
      w,
      h,
      labelId: null,
      source: 'test',
      imageId,
      imagePath: `/data/crops/${relPath}`,
      cropPath: `/data/crops/${relPath}`
    };
  });
}

export async function loadAllMeta() {
  const [train, test] = await Promise.all([loadTrain(), loadTest()]);

  const rows = [...train, ...test];
  const imageMap = new Map<string, ImageRecord>();

  let minFrame = Infinity;
  let maxFrame = -Infinity;
  let minSession = Infinity;
  let maxSession = -Infinity;
  const quarters = new Set<string>();

  rows.forEach((row) => {
    minFrame = Math.min(minFrame, row.frame);
    maxFrame = Math.max(maxFrame, row.frame);
    minSession = Math.min(minSession, row.session);
    maxSession = Math.max(maxSession, row.session);
    quarters.add(row.quarter);

    const key =
      row.source === 'test'
        ? `${row.quarter}|${row.angle}|${row.session}|${row.frame}`
        : row.imageId;

    if (!imageMap.has(key)) {
      imageMap.set(key, {
        id: key,
        quarter: row.quarter,
        angle: row.angle,
        session: row.session,
        frame: row.frame,
        source: row.source,
        imagePath: row.imagePath,
        boxes: []
      });
    }

    imageMap.get(key)!.boxes.push(row);
  });

  return {
    rows,
    images: Array.from(imageMap.values()).sort((a, b) => a.id.localeCompare(b.id)),
    bounds: {
      frame: { min: minFrame, max: maxFrame },
      session: { min: minSession, max: maxSession },
      quarters: Array.from(quarters).sort()
    }
  };
}
