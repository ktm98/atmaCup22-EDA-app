import Papa from 'papaparse';
const sourceFile = {
    train: 'train_meta.csv',
    test: 'test_meta.csv',
    test_top: 'test_top_meta.csv'
};
const pad2 = (value) => String(value).padStart(2, '0');
const buildImageId = (row) => {
    return `${row.quarter}__${row.angle}__${pad2(row.session)}__${pad2(row.frame)}`;
};
export async function loadMetaForSource(source) {
    const file = sourceFile[source];
    const response = await fetch(`/data/atmaCup22_metadata/${file}`);
    if (!response.ok) {
        throw new Error(`Failed to load ${file}: ${response.status}`);
    }
    const text = await response.text();
    const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
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
        const imageId = buildImageId({ quarter: row.quarter, angle: row.angle, session, frame });
        return {
            id: `${source}-${idx}`,
            quarter: row.quarter,
            angle: row.angle,
            session,
            frame,
            x,
            y,
            w,
            h,
            labelId,
            source,
            imageId,
            imagePath: `/data/images/${imageId}.jpg`
        };
    });
}
export async function loadAllMeta() {
    const [train, test, testTop] = await Promise.all([
        loadMetaForSource('train'),
        loadMetaForSource('test'),
        loadMetaForSource('test_top')
    ]);
    const rows = [...train, ...test, ...testTop];
    const imageMap = new Map();
    let minFrame = Infinity;
    let maxFrame = -Infinity;
    let minSession = Infinity;
    let maxSession = -Infinity;
    const quarters = new Set();
    rows.forEach((row) => {
        minFrame = Math.min(minFrame, row.frame);
        maxFrame = Math.max(maxFrame, row.frame);
        minSession = Math.min(minSession, row.session);
        maxSession = Math.max(maxSession, row.session);
        quarters.add(row.quarter);
        if (!imageMap.has(row.imageId)) {
            imageMap.set(row.imageId, {
                id: row.imageId,
                quarter: row.quarter,
                angle: row.angle,
                session: row.session,
                frame: row.frame,
                source: row.source,
                imagePath: row.imagePath,
                boxes: []
            });
        }
        imageMap.get(row.imageId).boxes.push(row);
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
