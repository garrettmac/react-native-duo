import {renderHook} from '@testing-library/react-native';
import type {ReactNode} from 'react';

import {DuoTestProvider} from '../../DuoTestProvider';
import type {PoseName} from '../../poses';

export function renderInPose<T>(pose: PoseName, hook: () => T) {
  const wrapper = ({children}: {children: ReactNode}) => <DuoTestProvider pose={pose}>{children}</DuoTestProvider>;
  return renderHook(hook, {wrapper});
}
