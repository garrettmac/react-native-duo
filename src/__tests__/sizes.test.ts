import {REGULAR_HEIGHT_MIN_DP, REGULAR_WIDTH_MIN_DP, sizeClassFromWindow} from '../sizes';

describe('sizeClassFromWindow', () => {
  it('pins the Android window size class cut-offs', () => {
    expect(REGULAR_WIDTH_MIN_DP).toBe(600);
    expect(REGULAR_HEIGHT_MIN_DP).toBe(480);
  });

  it('is compact below 600 wide and regular from 600', () => {
    expect(sizeClassFromWindow({width: 599.9, height: 800}).horizontal).toBe('compact');
    expect(sizeClassFromWindow({width: 600, height: 800}).horizontal).toBe('regular');
  });

  it('is compact below 480 tall and regular from 480', () => {
    expect(sizeClassFromWindow({width: 800, height: 479.9}).vertical).toBe('compact');
    expect(sizeClassFromWindow({width: 800, height: 480}).vertical).toBe('regular');
  });

  it('reads a phone held upright, a phone on its side and a tablet', () => {
    expect(sizeClassFromWindow({width: 390, height: 844})).toEqual({horizontal: 'compact', vertical: 'regular'});
    expect(sizeClassFromWindow({width: 844, height: 390})).toEqual({horizontal: 'regular', vertical: 'compact'});
    expect(sizeClassFromWindow({width: 1024, height: 1366})).toEqual({horizontal: 'regular', vertical: 'regular'});
  });
});
