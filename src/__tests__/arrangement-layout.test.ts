import {activeDivision, arrangementLayout, splitParts, type ArrangementInput} from '../arrangement-layout';
import {POSE_NAMES, poses, type PoseName} from '../poses';
import type {ArrangementKind, ReservedRegion} from '../types';
import {AXES, OVERLAY, SPLIT, rect, type AxesKey, type Expected} from './helpers/arrangement-table';

const kinds: Record<ArrangementKind, Record<PoseName, Record<AxesKey, Expected>>> = {overlay: OVERLAY, split: SPLIT};
const axesKeys = Object.keys(AXES) as AxesKey[];

function inPose(pose: PoseName, kind: ArrangementKind, axes: AxesKey, overrides: Partial<ArrangementInput> = {}): ArrangementInput {
  const {window, regions} = poses[pose];
  return {kind, axes: AXES[axes], size: window, origin: {x: 0, y: 0}, regions, rtl: false, ...overrides};
}

describe.each(['overlay', 'split'] as const)('%s arrangement', kind => {
  describe.each(POSE_NAMES)('in the %s pose', pose => {
    it.each(axesKeys)('with axes %s', axes => {
      const expected = kinds[kind][pose][axes];
      const layout = arrangementLayout(inPose(pose, kind, axes));
      expect(layout.primary.frame).toEqual(expected.primary);
      expect(layout.primary.isHidden).toBe(false);
      expect(layout.primary.splitAxis).toBe(expected.axis);
      expect(layout.primary.zIndex).toBe(expected.primaryZ);
      if (expected.secondary === 'hidden') {
        expect(layout.secondary.isHidden).toBe(true);
        expect(layout.secondary.splitAxis).toBeNull();
      } else {
        expect(layout.secondary.frame).toEqual(expected.secondary);
        expect(layout.secondary.isHidden).toBe(false);
        expect(layout.secondary.splitAxis).toBe(expected.axis);
      }
      expect(layout.secondary.zIndex).toBe(expected.secondaryZ);
    });
  });
});

describe('a right-to-left layout', () => {
  it('overlay puts primary in the trailing part, which is the left one', () => {
    const layout = arrangementLayout(inPose('partlyFolded', 'overlay', 'both', {rtl: true}));
    expect(layout.primary.frame).toEqual(rect(0, 0, 530, 951));
    expect(layout.secondary.frame).toEqual(rect(570, 0, 530, 951));
  });

  it('split puts primary first, which is the right one', () => {
    const layout = arrangementLayout(inPose('partlyFolded', 'split', 'both', {rtl: true}));
    expect(layout.primary.frame).toEqual(rect(570, 0, 530, 951));
    expect(layout.secondary.frame).toEqual(rect(0, 0, 530, 951));
  });

  it('leaves a vertical division alone', () => {
    const layout = arrangementLayout(inPose('partlyFoldedTabletop', 'split', 'both', {rtl: true}));
    expect(layout.primary.frame).toEqual(rect(0, 0, 951, 530));
    expect(layout.secondary.frame).toEqual(rect(0, 570, 951, 530));
  });

  it('splits an undivided wide window with primary on the right', () => {
    const layout = arrangementLayout(inPose('openLandscape', 'split', 'both', {rtl: true}));
    expect(layout.primary.frame).toEqual(rect(550, 0, 550, 951));
    expect(layout.secondary.frame).toEqual(rect(0, 0, 550, 951));
  });
});

describe('an arrangement smaller than the root', () => {
  const fold: ReservedRegion = {kind: 'division', frame: rect(530, 0, 40, 951), margins: {top: 0, left: 10, bottom: 0, right: 10}, isActive: true};

  it('measures the division from the arrangement own origin', () => {
    const layout = arrangementLayout({kind: 'overlay', axes: AXES.both, size: {width: 400, height: 300}, origin: {x: 500, y: 100}, regions: [fold], rtl: false});
    expect(layout.secondary.frame).toEqual(rect(0, 0, 30, 300));
    expect(layout.primary.frame).toEqual(rect(70, 0, 330, 300));
  });

  it('ignores a division that does not cross it', () => {
    const layout = arrangementLayout({kind: 'overlay', axes: AXES.both, size: {width: 400, height: 300}, origin: {x: 600, y: 0}, regions: [fold], rtl: false});
    expect(layout.primary.splitAxis).toBeNull();
    expect(layout.primary.frame).toEqual(rect(0, 0, 400, 300));
  });

  it('ignores a division that only touches its edge', () => {
    const layout = arrangementLayout({kind: 'split', axes: AXES.both, size: {width: 530, height: 300}, origin: {x: 0, y: 0}, regions: [fold], rtl: false});
    expect(layout.primary.splitAxis).toBe('horizontal');
    expect(layout.primary.frame).toEqual(rect(0, 0, 265, 300));
  });

  it('keeps a division that sticks out of it inside it', () => {
    const layout = arrangementLayout({kind: 'split', axes: AXES.both, size: {width: 550, height: 300}, origin: {x: 0, y: 0}, regions: [fold], rtl: false});
    expect(layout.primary.frame).toEqual(rect(0, 0, 530, 300));
    expect(layout.secondary.frame).toEqual(rect(550, 0, 0, 300));
  });
});

