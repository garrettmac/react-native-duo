"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activeDivision = activeDivision;
exports.splitParts = splitParts;
exports.arrangementLayout = arrangementLayout;
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}
function intersects(a, b) {
    return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
}
/** The first active division crossing a box at `origin` of `size` in the root view, in the box's own points; its axis is the direction it divides in. */
function activeDivision({ size, origin, regions }) {
    const box = { x: 0, y: 0, width: size.width, height: size.height };
    for (const region of regions) {
        if (region.kind !== 'division' || !region.isActive)
            continue;
        const frame = { x: region.frame.x - origin.x, y: region.frame.y - origin.y, width: region.frame.width, height: region.frame.height };
        if (intersects(frame, box))
            return { frame, axis: frame.height >= frame.width ? 'horizontal' : 'vertical' };
    }
    return null;
}
/** The two parts either side of the division, or two halves when there is none: left or top first. */
function parts(size, axis, division) {
    const { width, height } = size;
    if (axis === 'horizontal') {
        const start = division ? clamp(division.frame.x, 0, width) : Math.round(width / 2);
        const end = division ? clamp(division.frame.x + division.frame.width, 0, width) : start;
        return [
            { x: 0, y: 0, width: start, height },
            { x: end, y: 0, width: width - end, height },
        ];
    }
    const start = division ? clamp(division.frame.y, 0, height) : Math.round(height / 2);
    const end = division ? clamp(division.frame.y + division.frame.height, 0, height) : start;
    return [
        { x: 0, y: 0, width, height: start },
        { x: 0, y: end, width, height: height - end },
    ];
}
/** Leading first: the right part comes first in a right-to-left layout. */
function leadingFirst(axis, rtl, [before, after]) {
    return axis === 'horizontal' && rtl ? [after, before] : [before, after];
}
/** The two parts of a box divided along `axis`, around `division` or in halves, leading or top first. */
function splitParts(size, axis, division, rtl) {
    return leadingFirst(axis, rtl, parts(size, axis, division));
}
function full(size) {
    return { x: 0, y: 0, width: size.width, height: size.height };
}
function layered(size) {
    return {
        primary: { frame: full(size), isHidden: false, splitAxis: null, zIndex: 1 },
        secondary: { frame: full(size), isHidden: false, splitAxis: null, zIndex: 0 },
    };
}
function overlayLayout(input) {
    if (input.collapsed) {
        return {
            primary: { frame: full(input.size), isHidden: false, splitAxis: null, zIndex: 1 },
            secondary: { frame: full(input.size), isHidden: true, splitAxis: null, zIndex: 0 },
        };
    }
    const division = activeDivision(input);
    if (division === null || !input.axes.includes(division.axis))
        return layered(input.size);
    const [leading, trailing] = splitParts(input.size, division.axis, division, input.rtl);
    return {
        primary: { frame: trailing, isHidden: false, splitAxis: division.axis, zIndex: 1 },
        secondary: { frame: leading, isHidden: false, splitAxis: division.axis, zIndex: 0 },
    };
}
function splitLayout(input) {
    const division = activeDivision(input);
    const axis = division ? division.axis : input.size.width > input.size.height ? 'horizontal' : 'vertical';
    if (!input.axes.includes(axis)) {
        return {
            primary: { frame: full(input.size), isHidden: false, splitAxis: null, zIndex: 0 },
            secondary: { frame: full(input.size), isHidden: true, splitAxis: null, zIndex: 0 },
        };
    }
    const [first, second] = splitParts(input.size, axis, division, input.rtl);
    return {
        primary: { frame: first, isHidden: false, splitAxis: axis, zIndex: 0 },
        secondary: { frame: second, isHidden: false, splitAxis: axis, zIndex: 0 },
    };
}
function arrangementLayout(input) {
    return input.kind === 'overlay' ? overlayLayout(input) : splitLayout(input);
}
//# sourceMappingURL=arrangement-layout.js.map