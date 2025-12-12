import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
const fmt = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const renderChips = (counts) => Object.entries(counts)
    .filter(([, value]) => value > 0)
    .map(([key, value]) => (_jsxs("span", { className: "chip", children: [key, ": ", fmt.format(value)] }, key)));
export function SummaryCards({ stats }) {
    return (_jsxs("div", { className: "cards", children: [_jsxs("div", { className: "card", children: [_jsx("h4", { children: "Total boxes" }), _jsx("div", { className: "value", children: fmt.format(stats.totalBoxes) }), _jsx("div", { style: { marginTop: 6, display: 'flex', gap: 8, flexWrap: 'wrap' }, children: renderChips(stats.datasetCounts) })] }), _jsxs("div", { className: "card", children: [_jsx("h4", { children: "Images in view" }), _jsx("div", { className: "value", children: fmt.format(stats.totalImages) }), _jsx("div", { style: { marginTop: 6, display: 'flex', gap: 8, flexWrap: 'wrap' }, children: renderChips(stats.angleCounts) })] }), _jsxs("div", { className: "card", children: [_jsx("h4", { children: "Unique labels (filtered)" }), _jsx("div", { className: "value", children: fmt.format(stats.uniqueLabels) }), _jsx("div", { className: "small", children: "train labels only" })] }), _jsxs("div", { className: "card", children: [_jsx("h4", { children: "Avg bbox area" }), _jsxs("div", { className: "value", children: [stats.averageBoxArea ? fmt.format(Math.round(stats.averageBoxArea)) : '0', " px\u00B2"] }), _jsx("div", { className: "small", children: "using current filters" })] })] }));
}
export default SummaryCards;
