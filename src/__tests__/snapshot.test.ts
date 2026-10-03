import {parseSnapshot} from '../snapshot';

const region = {
  kind: 'division',
  frame: {x: 530, y: 0, width: 40, height: 951},
  margins: {top: 0, left: 10, bottom: 0, right: 10},
  isActive: true,
};

const valid = {sizeClass: {horizontal: 'regular', vertical: 'compact'}, verticalBarEdge: 'trailing', regions: [region]};

describe('parseSnapshot', () => {
  it('reads a whole payload', () => {
    expect(parseSnapshot(valid)).toEqual(valid);
  });

  it('reads a null or missing bar edge as null', () => {
    expect(parseSnapshot({...valid, verticalBarEdge: null})?.verticalBarEdge).toBeNull();
    const {verticalBarEdge: _omitted, ...withoutEdge} = valid;
    expect(parseSnapshot(withoutEdge)?.verticalBarEdge).toBeNull();
  });

  it('reads an empty region list', () => {
    expect(parseSnapshot({...valid, regions: []})?.regions).toEqual([]);
  });

  it('drops fields it does not know', () => {
    expect(parseSnapshot({...valid, extra: 1, regions: [{...region, id: 'x'}]})).toEqual(valid);
  });

  it.each([
    ['null', null],
    ['a string', 'x'],
    ['an array', []],
    ['no size class', {...valid, sizeClass: undefined}],
    ['a size class with a bad value', {...valid, sizeClass: {horizontal: 'wide', vertical: 'compact'}}],
    ['a size class missing a side', {...valid, sizeClass: {horizontal: 'regular'}}],
    ['a bar edge that is not an edge', {...valid, verticalBarEdge: 'top'}],
    ['regions that are not a list', {...valid, regions: {}}],
    ['a region of an unknown kind', {...valid, regions: [{...region, kind: 'hinge'}]}],
    ['a region with no active flag', {...valid, regions: [{...region, isActive: undefined}]}],
    ['a region with a text frame value', {...valid, regions: [{...region, frame: {...region.frame, x: '5'}}]}],
    ['a region with a non-finite frame value', {...valid, regions: [{...region, frame: {...region.frame, width: Infinity}}]}],
    ['a region with no margins', {...valid, regions: [{...region, margins: undefined}]}],
    ['a region with a missing margin', {...valid, regions: [{...region, margins: {top: 0, left: 0, bottom: 0}}]}],
    ['one bad region among good ones', {...valid, regions: [region, {...region, kind: 'x'}]}],
    ['a region that is not an object', {...valid, regions: [3]}],
  ])('refuses %s', (_label, payload) => {
    expect(parseSnapshot(payload)).toBeNull();
  });
});
