"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evenColumnCount = evenColumnCount;
exports.useEvenColumns = useEvenColumns;
/**
 * How many columns a grid draws: one when only one fits, otherwise an even number, so on the iPhone Duo the fold
 * falls between two columns and no cell straddles it. Computed from the pane the grid is in, never the window.
 */
const pane_1 = require("./pane");
/** Columns of at least `minCellWidth` that fit `width` with `gap` between them: 1 if only one fits, else the most even count up to `max`, never under `min`. */
function evenColumnCount(width, minCellWidth, { gap = 0, min = 1, max = 4 } = {}) {
    const fit = Number.isFinite(width) && width > 0 ? Math.floor((width + gap) / (minCellWidth + gap)) : 0;
    const even = fit < 2 ? 1 : Math.min(fit - (fit % 2), max - (max % 2));
    return Math.max(min, even);
}
function useEvenColumns(minCellWidth, { gap = 0, inset = 0, min = 1, max = 4 } = {}) {
    const { width } = (0, pane_1.usePane)();
    return evenColumnCount(width - inset, minCellWidth, { gap, min, max });
}
//# sourceMappingURL=grid.js.map