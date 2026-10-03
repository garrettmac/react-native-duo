/**
 * A layer above the page for what covers the whole window, such as a custom sheet. Mounted where it is opened, a
 * sheet sits inside `DuoPage`'s content, and the side strip, drawn after the content, covers the controls the sheet
 * stands on the same edge. `DuoOverlay` draws its children in the nearest `DuoOverlayHost` instead, after everything
 * the host wraps, while staying in the React tree (so it stays inside a simulated device frame, unlike a `Modal`).
 */
import { type ReactNode } from 'react';
export declare const DUO_OVERLAY_TESTID = "duo-overlay";
/**
 * Wrap the app's screens in one, inside `DuoProvider`. Overlays read context from here, not from where they are
 * opened: put providers they need above the host.
 */
export declare function DuoOverlayHost({ children }: {
    children: ReactNode;
}): import("react").JSX.Element;
/** Draws its children above the page, in the nearest `DuoOverlayHost`. Without one it throws. */
export declare function DuoOverlay({ children }: {
    children: ReactNode;
}): null;