describe('which regions count', () => {
  const inactive: ReservedRegion = {kind: 'division', frame: rect(530, 0, 40, 951), margins: {top: 0, left: 0, bottom: 0, right: 0}, isActive: false};
  const camera: ReservedRegion = {kind: 'occlusion', frame: rect(530, 0, 40, 40), margins: {top: 0, left: 0, bottom: 0, right: 0}, isActive: true};
  const first: ReservedRegion = {kind: 'division', frame: rect(100, 0, 20, 951), margins: {top: 0, left: 0, bottom: 0, right: 0}, isActive: true};
  const second: ReservedRegion = {kind: 'division', frame: rect(530, 0, 40, 951), margins: {top: 0, left: 0, bottom: 0, right: 0}, isActive: true};
  const base = {axes: AXES.both, size: {width: 1100, height: 951}, origin: {x: 0, y: 0}, rtl: false};

  it('never an inactive division', () => {
    expect(arrangementLayout({...base, kind: 'overlay', regions: [inactive]}).primary.splitAxis).toBeNull();
  });

  it('never an occlusion', () => {
    expect(arrangementLayout({...base, kind: 'overlay', regions: [camera]}).primary.splitAxis).toBeNull();
    expect(arrangementLayout({...base, kind: 'split', regions: [camera]}).primary.frame).toEqual(rect(0, 0, 550, 951));
  });

  it('the first active division that crosses the arrangement', () => {
    const layout = arrangementLayout({...base, kind: 'overlay', regions: [first, second]});
    expect(layout.secondary.frame).toEqual(rect(0, 0, 100, 951));
    expect(layout.primary.frame).toEqual(rect(120, 0, 980, 951));
  });
});

describe('a division as tall as it is wide', () => {
  it('counts as a vertical line, so the views sit side by side', () => {
    const square: ReservedRegion = {kind: 'division', frame: rect(500, 400, 60, 60), margins: {top: 0, left: 0, bottom: 0, right: 0}, isActive: true};
    const layout = arrangementLayout({kind: 'split', axes: AXES.both, size: {width: 1000, height: 800}, origin: {x: 0, y: 0}, regions: [square], rtl: false});
    expect(layout.primary.splitAxis).toBe('horizontal');
  });
});

describe('a split with no room along the fold', () => {
  it('shows the primary view alone when the fold runs along an axis the split does not allow', () => {
    const layout = arrangementLayout(inPose('partlyFolded', 'split', 'vertical'));
    expect(layout.secondary.isHidden).toBe(true);
    expect(layout.primary.frame).toEqual(rect(0, 0, 1100, 951));
  });
});

describe('a window exactly as wide as it is tall', () => {
  it('stacks, since a split goes side by side only when wider than tall', () => {
    const layout = arrangementLayout({kind: 'split', axes: AXES.both, size: {width: 800, height: 800}, origin: {x: 0, y: 0}, regions: [], rtl: false});
    expect(layout.primary.splitAxis).toBe('vertical');
  });
});

describe('activeDivision and splitParts', () => {
  it('finds the active fold in the box’s own points and splits around it', () => {
    const {window, regions} = poses.partlyFolded;
    const division = activeDivision({size: window, origin: {x: 0, y: 0}, regions});
    expect(division).toEqual({frame: rect(530, 0, 40, 951), axis: 'horizontal'});
    expect(splitParts(window, 'horizontal', division, false)).toEqual([rect(0, 0, 530, 951), rect(570, 0, 530, 951)]);
  });

  it('ignores an inactive fold and splits in halves, the right part first in a right-to-left layout', () => {
    const {window, regions} = poses.openLandscape;
    expect(activeDivision({size: window, origin: {x: 0, y: 0}, regions})).toBeNull();
    expect(splitParts(window, 'horizontal', null, true)).toEqual([rect(550, 0, 550, 951), rect(0, 0, 550, 951)]);
  });

  it('moves the fold into a box that sits away from the root origin', () => {
    const {regions} = poses.partlyFolded;
    const division = activeDivision({size: {width: 600, height: 951}, origin: {x: 500, y: 0}, regions});
    expect(division?.frame).toEqual(rect(30, 0, 40, 951));
  });
});
