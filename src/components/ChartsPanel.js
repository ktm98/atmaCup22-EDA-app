import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
const topLabelsData = (boxes) => {
    const counts = new Map();
    boxes.forEach((box) => {
        if (box.labelId === null)
            return;
        counts.set(box.labelId, (counts.get(box.labelId) || 0) + 1);
    });
    return Array.from(counts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 12)
        .map(([label, value]) => ({ label: label.toString(), value }));
};
const quarterAngleData = (boxes) => {
    const map = new Map();
    boxes.forEach((box) => {
        const quarter = box.quarter.split('-')[0];
        if (!map.has(quarter)) {
            map.set(quarter, { quarter, side: 0, top: 0 });
        }
        const entry = map.get(quarter);
        entry[box.angle] += 1;
    });
    return Array.from(map.values()).sort((a, b) => a.quarter.localeCompare(b.quarter));
};
const chartBg = 'rgba(255,255,255,0.03)';
export function ChartsPanel({ boxes }) {
    const labelsData = topLabelsData(boxes);
    const qaData = quarterAngleData(boxes);
    return (_jsx("div", { className: "panel", children: _jsxs("div", { className: "grid", style: { gridTemplateColumns: '1.2fr 1fr', gap: 16 }, children: [_jsxs("div", { style: { height: 280, background: chartBg, borderRadius: 12, padding: 10 }, children: [_jsx("div", { className: "flex-between", style: { marginBottom: 8 }, children: _jsxs("div", { children: [_jsx("div", { className: "hint", children: "Top labels by bbox count" }), _jsx("strong", { children: "Label distribution" })] }) }), _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(BarChart, { data: labelsData, margin: { top: 12, right: 12, left: -10, bottom: 0 }, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "rgba(255,255,255,0.08)" }), _jsx(XAxis, { dataKey: "label", tick: { fill: '#9ca3af', fontSize: 12 } }), _jsx(YAxis, { tick: { fill: '#9ca3af', fontSize: 12 } }), _jsx(Tooltip, { contentStyle: { background: '#111827', border: '1px solid #1f2937' } }), _jsx(Bar, { dataKey: "value", fill: "#0ea5e9", radius: 6 })] }) })] }), _jsxs("div", { style: { height: 280, background: chartBg, borderRadius: 12, padding: 10 }, children: [_jsx("div", { className: "flex-between", style: { marginBottom: 8 }, children: _jsxs("div", { children: [_jsx("div", { className: "hint", children: "Quarter x angle" }), _jsx("strong", { children: "Coverage overview" })] }) }), _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(BarChart, { data: qaData, margin: { top: 12, right: 12, left: -10, bottom: 0 }, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "rgba(255,255,255,0.08)" }), _jsx(XAxis, { dataKey: "quarter", tick: { fill: '#9ca3af', fontSize: 12 } }), _jsx(YAxis, { tick: { fill: '#9ca3af', fontSize: 12 } }), _jsx(Tooltip, { contentStyle: { background: '#111827', border: '1px solid #1f2937' } }), _jsx(Legend, {}), _jsx(Bar, { dataKey: "side", stackId: "a", fill: "#f97316", radius: [6, 6, 0, 0] }), _jsx(Bar, { dataKey: "top", stackId: "a", fill: "#10b981", radius: [6, 6, 0, 0] })] }) })] })] }) }));
}
export default ChartsPanel;
