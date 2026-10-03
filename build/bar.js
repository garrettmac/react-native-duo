"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.barGroups = barGroups;
exports.verticalBarLayout = verticalBarLayout;
exports.useVerticalBar = useVerticalBar;
/**
 * Where bar items go when the system stands bars on the side: Apple's vertical-bar rules for an app whose bars are
 * its own views. Back or Close at the top, then the prominent action, then the top bar's items; the bottom bar's
 * items at the bottom; items that cannot stand (text-only, `horizontalOnly`) stay in a horizontal bar; what does not
 * fit goes to one overflow menu, lowest priority first and bottom to top among equals.
 */
const react_1 = require("react");
const page_context_1 = require("./page-context");
const pane_1 = require("./pane");
/** Splits a laid-out run of items into capsules: neighbours with the same `group` together, every other item alone. */
function barGroups(items) {
    const groups = [];
    for (const item of items) {
        const last = groups[groups.length - 1];
        if (last && item.group !== undefined && last[0].group === item.group)
            last.push(item);
        else
            groups.push([item]);
    }
    return groups;
}
const PRIORITY = { high: 750, standard: 500, low: 250 };
function priorityOf(item) {
    if (item.role === 'navigation')
        return Number.POSITIVE_INFINITY;
    const value = item.priority ?? 'standard';
    return typeof value === 'number' ? value : PRIORITY[value];
}
function canStand(item) {
    return item.icon === true && item.axisBehavior !== 'horizontalOnly';
}
const ROLE_ORDER = { navigation: 0, prominent: 1, standard: 2 };
function topOrder(items) {
    return items
        .map((item, index) => ({ item, index }))
        .sort((a, b) => ROLE_ORDER[a.item.role ?? 'standard'] - ROLE_ORDER[b.item.role ?? 'standard'] || a.index - b.index)
        .map(({ item }) => item);
}
function verticalBarLayout({ edge, items, length, itemLength, tabBarLength = 0, minimizedTabBarLength = itemLength, compression = 'automatic', }) {
    const hasTabBar = tabBarLength > 0;
    if (edge === null)
        return { axis: 'horizontal', edge, top: [], bottom: [], horizontal: [...items], overflow: [], tabBar: hasTabBar ? 'full' : 'none' };
    const horizontal = items.filter(item => !canStand(item));
    const standing = items.filter(canStand);
    let top = topOrder(standing.filter(item => item.role === 'navigation' || item.role === 'prominent' || item.bar !== 'bottom'));
    let bottom = standing.filter(item => !top.includes(item));
    const overflow = [];
    const room = (tabBar, overflowSlot) => Math.floor((length - tabBar) / itemLength) - (overflowSlot ? 1 : 0);
    const count = () => top.length + bottom.length;
    let tabBar = hasTabBar ? 'full' : 'none';
    const minimizeFirst = compression === 'prefersBarItems';
    if (hasTabBar && minimizeFirst && count() > room(tabBarLength, false))
        tabBar = 'minimized';
    const tabLength = () => (tabBar === 'full' ? tabBarLength : tabBar === 'minimized' ? minimizedTabBarLength : 0);
    while (count() > room(tabLength(), overflow.length > 0)) {
        const stack = [...top, ...bottom];
        let victim = null;
        for (let i = stack.length - 1; i >= 0; i--) {
            const item = stack[i];
            if (item.role === 'navigation')
                continue;
            if (victim === null || priorityOf(item) < priorityOf(victim))
                victim = item;
        }
        if (victim === null) {
            if (hasTabBar && tabBar === 'full') {
                tabBar = 'minimized';
                continue;
            }
            break;
        }
        overflow.unshift(victim);
        top = top.filter(item => item !== victim);
        bottom = bottom.filter(item => item !== victim);
    }
    return { axis: 'vertical', edge, top, bottom, horizontal, overflow, tabBar };
}
/** `verticalBarLayout` for the pane this bar is in, re-run on every pose change. */
function useVerticalBar(items, { itemLength, insetTop = 0, insetBottom = 0, ...rest }) {
    const edge = (0, page_context_1.usePaneBarEdge)();
    const { height } = (0, pane_1.usePane)();
    const { tabBarLength, minimizedTabBarLength, compression } = rest;
    return (0, react_1.useMemo)(() => verticalBarLayout({ edge, items, length: height - insetTop - insetBottom, itemLength, tabBarLength, minimizedTabBarLength, compression }), [edge, items, height, insetTop, insetBottom, itemLength, tabBarLength, minimizedTabBarLength, compression]);
}
//# sourceMappingURL=bar.js.map