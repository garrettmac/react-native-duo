import {act, fireEvent, render, screen} from '@testing-library/react-native';
import {useEffect, type ReactElement} from 'react';
import {StyleSheet, Text} from 'react-native';

import {ARRANGEMENT_PRIMARY_TESTID, ARRANGEMENT_SECONDARY_TESTID, ARRANGEMENT_TESTID, Arrangement} from '../Arrangement';
import {DuoTestProvider} from '../DuoTestProvider';
import {POSE_NAMES, type PoseName} from '../poses';
import type {ArrangementKind} from '../types';
import {AXES, OVERLAY, SPLIT, type AxesKey} from './helpers/arrangement-table';

const tables = {overlay: OVERLAY, split: SPLIT};
const axesKeys = Object.keys(AXES) as AxesKey[];

function frameOf(testID: string) {
  const style = StyleSheet.flatten(screen.getByTestId(testID, {includeHiddenElements: true}).props.style);
  return {x: style.left, y: style.top, width: style.width, height: style.height, zIndex: style.zIndex, display: style.display};
}

function arrangement(kind: ArrangementKind, axes: AxesKey) {
  return <Arrangement kind={kind} axes={AXES[axes]} primary={<Text>primary</Text>} secondary={<Text>secondary</Text>} />;
}

function inPose(pose: PoseName, element: ReactElement) {
  return <DuoTestProvider pose={pose}>{element}</DuoTestProvider>;
}

describe.each(['overlay', 'split'] as const)('<Arrangement kind="%s">', kind => {
  describe.each(POSE_NAMES)('in the %s pose', pose => {
    it.each(axesKeys)('places both views for axes %s', async axes => {
      const expected = tables[kind][pose][axes];
      await render(inPose(pose, arrangement(kind, axes)));

      const primary = frameOf(ARRANGEMENT_PRIMARY_TESTID);
      expect({x: primary.x, y: primary.y, width: primary.width, height: primary.height}).toEqual(expected.primary);
      expect(primary.zIndex).toBe(expected.primaryZ);
      expect(primary.display).toBe('flex');

      const secondary = frameOf(ARRANGEMENT_SECONDARY_TESTID);
      if (expected.secondary === 'hidden') {
        expect(secondary.display).toBe('none');
      } else {
        expect({x: secondary.x, y: secondary.y, width: secondary.width, height: secondary.height}).toEqual(expected.secondary);
        expect(secondary.display).toBe('flex');
      }
      expect(secondary.zIndex).toBe(expected.secondaryZ);
    });
  });
});

describe('<Arrangement> defaults', () => {
  it('allows both axes when none are given', async () => {
    await render(inPose('partlyFoldedTabletop', <Arrangement kind="overlay" primary={<Text>p</Text>} secondary={<Text>s</Text>} />));
    expect(frameOf(ARRANGEMENT_PRIMARY_TESTID)).toMatchObject({y: 570, height: 530});
  });

  it('takes one axis as a string', async () => {
    await render(inPose('partlyFolded', <Arrangement kind="split" axes="horizontal" primary={<Text>p</Text>} secondary={<Text>s</Text>} />));
    expect(frameOf(ARRANGEMENT_PRIMARY_TESTID)).toMatchObject({x: 0, width: 530});
  });

  it('fills its parent and takes a testID and a style', async () => {
    await render(
      inPose('phone', <Arrangement kind="overlay" testID="mine" style={{backgroundColor: 'red'}} primary={<Text>p</Text>} secondary={<Text>s</Text>} />),
    );
    expect(StyleSheet.flatten(screen.getByTestId('mine').props.style)).toMatchObject({flex: 1, backgroundColor: 'red'});
  });
});

describe('<Arrangement> content', () => {
  it('draws both views in every pose', async () => {
    for (const pose of POSE_NAMES) {
      const view = await render(inPose(pose, arrangement('split', 'both')));
      expect(screen.getByText('primary')).toBeOnTheScreen();
      expect(screen.getByText('secondary', {includeHiddenElements: true})).toBeTruthy();
      await view.unmount();
    }
  });
});

describe('<Arrangement> state', () => {
  it('keeps both views mounted when the phone folds and unfolds', async () => {
    const mounts = {primary: 0, secondary: 0};
    function Probe({name}: {name: 'primary' | 'secondary'}) {
      useEffect(() => {
        mounts[name] += 1;
      }, [name]);
      return <Text>{name}</Text>;
    }
    const tree = (pose: PoseName) => inPose(pose, <Arrangement kind="split" axes="horizontal" primary={<Probe name="primary" />} secondary={<Probe name="secondary" />} />);

    const view = await render(tree('openLandscape'));
    await view.rerender(tree('closed'));
    await view.rerender(tree('partlyFolded'));
    await view.rerender(tree('openPortrait'));
    expect(mounts).toEqual({primary: 1, secondary: 1});
  });
});

describe('<Arrangement> layout', () => {
  async function layOut(width: number, height: number) {
    await act(async () => {
      fireEvent(screen.getByTestId(ARRANGEMENT_TESTID), 'layout', {nativeEvent: {layout: {x: 0, y: 0, width, height}}});
    });
  }

  it('splits the space it was given, not the window', async () => {
    await render(inPose('phone', arrangement('split', 'both')));
    expect(frameOf(ARRANGEMENT_PRIMARY_TESTID)).toMatchObject({width: 390, height: 422});
    await layOut(300, 200);
    expect(frameOf(ARRANGEMENT_PRIMARY_TESTID)).toMatchObject({x: 0, y: 0, width: 150, height: 200});
    expect(frameOf(ARRANGEMENT_SECONDARY_TESTID)).toMatchObject({x: 150, y: 0, width: 150, height: 200});
  });

  it('stacks again once what it was given is taller than wide', async () => {
    await render(inPose('phone', arrangement('split', 'both')));
    await layOut(300, 200);
    await layOut(300, 600);
    expect(frameOf(ARRANGEMENT_PRIMARY_TESTID)).toMatchObject({x: 0, y: 0, width: 300, height: 300});
    expect(frameOf(ARRANGEMENT_SECONDARY_TESTID)).toMatchObject({x: 0, y: 300, width: 300, height: 300});
  });
});
