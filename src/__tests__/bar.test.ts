import {barGroups, verticalBarLayout, type BarItem} from '../bar';

const back: BarItem = {key: 'back', role: 'navigation', icon: true, title: 'Back'};
const done: BarItem = {key: 'done', role: 'prominent', icon: true, title: 'Done'};
const share: BarItem = {key: 'share', icon: true, title: 'Share'};
const filter: BarItem = {key: 'filter', icon: true, title: 'Filter', bar: 'bottom'};
const trash: BarItem = {key: 'trash', icon: true, title: 'Delete', bar: 'bottom', priority: 'low'};
const edit: BarItem = {key: 'edit', title: 'Edit'};
const picker: BarItem = {key: 'picker', icon: true, title: 'Mode', axisBehavior: 'horizontalOnly'};

const keys = (items: BarItem[]) => items.map(item => item.key);

describe('verticalBarLayout', () => {
  it('keeps every item horizontal where the system has no vertical edge', () => {
    const layout = verticalBarLayout({edge: null, items: [back, share], length: 800, itemLength: 44});
    expect(layout.axis).toBe('horizontal');
    expect(keys(layout.horizontal)).toEqual(['back', 'share']);
  });

  it('orders the strip Back, then the prominent action, then the rest; bottom items at the bottom', () => {
    const layout = verticalBarLayout({edge: 'leading', items: [share, filter, done, back], length: 800, itemLength: 44});
    expect(keys(layout.top)).toEqual(['back', 'done', 'share']);
    expect(keys(layout.bottom)).toEqual(['filter']);
    expect(layout.overflow).toEqual([]);
  });

  it('keeps text-only and horizontal-only items in a horizontal bar', () => {
    const layout = verticalBarLayout({edge: 'trailing', items: [back, edit, picker], length: 800, itemLength: 44});
    expect(keys(layout.horizontal)).toEqual(['edit', 'picker']);
    expect(keys(layout.top)).toEqual(['back']);
  });

  it('overflows the lowest priority first, then bottom to top among equals, keeping a slot for the menu', () => {
    const items = [back, done, share, filter, trash];
    const layout = verticalBarLayout({edge: 'leading', items, length: 4 * 44, itemLength: 44});
    expect(keys(layout.overflow)).toEqual(['filter', 'trash']);
    expect(keys([...layout.top, ...layout.bottom])).toEqual(['back', 'done', 'share']);
  });

  it('never overflows Back', () => {
    const layout = verticalBarLayout({edge: 'leading', items: [back, done], length: 44, itemLength: 44});
    expect(keys(layout.top)).toEqual(['back']);
    expect(keys(layout.overflow)).toEqual(['done']);
  });

  it('overflows bar items before touching the tab bar on a navigation screen', () => {
    const layout = verticalBarLayout({edge: 'leading', items: [back, done, share], length: 6 * 44, itemLength: 44, tabBarLength: 4 * 44});
    expect(layout.tabBar).toBe('full');
    expect(keys(layout.overflow)).toEqual(['done', 'share']);
  });

  it('minimizes the tab bar first on a task screen', () => {
    const layout = verticalBarLayout({edge: 'leading', items: [back, done, share], length: 6 * 44, itemLength: 44, tabBarLength: 4 * 44, compression: 'prefersBarItems'});
    expect(layout.tabBar).toBe('minimized');
    expect(layout.overflow).toEqual([]);
  });
});

describe('barGroups', () => {
  it('puts neighbours of one group in a capsule and every other item alone', () => {
    const reply = {key: 'reply', icon: true, group: 'respond'};
    const forward = {key: 'forward', icon: true, group: 'respond'};
    const compose = {key: 'compose', icon: true};
    const trash = {key: 'trash', icon: true, group: 'file'};
    expect(barGroups([compose, reply, forward, trash]).map(group => group.map(item => item.key))).toEqual([['compose'], ['reply', 'forward'], ['trash']]);
  });
});
