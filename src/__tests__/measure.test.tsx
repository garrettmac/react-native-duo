import {I18nManager} from 'react-native';

import {placedFrame} from '../measure';

const frame = {x: 570, y: 0, width: 530, height: 951};

afterEach(() => {
  jest.restoreAllMocks();
});

describe('placedFrame', () => {
  it('places a frame from the left in a left-to-right layout', () => {
    expect(placedFrame(frame)).toEqual({position: 'absolute', left: 570, top: 0, width: 530, height: 951});
  });

  it('says right in a right-to-left layout that swaps sides, so the frame still lands at its physical x', () => {
    jest.replaceProperty(I18nManager, 'isRTL', true);
    jest.spyOn(I18nManager, 'getConstants').mockReturnValue({...I18nManager.getConstants(), doLeftAndRightSwapInRTL: true});
    expect(placedFrame(frame)).toEqual({position: 'absolute', right: 570, top: 0, width: 530, height: 951});
  });

  it('keeps left in a right-to-left layout that does not swap sides', () => {
    jest.replaceProperty(I18nManager, 'isRTL', true);
    jest.spyOn(I18nManager, 'getConstants').mockReturnValue({...I18nManager.getConstants(), doLeftAndRightSwapInRTL: false});
    expect(placedFrame(frame)).toEqual({position: 'absolute', left: 570, top: 0, width: 530, height: 951});
  });
});
