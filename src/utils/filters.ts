import { MetaRow } from './metaLoader';

export const matchesLabel = (box: MetaRow, labelQuery: string) => {
  const term = labelQuery.trim();
  if (!term) return true;
  if (term.toLowerCase() === 'unlabeled') return box.labelId === null;
  return box.labelId !== null && box.labelId.toString().includes(term);
};
