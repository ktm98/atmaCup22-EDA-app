import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from 'react';
const colorForLabel = (label) => {
    if (label === null)
        return '#eab308';
    const hue = (label * 37) % 360;
    return `hsl(${hue}, 76%, 58%)`;
};
const TEST_CANVAS = { w: 3840, h: 2160 };
export function ImageViewer({ image, visibleBoxes, currentIndex, total, onPrev, onNext, onPrevFrameInSession, onNextFrameInSession, isPlaying, playInterval, onTogglePlay, onPlayIntervalChange, sessionFrames, sessionIndex, onSeekSessionIndex, sessionOptions, onPrevSession, onNextSession, onSelectSession, showBoxes, onToggleBoxes }) {
    const containerRef = useRef(null);
    const imgRef = useRef(null);
    const [naturalSize, setNaturalSize] = useState(null);
    const [renderSize, setRenderSize] = useState(null);
    const [hoveredBoxId, setHoveredBoxId] = useState(null);
    useEffect(() => {
        const update = () => {
            if (containerRef.current) {
                setRenderSize({
                    w: containerRef.current.clientWidth,
                    h: containerRef.current.clientHeight
                });
            }
        };
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, []);
    useEffect(() => {
        // Reset base size when画像が切り替わったとき。testは固定キャンバスサイズ。
        const isTest = image?.source === 'test';
        setNaturalSize(isTest ? TEST_CANVAS : null);
        if (isTest && containerRef.current) {
            setRenderSize({
                w: containerRef.current.clientWidth,
                h: containerRef.current.clientHeight
            });
        }
        else {
            setRenderSize(null);
        }
        setHoveredBoxId(null);
    }, [image?.id, image?.source]);
    useEffect(() => {
        setHoveredBoxId(null);
    }, [visibleBoxes]);
    const scale = useMemo(() => {
        if (!naturalSize || !renderSize)
            return { x: 1, y: 1 };
        return {
            x: renderSize.w / naturalSize.w,
            y: renderSize.h / naturalSize.h
        };
    }, [naturalSize, renderSize]);
    const sortedBoxes = useMemo(() => [...visibleBoxes].sort((a, b) => {
        const la = a.labelId ?? -Infinity;
        const lb = b.labelId ?? -Infinity;
        if (la === lb)
            return a.id.localeCompare(b.id);
        return la - lb;
    }), [visibleBoxes]);
    if (!image) {
        return (_jsx("div", { className: "panel", style: { minHeight: 320, display: 'grid', placeItems: 'center' }, children: _jsx("div", { className: "muted", children: "No image matches the current filters." }) }));
    }
    return (_jsxs("div", { className: "panel", children: [_jsxs("div", { className: "flex-between", style: { marginBottom: 12 }, children: [_jsxs("div", { children: [_jsxs("div", { className: "badge", style: { marginBottom: 6 }, children: [_jsx("span", { children: image.source }), _jsx("span", { children: "\u2022" }), _jsx("span", { children: image.angle }), _jsx("span", { children: "\u2022" }), _jsxs("span", { children: ["session ", image.session, " / frame ", image.frame] })] }), _jsxs("div", { className: "hint", children: [image.quarter, " \u2022 ", visibleBoxes.length, " boxes (original ", image.boxes.length, ")"] }), _jsxs("div", { className: "hint", style: { marginTop: 6, fontFamily: 'monospace' }, children: ["file: ", image.imagePath.split('/').pop()] })] }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 8 }, children: [_jsx("button", { className: "pill", onClick: onPrev, disabled: currentIndex <= 0, title: "\u524D\u306E\u4E00\u81F4\u753B\u50CF\u3078", children: "\u2190 Prev" }), _jsxs("div", { className: "hint", children: [currentIndex + 1, " / ", total] }), _jsx("button", { className: "pill", onClick: onNext, disabled: currentIndex >= total - 1, title: "\u6B21\u306E\u4E00\u81F4\u753B\u50CF\u3078", children: "Next \u2192" })] })] }), _jsxs("div", { className: "flex-between", style: { marginBottom: 12, gap: 8, flexWrap: 'wrap' }, children: [_jsx("div", { className: "hint", children: "\u30D3\u30E5\u30FC\u30A2: \u30D5\u30A3\u30EB\u30BF\u306B\u4E00\u81F4\u3057\u305F1\u679A\u3092\u8868\u793A\u3002BBox\u306F\u30E9\u30D9\u30EB\u8272\u5206\u3051\u3002" }), _jsxs("div", { style: { display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }, children: [_jsxs("div", { style: { display: 'flex', gap: 8 }, children: [_jsx("button", { className: "pill", onClick: onPrevSession, disabled: sessionOptions.length <= 1, title: "\u540C\u3058 quarter/angle \u306E\u524D\u30BB\u30C3\u30B7\u30E7\u30F3\u3078", children: "\u2190 Prev session" }), _jsx("button", { className: "pill", onClick: onNextSession, disabled: sessionOptions.length <= 1, title: "\u540C\u3058 quarter/angle \u306E\u6B21\u30BB\u30C3\u30B7\u30E7\u30F3\u3078", children: "Next session \u2192" })] }), _jsxs("div", { style: { display: 'flex', gap: 8 }, children: [_jsx("button", { className: "pill", onClick: onPrevFrameInSession, title: "\u540C\u30BB\u30C3\u30B7\u30E7\u30F3\u5185\u306E\u524D\u30D5\u30EC\u30FC\u30E0", children: "\u2190 Session frame" }), _jsx("button", { className: "pill", onClick: onNextFrameInSession, title: "\u540C\u30BB\u30C3\u30B7\u30E7\u30F3\u5185\u306E\u6B21\u30D5\u30EC\u30FC\u30E0", children: "Session frame \u2192" })] }), _jsx("select", { className: "input", style: { width: 140 }, value: sessionOptions.includes(image.session) ? image.session : '', onChange: (e) => onSelectSession(Number(e.target.value)), title: "\u540C\u3058 quarter/angle \u306E\u30BB\u30C3\u30B7\u30E7\u30F3\u3092\u6307\u5B9A", children: sessionOptions.map((s) => (_jsxs("option", { value: s, children: ["session ", s] }, s))) })] })] }), _jsxs("div", { style: { display: 'grid', gap: 12, gridTemplateColumns: '1fr 260px', alignItems: 'start' }, children: [_jsxs("div", { children: [_jsxs("div", { ref: containerRef, style: {
                                    position: 'relative',
                                    width: '100%',
                                    aspectRatio: '16 / 9',
                                    background: '#000',
                                    borderRadius: 12,
                                    border: '1px solid var(--border)',
                                    overflow: 'hidden'
                                }, children: [image.source === 'train' ? (_jsx("img", { ref: imgRef, src: image.imagePath, alt: image.id, style: { width: '100%', height: '100%', objectFit: 'contain', display: 'block' }, onLoad: (e) => {
                                            setNaturalSize({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight });
                                            setRenderSize({
                                                w: containerRef.current?.clientWidth ?? e.currentTarget.clientWidth,
                                                h: containerRef.current?.clientHeight ?? e.currentTarget.clientHeight
                                            });
                                        } })) : (
                                    // test: 背景は黒。すべての crop 画像を bbox 座標に貼り付ける
                                    (renderSize && naturalSize) && (_jsx(_Fragment, { children: visibleBoxes.map((box) => {
                                            const left = box.x * scale.x;
                                            const top = box.y * scale.y;
                                            const width = box.w * scale.x;
                                            const height = box.h * scale.y;
                                            return (_jsx("img", { src: box.cropPath ?? image.imagePath, alt: image.id, style: {
                                                    position: 'absolute',
                                                    left,
                                                    top,
                                                    width,
                                                    height,
                                                    objectFit: 'fill'
                                                } }, `${box.id}-img`));
                                        }) }))), naturalSize && renderSize && showBoxes && (_jsx("div", { style: {
                                            position: 'absolute',
                                            inset: 0,
                                            pointerEvents: 'none'
                                        }, children: visibleBoxes.map((box) => {
                                            const left = box.x * scale.x;
                                            const top = box.y * scale.y;
                                            const width = box.w * scale.x;
                                            const height = box.h * scale.y;
                                            const isDimmed = hoveredBoxId !== null && box.id !== hoveredBoxId;
                                            const isHighlighted = hoveredBoxId !== null && box.id === hoveredBoxId;
                                            return (_jsx("div", { style: {
                                                    position: 'absolute',
                                                    left,
                                                    top,
                                                    width,
                                                    height,
                                                    border: `2px solid ${colorForLabel(box.labelId)}`,
                                                    borderRadius: 8,
                                                    boxShadow: isHighlighted
                                                        ? '0 0 0 2px rgba(255,255,255,0.6)'
                                                        : '0 0 0 1px rgba(0,0,0,0.3)',
                                                    opacity: isDimmed ? 0.35 : 1
                                                }, children: _jsx("div", { style: {
                                                        position: 'absolute',
                                                        top: -24,
                                                        left: 0,
                                                        padding: '4px 8px',
                                                        borderRadius: 8,
                                                        background: 'rgba(0,0,0,0.7)',
                                                        color: 'white',
                                                        fontSize: 12,
                                                        fontWeight: 700
                                                    }, children: box.labelId === null ? 'unlabeled' : `label ${box.labelId}` }) }, box.id));
                                        }) }))] }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }, children: [_jsx("button", { className: "pill", onClick: onTogglePlay, style: { padding: '10px 12px' }, title: "\u540C\u30BB\u30C3\u30B7\u30E7\u30F3\u5185\u3092\u81EA\u52D5\u518D\u751F", children: isPlaying ? '⏸ Pause' : '▶ Play' }), _jsxs("div", { style: { flex: 1 }, children: [_jsx("input", { type: "range", min: 0, max: Math.max(sessionFrames.length - 1, 0), value: Math.max(sessionIndex, 0), onChange: (e) => onSeekSessionIndex(Number(e.target.value)), style: { width: '100%' }, disabled: sessionFrames.length <= 1, title: "\u30BB\u30C3\u30B7\u30E7\u30F3\u5185\u30D5\u30EC\u30FC\u30E0\u3092\u30B7\u30FC\u30AF" }), _jsx("div", { className: "hint", style: { marginTop: 4 }, children: sessionFrames.length > 0
                                                    ? `session frames: ${sessionIndex + 1}/${sessionFrames.length} (frame ${image.frame})`
                                                    : 'session frames: n/a' })] }), _jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: 6 }, children: [_jsx("span", { className: "hint", children: "interval (ms)" }), _jsx("input", { className: "input", style: { width: 90 }, type: "number", min: 100, step: 100, value: playInterval, onChange: (e) => onPlayIntervalChange(Math.max(100, Number(e.target.value))) })] })] })] }), _jsxs("div", { style: { minWidth: 220 }, children: [_jsxs("div", { className: "badge", style: { marginBottom: 10 }, children: [visibleBoxes.length, " boxes in this view", _jsx("button", { className: "pill", style: { marginLeft: 8 }, onClick: onToggleBoxes, title: "BBox\u3068\u30E9\u30D9\u30EB\u306E\u8868\u793A/\u975E\u8868\u793A", children: showBoxes ? 'Hide boxes' : 'Show boxes' })] }), _jsxs("table", { className: "table", children: [_jsx("thead", { children: _jsxs("tr", { className: "muted", children: [_jsx("th", { align: "left", children: "Label" }), _jsx("th", { align: "left", children: "Pos" }), _jsx("th", { align: "left", children: "Size" })] }) }), _jsxs("tbody", { children: [sortedBoxes.slice(0, 20).map((box) => {
                                                const isHovered = hoveredBoxId !== null && hoveredBoxId === box.id;
                                                return (_jsxs("tr", { onMouseEnter: () => setHoveredBoxId(box.id), onMouseLeave: () => setHoveredBoxId(null), style: {
                                                        background: isHovered ? 'rgba(14,165,233,0.1)' : 'transparent',
                                                        cursor: 'pointer'
                                                    }, children: [_jsx("td", { children: box.labelId ?? '—' }), _jsxs("td", { children: [box.x, ", ", box.y] }), _jsxs("td", { children: [box.w, "\u00D7", box.h] })] }, box.id));
                                            }), sortedBoxes.length === 0 && (_jsx("tr", { children: _jsx("td", { colSpan: 3, className: "muted", children: "No boxes match the label filter." }) }))] })] })] })] })] }));
}
export default ImageViewer;
