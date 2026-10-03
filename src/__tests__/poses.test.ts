import {POSE_NAMES, poses} from '../poses';

describe('poses', () => {
  it('names every pose', () => {
    expect([...POSE_NAMES].sort()).toEqual([
      'closed',
      'closedLandscape',
      'iPad',
      'openLandscape',
      'openPortrait',
      'partlyFolded',
      'partlyFoldedTabletop',
      'phone',
      'pipPinned',
      'splitHalfLeading',
      'splitHalfTrailing',
    ]);
  });

  it('keys each pose by its own name', () => {
    for (const name of POSE_NAMES) expect(poses[name].name).toBe(name);
  });

  it('is frozen', () => {
    expect(Object.isFrozen(poses)).toBe(true);
  });

  it('has an active division only while partly folded', () => {
    const active = POSE_NAMES.filter(name => poses[name].regions.some(region => region.kind === 'division' && region.isActive));
    expect([...active].sort()).toEqual(['partlyFolded', 'partlyFoldedTabletop']);
  });

  it('puts the app in half the inner display, compact wide, on the outer edge of its half', () => {
    const {splitHalfLeading, splitHalfTrailing, openLandscape} = poses;
    for (const half of [splitHalfLeading, splitHalfTrailing]) {
      expect(half.sizeClass.horizontal).toBe('compact');
      expect(half.window.width).toBeLessThan(openLandscape.window.width / 2);
      expect(half.window.height).toBe(openLandscape.window.height);
    }
    expect(splitHalfLeading.verticalBarEdge).toBe('leading');
    expect(splitHalfTrailing.verticalBarEdge).toBe('trailing');
  });

  it('takes about half the inner display height for a pinned video', () => {
    const {pipPinned, openLandscape} = poses;
    expect(pipPinned.window.width).toBe(openLandscape.window.width);
    expect(pipPinned.window.height / openLandscape.window.height).toBeGreaterThan(0.45);
    expect(pipPinned.window.height / openLandscape.window.height).toBeLessThan(0.55);
    expect(pipPinned.sizeClass).toEqual({horizontal: 'regular', vertical: 'compact'});
  });
});
