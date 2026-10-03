/**
 * A screen's bars, wherever the pose puts them. On a phone, an iPad or any window the system keeps bars horizontal,
 * `DuoPage` is a plain column: the top bar, the content, the bottom bar, exactly as you pass them. Where the system
 * stands bars on the side (the closed iPhone Duo, open in landscape, the pane against the window's edge), the same
 * bars move into one vertical strip on that edge: the top bar's controls at the top, the bottom bar's at the bottom.
 * A page inside a pane that does not touch the edge keeps its bars horizontal at the top of its pane, and a page
 * inside a pane that does gives its bars to the strip of the page around it, so a window has one strip per edge.
 */
import {createContext, useContext, useEffect, useId, useMemo, useState, type ReactNode} from 'react';
import {I18nManager, StyleSheet, View, type StyleProp, type ViewStyle} from 'react-native';

import {useCameraClearance} from './clearance';
import {useDuo} from './context';
import {useArrangementBox} from './measure';
import {PageContext, touchesEdge, type PageMode, type PagePlacement} from './page-context';
import {PaneProvider, usePane, type Pane} from './pane';
import type {Rect, VerticalBarEdge} from './types';

export type BarPosition = 'top' | 'bottom' | 'side';

/** Where a bar is being drawn: `vertical` is true when it stands in the side strip. */
export interface BarPlacement {
  position: BarPosition;
  vertical: boolean;
  edge: VerticalBarEdge;
}

/** A bar: an element, or a function of where it is drawn so one component can lay itself out either way. */
export type BarSlot = ReactNode | ((placement: BarPlacement) => ReactNode);

export interface DuoPageProps {
  children: ReactNode;
  /** The navigation bar or top toolbar. Back or Close first, then the prominent action. */
  topBar?: BarSlot;
  /** The tab bar or bottom toolbar. */
  bottomBar?: BarSlot;
  /** Drawn in the strip instead of `topBar` when bars stand on the side. */
  sideTopBar?: BarSlot;
  /** Drawn in the strip instead of `bottomBar` when bars stand on the side. */
  sideBottomBar?: BarSlot;
  /** The page: on a phone, the column the three parts sit in. */
  style?: StyleProp<ViewStyle>;
  /** The strip, when bars stand on the side: its width, background, border and padding. */
  sideStyle?: StyleProp<ViewStyle>;
  /** The view the content sits in. */
  contentStyle?: StyleProp<ViewStyle>;
  /** Wraps the top bar on a phone (none when left out, so the bar renders exactly as passed). */
  topBarStyle?: StyleProp<ViewStyle>;
  /** Wraps the bottom bar on a phone (none when left out). */
  bottomBarStyle?: StyleProp<ViewStyle>;
  /** Points the strip keeps free at its top. Defaults to the camera's clearance there. */
  sideInsetTop?: number;
  /** Points the strip keeps free at its bottom, where the closed iPhone Duo's camera sits in landscape. Defaults to the camera's clearance there. */
  sideInsetBottom?: number;
  /** Draws the whole strip yourself; it receives what would go in it, this page's and any nested page's. */
  renderSide?: (side: SideParts) => ReactNode;
  /** `auto` (the default) follows the pose; `horizontal` or `side` forces one. */
  mode?: 'auto' | 'horizontal' | 'side';
  /** False keeps a nested page's bars in its own pane instead of the strip around it. Default true. */
  shareSide?: boolean;
  /** Called when the page moves its bars between horizontal, its own strip and the one around it. */
  onModeChange?: (mode: PageMode) => void;
  testID?: string;
}

/** What goes in the strip, top to bottom: nested pages' top bars, this page's, then the bottom bars. */
export interface SideParts {
  edge: 'leading' | 'trailing';
  top: ReactNode[];
  bottom: ReactNode[];
  insetTop: number;
  insetBottom: number;
}

interface Contribution {
  top: ReactNode;
  bottom: ReactNode;
}

interface Host {
  edge: 'leading' | 'trailing';
  frame: Rect;
  contribute: (id: string, contribution: Contribution | null) => void;
}

