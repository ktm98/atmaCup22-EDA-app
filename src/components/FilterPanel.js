import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
const sourceLabel = {
    train: 'train',
    test: 'test',
    test_top: 'test_top'
};
const angleLabel = {
    side: 'side',
    top: 'top'
};
const quarterOptions = ['all', 'Q1', 'Q2', 'Q3', 'Q4'];
const clampRange = (value, min, max) => Math.min(Math.max(value, min), max);
function RangeInputs({ label, value, min, max, onChange }) {
    return (_jsxs("div", { className: "grid", style: { gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }, children: [_jsxs("div", { children: [_jsxs("label", { children: [label, " min"] }), _jsx("input", { className: "input", type: "number", value: value[0], min: min, max: max, onChange: (e) => {
                            const v = clampRange(Number(e.target.value), min, value[1]);
                            onChange([v, value[1]]);
                        } })] }), _jsxs("div", { children: [_jsxs("label", { children: [label, " max"] }), _jsx("input", { className: "input", type: "number", value: value[1], min: min, max: max, onChange: (e) => {
                            const v = clampRange(Number(e.target.value), value[0], max);
                            onChange([value[0], v]);
                        } })] })] }));
}
export function FilterPanel({ filters, bounds, onChange }) {
    const toggleItem = (list, value) => list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
    return (_jsxs("div", { className: "panel", children: [_jsx("div", { className: "flex-between", children: _jsxs("div", { children: [_jsx("h3", { style: { margin: 0 }, children: "Filters" }), _jsx("div", { className: "hint", children: "angle / dataset / label / frame range" })] }) }), _jsxs("div", { className: "grid", style: { marginTop: 14, gap: 12 }, children: [_jsxs("div", { children: [_jsx("label", { title: "train/test/test_top \u3092\u8907\u6570\u9078\u629E\u53EF", children: "Dataset" }), _jsx("div", { className: "pill-toggle", children: Object.keys(sourceLabel).map((source) => {
                                    const active = filters.sources.includes(source);
                                    return (_jsx("button", { className: `pill ${active ? 'active' : ''}`, onClick: () => onChange({ sources: toggleItem(filters.sources, source) }), title: active ? `${source} を外す` : `${source} を含める`, children: sourceLabel[source] }, source));
                                }) })] }), _jsxs("div", { children: [_jsx("label", { title: "side / top \u3092\u8907\u6570\u9078\u629E\u53EF", children: "Camera angle" }), _jsx("div", { className: "pill-toggle", children: Object.keys(angleLabel).map((angle) => {
                                    const active = filters.angles.includes(angle);
                                    return (_jsx("button", { className: `pill ${active ? 'active' : ''}`, onClick: () => onChange({ angles: toggleItem(filters.angles, angle) }), title: active ? `${angle} を外す` : `${angle} を含める`, children: angleLabel[angle] }, angle));
                                }) })] }), _jsxs("div", { className: "grid", style: { gridTemplateColumns: '1fr 1fr', gap: 12 }, children: [_jsxs("div", { children: [_jsx("label", { title: "Q1~Q4 \u5358\u4F4D\u3067\u306E\u5927\u307E\u304B\u306A\u7D5E\u308A\u8FBC\u307F", children: "Quarter group" }), _jsx("select", { value: filters.quarterGroup, onChange: (e) => onChange({ quarterGroup: e.target.value }), children: quarterOptions.map((q) => (_jsx("option", { value: q, children: q === 'all' ? 'All' : q }, q))) })] }), _jsxs("div", { children: [_jsx("label", { title: "\u6B63\u78BA\u306A quarter \u30B3\u30FC\u30C9\u3067\u7D5E\u308A\u8FBC\u307F (\u4F8B: Q1-000)", children: "Quarter code (exact)" }), _jsxs("select", { value: filters.quarterCode, onChange: (e) => onChange({ quarterCode: e.target.value }), children: [_jsx("option", { value: "all", children: "All quarters" }), bounds.quarters.map((q) => (_jsx("option", { value: q, children: q }, q)))] })] })] }), _jsxs("div", { children: [_jsx("label", { title: "\u90E8\u5206\u4E00\u81F4\u3002unlabeled \u3067\u30E9\u30D9\u30EB\u306A\u3057\u306E\u307F", children: "Label contains" }), _jsx("input", { className: "input", placeholder: "e.g. 12 or -1 or unlabeled", value: filters.labelQuery, onChange: (e) => onChange({ labelQuery: e.target.value }), title: "\u90E8\u5206\u4E00\u81F4\u3067\u30E9\u30D9\u30EB\u756A\u53F7\u3092\u691C\u7D22\u3002unlabeled \u3067\u30E9\u30D9\u30EB\u306A\u3057\u306E\u307F\u3002" })] }), _jsx(RangeInputs, { label: "Session", value: filters.sessionRange, min: bounds.session.min, max: bounds.session.max, onChange: (next) => onChange({ sessionRange: next }) }), _jsx(RangeInputs, { label: "Frame", value: filters.frameRange, min: bounds.frame.min, max: bounds.frame.max, onChange: (next) => onChange({ frameRange: next }) })] })] }));
}
export default FilterPanel;
