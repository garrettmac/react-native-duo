"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSizeClass = useSizeClass;
exports.useVerticalBarEdge = useVerticalBarEdge;
exports.useReservedRegions = useReservedRegions;
exports.useBarInsets = useBarInsets;
/** The hooks: each reads the provider's state, or the window when there is no provider. */
const react_1 = require("react");
const context_1 = require("./context");
const page_context_1 = require("./page-context");
function useSizeClass() {
    return (0, context_1.useDuo)().sizeClass;
}
function useVerticalBarEdge() {
    return (0, context_1.useDuo)().verticalBarEdge;
}
/** The reserved regions of one kind, or both kinds when `kind` is left out; only the active ones unless `includeInactive`. */
function useReservedRegions({ kind, includeInactive = false } = {}) {
    const { regions } = (0, context_1.useDuo)();
    return (0, react_1.useMemo)(() => regions.filter(region => (kind === undefined || region.kind === kind) && (includeInactive || region.isActive)), [regions, kind, includeInactive]);
}
const NO_INSETS = { top: 0, bottom: 0, leading: 0, trailing: 0 };
/**
 * What content keeps clear of a vertical bar `barWidth` points wide: the bar's width on its edge, zero elsewhere.
 * The width is the app's own bar; the system publishes none for a custom one.
 */
function useBarInsets(barWidth) {
    const edge = (0, page_context_1.usePaneBarEdge)();
    return (0, react_1.useMemo)(() => {
        if (edge === 'leading')
            return { ...NO_INSETS, leading: barWidth };
        if (edge === 'trailing')
            return { ...NO_INSETS, trailing: barWidth };
        return NO_INSETS;
    }, [edge, barWidth]);
}
//# sourceMappingURL=hooks.js.map