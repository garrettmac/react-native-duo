/**
 * A layer above the page for what covers the whole window, such as a custom sheet. Mounted where it is opened, a
 * sheet sits inside `DuoPage`'s content, and the side strip, drawn after the content, covers the controls the sheet
 * stands on the same edge. `DuoOverlay` draws its children in the nearest `DuoOverlayHost` instead, after everything
 * the host wraps, while staying in the React tree (so it stays inside a simulated device frame, unlike a `Modal`).
 */
import {createContext, useContext, useId, useLayoutEffect, useState, type ReactNode} from 'react';
import {StyleSheet, View} from 'react-native';

export const DUO_OVERLAY_TESTID = 'duo-overlay';

type Place = (id: string, node: ReactNode | null) => void;

const OverlayContext = createContext<Place | null>(null);

/**
 * Wrap the app's screens in one, inside `DuoProvider`. Overlays read context from here, not from where they are
 * opened: put providers they need above the host.
 */
export function DuoOverlayHost({children}: {children: ReactNode}) {
  const [layers, setLayers] = useState<ReadonlyArray<readonly [string, ReactNode]>>([]);
  const [place] = useState<Place>(() => (id: string, node: ReactNode | null) =>
    setLayers(current => {
      if (node === null) return current.filter(([key]) => key !== id);
      const at = current.findIndex(([key]) => key === id);
      return at === -1 ? [...current, [id, node] as const] : current.map((layer, index) => (index === at ? ([id, node] as const) : layer));
    }),
  );
  return (
    <OverlayContext.Provider value={place}>
      {children}
      {layers.length > 0 ? (
        <View testID={DUO_OVERLAY_TESTID} pointerEvents="box-none" style={StyleSheet.absoluteFill}>
          {layers.map(([id, node]) => (
            <View key={id} pointerEvents="box-none" style={StyleSheet.absoluteFill}>
              {node}
            </View>
          ))}
        </View>
      ) : null}
    </OverlayContext.Provider>
  );
}

/** Draws its children above the page, in the nearest `DuoOverlayHost`. Without one it throws. */
export function DuoOverlay({children}: {children: ReactNode}) {
  const place = useContext(OverlayContext);
  if (place === null) throw new Error('DuoOverlay needs a DuoOverlayHost above it.');
  const id = useId();
  useLayoutEffect(() => {
    place(id, children);
  }, [place, id, children]);
  useLayoutEffect(() => () => place(id, null), [place, id]);
  return null;
}
