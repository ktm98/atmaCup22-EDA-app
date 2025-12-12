export const matchesLabel = (box, labelQuery) => {
    const term = labelQuery.trim();
    if (!term)
        return true;
    if (term.toLowerCase() === 'unlabeled')
        return box.labelId === null;
    return box.labelId !== null && box.labelId.toString().includes(term);
};
