"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DUO_BAR_TESTID = void 0;
exports.DuoBar = DuoBar;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * A bar that lays itself out by Apple's rules and draws every part with your components. Horizontal (a phone, a
 * pane away from the edge): navigation items at the start, the title, the rest at the end. Standing (the side strip):
 * navigation, then the prominent action, then the top bar's items at the top, the bottom bar's items at the bottom,
 * and what does not fit in one overflow. Items that share a `group` sit in one capsule either way.
 */
const react_1 = require("react");
const react_native_1 = require("react-native");
const bar_1 = require("./bar");
exports.DUO_BAR_TESTID = 'duo-bar';
const DEFAULT_ITEM_LENGTH = 52;
function DuoBar({ items, renderItem, renderGroup, renderOverflow, title, axis = 'auto', part, style, horizontalStyle, verticalStyle, groupStyle, itemStyle, itemLength = DEFAULT_ITEM_LENGTH, testID = exports.DUO_BAR_TESTID, ...options }) {
    const layout = (0, bar_1.useVerticalBar)(items, { itemLength, ...options });
    const vertical = axis === 'auto' ? layout.axis === 'vertical' : axis === 'vertical';
    const context = { vertical };
    const warned = (0, react_1.useRef)(false);
    const item = (entry) => (0, jsx_runtime_1.jsx)(react_1.Fragment, { children: itemStyle ? (0, jsx_runtime_1.jsx)(react_native_1.View, { style: itemStyle, children: renderItem(entry, context) }) : renderItem(entry, context) }, entry.key);
    const groups = (run) => (0, bar_1.barGroups)(run).map(group => {
        const children = group.map(item);
        return ((0, jsx_runtime_1.jsx)(react_1.Fragment, { children: renderGroup ? renderGroup(children, group, context) : (0, jsx_runtime_1.jsx)(react_native_1.View, { style: [vertical ? styles.column : styles.row, groupStyle], children: children }) }, group[0].key));
    });
    const overflow = vertical && part !== 'bottom' ? layout.overflow : [];
    if (overflow.length > 0 && !renderOverflow && !warned.current && process.env.NODE_ENV !== 'production') {
        warned.current = true;
        console.warn(`DuoBar: ${overflow.length} item(s) do not fit and no renderOverflow was given.`);
    }
    if (vertical) {
        const standing = layout.axis === 'vertical' ? layout : { top: items.filter(entry => entry.bar !== 'bottom'), bottom: items.filter(entry => entry.bar === 'bottom'), horizontal: [] };
        return ((0, jsx_runtime_1.jsxs)(react_native_1.View, { testID: testID, style: [styles.column, style, verticalStyle], children: [part !== 'bottom' ? groups(standing.top) : null, overflow.length > 0 && renderOverflow ? renderOverflow(overflow, context) : null, part === undefined ? (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.fill }) : null, part !== 'top' ? groups(standing.bottom) : null] }));
    }
    const shown = part === undefined ? items : items.filter(entry => (entry.bar === 'bottom') === (part === 'bottom'));
    const leading = shown.filter(entry => entry.role === 'navigation');
    const trailing = [...shown.filter(entry => entry.role !== 'navigation' && entry.role !== 'prominent'), ...shown.filter(entry => entry.role === 'prominent')];
    return ((0, jsx_runtime_1.jsxs)(react_native_1.View, { testID: testID, style: [styles.row, style, horizontalStyle], children: [(0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.row, children: groups(leading) }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.fill, children: title }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.row, children: groups(trailing) })] }));
}
const styles = react_native_1.StyleSheet.create({
    fill: { flex: 1 },
    row: { flexDirection: 'row', alignItems: 'center' },
    column: { flexDirection: 'column', alignItems: 'center' },
});
//# sourceMappingURL=duo-bar.js.map