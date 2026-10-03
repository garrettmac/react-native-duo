/**
 * Mounts the native observer once, filling the root, and shares what it reports. Without the native view it shares
 * the window size, no regions and a null edge, and says so through `useDuo().source`.
 */
import { type ReactNode } from 'react';
export declare function DuoProvider({ children }: {
    children: ReactNode;
}): import("react").JSX.Element;