const HostContext = createContext<Host | null>(null);

export {touchesEdge};
export type {PageMode, PagePlacement};

export const DUO_PAGE_TESTID = 'duo-page';
export const DUO_PAGE_STRIP_TESTID = 'duo-page-strip';
export const DUO_PAGE_CONTENT_TESTID = 'duo-page-content';

/** The decision `DuoPage` makes: hand bars to the strip around it, stand its own, or keep them in place. */
export function pageMode({edge, pane, window, host, rtl}: {edge: VerticalBarEdge; pane: Rect; window: Rect; host: Pick<Host, 'edge' | 'frame'> | null; rtl: boolean}): PageMode {
  if (host) return touchesEdge(pane, host.frame, host.edge, rtl) ? 'hosted' : 'horizontal';
  if (edge !== null && touchesEdge(pane, window, edge, rtl)) return 'side';
  return 'horizontal';
}

function wrap(node: ReactNode, style: StyleProp<ViewStyle> | undefined): ReactNode {
  return style && node !== null ? <View style={style}>{node}</View> : node;
}

function draw(slot: BarSlot | undefined, placement: BarPlacement): ReactNode {
  return typeof slot === 'function' ? slot(placement) : (slot ?? null);
}

/** Where the page this component is in draws its bars. Draw the title in the content when `vertical`. */
export function usePage(): PagePlacement {
  return useContext(PageContext) ?? HORIZONTAL;
}

const HORIZONTAL: PagePlacement = {mode: 'horizontal', vertical: false, edge: null};

export function DuoPage({
  children,
  topBar,
  bottomBar,
  sideTopBar,
  sideBottomBar,
  style,
  sideStyle,
  contentStyle,
  topBarStyle,
  bottomBarStyle,
  sideInsetTop,
  sideInsetBottom,
  renderSide,
  mode: forced = 'auto',
  shareSide = true,
  onModeChange,
  testID = DUO_PAGE_TESTID,
}: DuoPageProps) {
  const outerHost = useContext(HostContext);
  const host = shareSide ? outerHost : null;
  const state = useDuo();
  const pane = usePane();
  const rtl = I18nManager.isRTL;
  const window = {x: 0, y: 0, width: state.window.width, height: state.window.height};
  const automatic = pane.hidden ? 'horizontal' : pageMode({edge: state.verticalBarEdge, pane, window, host, rtl});
  const mode: PageMode = forced === 'auto' ? automatic : forced === 'horizontal' ? 'horizontal' : automatic === 'hosted' ? 'hosted' : 'side';
  const edge = mode === 'side' ? (state.verticalBarEdge ?? 'trailing') : mode === 'hosted' ? host!.edge : null;
  const vertical = mode !== 'horizontal';
  const placement = useMemo<PagePlacement>(() => ({mode, vertical, edge}), [mode, vertical, edge]);

  const sideTop = draw(sideTopBar ?? topBar, {position: 'side', vertical: true, edge});
  const sideBottom = draw(sideBottomBar ?? bottomBar, {position: 'side', vertical: true, edge});

  useEffect(() => {
    onModeChange?.(mode);
  }, [mode, onModeChange]);

  const id = useId();
  useEffect(() => {
    if (mode !== 'hosted' || !host) return;
    host.contribute(id, {top: sideTop, bottom: sideBottom});
  });
  useEffect(() => {
    if (mode !== 'hosted' || !host) return;
    return () => host.contribute(id, null);
  }, [mode, host, id]);

  const content = (
    <Content pane={pane} style={contentStyle} host={mode === 'side' && edge ? edge : null} hostFrame={host && mode === 'hosted' ? host : null}>
      {children}
    </Content>
  );

  if (mode === 'horizontal') {
    return (
      <PageContext.Provider value={placement}>
        <View testID={testID} style={[styles.column, style]}>
          {wrap(draw(topBar, {position: 'top', vertical: false, edge: null}), topBarStyle)}
          {content}
          {wrap(draw(bottomBar, {position: 'bottom', vertical: false, edge: null}), bottomBarStyle)}
        </View>
      </PageContext.Provider>
    );
  }

  if (mode === 'hosted') {
    return (
      <PageContext.Provider value={placement}>
        <View testID={testID} style={[styles.column, style]}>
          {content}
        </View>
      </PageContext.Provider>
    );
  }

  return (
    <PageContext.Provider value={placement}>
      <SideHost edge={edge!} testID={testID} style={style} sideStyle={sideStyle} insetTop={sideInsetTop} insetBottom={sideInsetBottom} renderSide={renderSide} top={sideTop} bottom={sideBottom}>
        {content}
      </SideHost>
    </PageContext.Provider>
  );
}

