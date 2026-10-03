/** Every advanced case, in the order the Cases tab lists them; `?case=<key>` opens one directly on the web. */
import type {ComponentType} from 'react';

import {CalendarCase} from './CalendarCase';
import {CameraCase} from './CameraCase';
import {CanvasCase} from './CanvasCase';
import {ChatCase} from './ChatCase';
import {FilesCase} from './FilesCase';
import {MusicCase} from './MusicCase';
import {PhotosCase} from './PhotosCase';
import {SettingsCase} from './SettingsCase';
import type {CaseProps} from './shared';
import {TranslateCase} from './TranslateCase';
import {VideoCase} from './VideoCase';

export interface Case {
  key: string;
  title: string;
  api: string;
  Component: ComponentType<CaseProps>;
}

export const CASES: Case[] = [
  {key: 'calendar', title: 'Calendar', api: 'sideTopBar, sideBottomBar', Component: CalendarCase},
  {key: 'music', title: 'Music', api: 'renderSide', Component: MusicCase},
  {key: 'canvas', title: 'Canvas', api: 'mode="side", onModeChange', Component: CanvasCase},
  {key: 'chat', title: 'Chat', api: 'shareSide={false}', Component: ChatCase},
  {key: 'photos', title: 'Photos', api: 'DuoBar part, renderOverflow, styles', Component: PhotosCase},
  {key: 'settings', title: 'Settings', api: 'DetailStack renderStack, popToRoot', Component: SettingsCase},
  {key: 'files', title: 'Files', api: 'PaneLayout sidebar width and styles', Component: FilesCase},
  {key: 'translate', title: 'Translate', api: 'PaneLayout side-by-side', Component: TranslateCase},
  {key: 'camera', title: 'Camera', api: 'useBarInsets, useCameraDirections', Component: CameraCase},
  {key: 'video', title: 'Video', api: 'mode="horizontal", Arrangement', Component: VideoCase},
];

export type {CaseProps};
