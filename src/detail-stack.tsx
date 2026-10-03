/**
 * The trailing pane's own navigation, the way a split view keeps it. The list stays in the leading pane; the item it
 * opened, and anything you open from there, stack in the trailing pane. Back pops within the stack; on the first
 * screen it leaves the detail (`onExit`), which on a phone or the closed iPhone Duo returns to the list. Every screen
 * stays mounted under the one on top, so folding and unfolding keep scroll and typed text.
 */
import {createContext, useCallback, useContext, useMemo, useState, type ReactNode} from 'react';
import {StyleSheet, View, type StyleProp, type ViewStyle} from 'react-native';

import {PaneProvider, usePane} from './pane';

export interface DetailStackScreen {
  key: string;
  element: ReactNode;
}

export interface DetailStackValue {
  /** 1 on the first screen, the item the list opened. */
  depth: number;
  push: (element: ReactNode, key?: string) => void;
  /** Pops a screen; on the first one, leaves the detail. */
  back: () => void;
  /** Back to the first screen. */
  popToRoot: () => void;
  /**
   * Whether to draw a Back control: below the first screen always; on the first screen only when the list is not
   * beside it (a phone, the closed iPhone Duo, a compact split).
   */
  showBack: boolean;
  /** True when the list is beside this stack. */
  besideList: boolean;
}

export interface DetailStackProps {
  /** The first screen: the item the list opened. Give the stack a `key` per item so picking another starts over. */
  children: ReactNode;
  /** Back on the first screen: clear the selection so the list shows again. */
  onExit?: () => void;
  /** The view each screen sits in. */
  screenStyle?: StyleProp<ViewStyle>;
  /** Overrides the rule for drawing Back on the first screen. */
  showBackOnRoot?: boolean;
  /**
   * Draws the stack yourself, for a transition or a navigator of your own. Each screen's element already tells the
   * screens under the top one that their pane is hidden, so their bars stay out of the side strip; hide them yourself.
   */
  renderStack?: (screens: DetailStackScreen[], top: number) => ReactNode;
  /**
   * The screens above the first, bottom to top, when your own state keeps the stack (a reducer, a router). The stack
   * then shows these, and `push`, `back` and `popToRoot` ask `onPush`, `onBack` and `onPopToRoot` instead of
   * changing anything themselves; one you leave out does nothing. Pass `screens` for the stack's whole life.
   */
  screens?: DetailStackScreen[];
  /** With `screens`: Back above the first screen. Pop the top one. */
  onBack?: () => void;
  /** With `screens`: a screen asked to push `element`. */
  onPush?: (element: ReactNode, key?: string) => void;
  /** With `screens`: a screen asked to go back to the first. */
  onPopToRoot?: () => void;
  testID?: string;
}

const NO_STACK: DetailStackValue = {depth: 1, push: () => {}, back: () => {}, popToRoot: () => {}, showBack: false, besideList: false};

const DetailStackContext = createContext<DetailStackValue>(NO_STACK);

export const DETAIL_STACK_TESTID = 'duo-detail-stack';

/** The detail stack this screen is in; outside one, a single screen with no Back. */
export function useDetailStack(): DetailStackValue {
  return useContext(DetailStackContext);
}

/** Whether a stack screen at `depth` shows Back: always below the first, and on the first only without the list beside it. */
export function detailShowsBack(depth: number, besideList: boolean): boolean {
  return depth > 1 || !besideList;
}

let nextKey = 0;

export function DetailStack({
  children,
  onExit,
  screenStyle,
  showBackOnRoot,
  renderStack,
  screens: controlled,
  onBack,
  onPush,
  onPopToRoot,
  testID = DETAIL_STACK_TESTID,
}: DetailStackProps) {
  const [own, setOwn] = useState<DetailStackScreen[]>([]);
  if (__DEV__ && controlled !== undefined && onBack === undefined) {
    console.warn('react-native-duo: a DetailStack given `screens` needs `onBack`, or Back above the first screen does nothing');
  }
  const pushed = controlled ?? own;
  const isControlled = controlled !== undefined;
  const pane = usePane();
  const besideList = pane.split;

  const push = useCallback(
    (element: ReactNode, key?: string) => {
      if (isControlled) onPush?.(element, key);
      else setOwn(previous => [...previous, {key: key ?? `screen-${nextKey++}`, element}]);
    },
    [isControlled, onPush],
  );
  const back = useCallback(() => {
    if (pushed.length === 0) onExit?.();
    else if (isControlled) onBack?.();
    else setOwn(previous => previous.slice(0, -1));
  }, [pushed.length, isControlled, onBack, onExit]);
  const popToRoot = useCallback(() => {
    if (isControlled) onPopToRoot?.();
    else setOwn([]);
  }, [isControlled, onPopToRoot]);

  const depth = pushed.length + 1;
  const showBack = depth === 1 && showBackOnRoot !== undefined ? showBackOnRoot : detailShowsBack(depth, besideList);
  const value = useMemo<DetailStackValue>(() => ({depth, push, back, popToRoot, showBack, besideList}), [depth, push, back, popToRoot, showBack, besideList]);

  const covered = useMemo(() => ({...pane, hidden: true}), [pane]);
  const screens: DetailStackScreen[] = [{key: 'root', element: children}, ...pushed].map((screen, index, all) => ({
    key: screen.key,
    element: <PaneProvider pane={index < all.length - 1 ? covered : pane}>{screen.element}</PaneProvider>,
  }));
  const top = screens.length - 1;

  return (
    <DetailStackContext.Provider value={value}>
      {renderStack ? (
        renderStack(screens, top)
      ) : (
        <View testID={testID} style={styles.fill}>
          {screens.map((screen, index) => (
            <View key={screen.key} style={[styles.fill, screenStyle, index < top && styles.hidden]}>
              {screen.element}
            </View>
          ))}
        </View>
      )}
    </DetailStackContext.Provider>
  );
}

const styles = StyleSheet.create({
  fill: {flex: 1},
  hidden: {display: 'none'},
});