const StripContext = createContext<((id: string, contribution: Contribution | null) => void) | null>(null);

interface SideHostProps {
  edge: 'leading' | 'trailing';
  testID: string;
  style?: StyleProp<ViewStyle>;
  sideStyle?: StyleProp<ViewStyle>;
  insetTop?: number;
  insetBottom?: number;
  renderSide?: (side: SideParts) => ReactNode;
  top: ReactNode;
  bottom: ReactNode;
  children: ReactNode;
}

function SideHost({edge, testID, style, sideStyle, insetTop, insetBottom, renderSide, top, bottom, children}: SideHostProps) {
  const [contributions, setContributions] = useState<ReadonlyMap<string, Contribution>>(new Map());
  const clearance = useCameraClearance();
  const contribute = useMemo(
    () => (id: string, contribution: Contribution | null) =>
      setContributions(previous => {
        const next = new Map(previous);
        if (contribution) next.set(id, contribution);
        else next.delete(id);
        return next;
      }),
    [],
  );
  const hosted = [...contributions.entries()];
  const parts: SideParts = {
    edge,
    top: [...hosted.map(([id, contribution]) => <View key={id}>{contribution.top}</View>), <View key="own">{top}</View>],
    bottom: [...hosted.map(([id, contribution]) => <View key={id}>{contribution.bottom}</View>), <View key="own">{bottom}</View>],
    insetTop: insetTop ?? clearance.top,
    insetBottom: insetBottom ?? clearance.bottom,
  };
  const strip = renderSide ? (
    renderSide(parts)
  ) : (
    <View testID={DUO_PAGE_STRIP_TESTID} style={[styles.strip, {paddingTop: parts.insetTop}, sideStyle, parts.insetBottom > 0 && {paddingBottom: parts.insetBottom}]}>
      {parts.top}
      <View style={styles.fill} />
      {parts.bottom}
    </View>
  );
  return (
    <StripContext.Provider value={contribute}>
      <View testID={testID} style={[styles.row, style]}>
        {edge === 'leading' ? strip : null}
        {children}
        {edge === 'trailing' ? strip : null}
      </View>
    </StripContext.Provider>
  );
}

function Content({pane, style, host, hostFrame, children}: {pane: Pane; style?: StyleProp<ViewStyle>; host: 'leading' | 'trailing' | null; hostFrame: Host | null; children: ReactNode}) {
  const {ref, onLayout, size, origin} = useArrangementBox();
  const contribute = useContext(StripContext);
  const inner: Pane = size ? {...pane, x: origin.x, y: origin.y, width: size.width, height: size.height} : pane;
  const nextHost = useMemo<Host | null>(() => {
    if (hostFrame) return hostFrame;
    if (host && contribute) return {edge: host, frame: {x: inner.x, y: inner.y, width: inner.width, height: inner.height}, contribute};
    return null;
  }, [hostFrame, host, contribute, inner.x, inner.y, inner.width, inner.height]);
  return (
    <HostContext.Provider value={nextHost}>
      <PaneProvider pane={inner}>
        <View ref={ref} onLayout={onLayout} testID={DUO_PAGE_CONTENT_TESTID} style={[styles.fill, style]}>
          {children}
        </View>
      </PaneProvider>
    </HostContext.Provider>
  );
}

const styles = StyleSheet.create({
  fill: {flex: 1},
  column: {flex: 1},
  row: {flex: 1, flexDirection: 'row'},
  strip: {alignItems: 'center'},
});
