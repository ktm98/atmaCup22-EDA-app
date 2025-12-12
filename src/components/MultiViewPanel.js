import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from 'react';
import { matchesLabel } from '../utils/filters';
export default function MultiViewPanel({ groupImages, activeId, labelQuery, onSelect }) {
    const title = groupImages.length > 0
        ? `${groupImages[0].quarter} • session ${groupImages[0].session} • frame ${groupImages[0].frame}`
        : 'No matching time slice';
    const items = useMemo(() => groupImages.map((img) => ({
        ...img,
        visibleBoxes: img.boxes.filter((b) => matchesLabel(b, labelQuery))
    })), [groupImages, labelQuery]);
    return (_jsxs("div", { className: "panel", children: [_jsxs("div", { className: "flex-between", style: { marginBottom: 10 }, children: [_jsxs("div", { children: [_jsx("strong", { children: "\u540C\u671F\u30D3\u30E5\u30FC" }), _jsxs("div", { className: "hint", children: [title, " \u306E\u5168\u30A2\u30F3\u30B0\u30EB/\u30C7\u30FC\u30BF\u30BB\u30C3\u30C8\u3092\u4E26\u3079\u3066\u8868\u793A"] })] }), _jsxs("div", { className: "badge", children: ["views: ", items.length] })] }), _jsxs("div", { className: "grid", style: { gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 12 }, children: [items.map((img) => (_jsxs("div", { className: "card", style: {
                            borderColor: img.id === activeId ? 'rgba(14,165,233,0.6)' : undefined,
                            cursor: 'pointer'
                        }, onClick: () => onSelect(img.id), children: [_jsxs("div", { className: "flex-between", style: { marginBottom: 8 }, children: [_jsxs("div", { className: "badge", children: [img.source, " \u2022 ", img.angle] }), _jsxs("div", { className: "hint", children: [img.boxes.length, " boxes"] })] }), _jsxs("div", { style: { position: 'relative' }, children: [_jsx("img", { src: img.imagePath, alt: img.id, style: { width: '100%', borderRadius: 10, border: '1px solid var(--border)' } }), img.visibleBoxes.slice(0, 3).map((box) => {
                                        const hue = ((box.labelId ?? -1) * 37) % 360;
                                        return (_jsx("span", { style: {
                                                position: 'absolute',
                                                bottom: 6,
                                                left: 6,
                                                padding: '4px 6px',
                                                borderRadius: 8,
                                                background: 'rgba(0,0,0,0.6)',
                                                color: `hsl(${hue},76%,70%)`,
                                                fontSize: 11,
                                                marginRight: 4
                                            }, children: box.labelId ?? '—' }, box.id));
                                    })] })] }, img.id))), items.length === 0 && _jsx("div", { className: "muted", children: "\u540C\u671F\u3059\u308B\u30D3\u30E5\u30FC\u304C\u3042\u308A\u307E\u305B\u3093\u3002" })] })] }));
}
