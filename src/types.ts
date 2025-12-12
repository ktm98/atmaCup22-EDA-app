import { CameraAngle, ImageRecord, MetaRow, Source } from './utils/metaLoader';

export type Filters = {
  sources: Source[];
  angles: CameraAngle[];
  quarterGroup: 'all' | 'Q1' | 'Q2' | 'Q3' | 'Q4';
  quarterCode: 'all' | string;
  sessionRange: [number, number];
  frameRange: [number, number];
  labelQuery: string;
};

export type DataBundle = {
  rows: MetaRow[];
  images: ImageRecord[];
  bounds: {
    frame: { min: number; max: number };
    session: { min: number; max: number };
    quarters: string[];
  };
};
