/** Everything the package reads about the pose, live. */
import {useCameraDirections, useDuo, useFold, usePane, useSplitWindow} from '@garrettmacmac/react-native-duo';

import {Body, Card, Page, Row, Title} from '../components';

export function PoseScreen() {
  const duo = useDuo();
  const pane = usePane();
  const fold = useFold();
  const split = useSplitWindow();
  const cameras = useCameraDirections();
  const active = duo.regions.filter(region => region.isActive);

  return (
    <Page>
      <Card>
        <Title>The pose</Title>
        <Row label="Source" value={duo.source === 'native' ? 'native' : 'window (no native module)'} />
        <Row label="Window" value={`${Math.round(duo.window.width)} x ${Math.round(duo.window.height)}`} />
        <Row label="Size class" value={`${duo.sizeClass.horizontal} wide, ${duo.sizeClass.vertical} tall`} />
        <Row label="Bars stand on" value={duo.verticalBarEdge ?? 'nowhere (horizontal bars)'} />
        <Row label="Two panes" value={split ? 'yes' : 'no'} />
      </Card>
      <Card>
        <Title>Reserved regions</Title>
        <Row label="Fold" value={fold ? `active, divides ${fold.axis === 'horizontal' ? 'left and right' : 'top and bottom'}` : 'none active'} />
        <Row label="Active regions" value={String(active.length)} />
        <Row label="All regions" value={String(duo.regions.length)} />
        <Body muted>Red is the fold and amber the cameras; dashed regions are inactive.</Body>
      </Card>
      <Card>
        <Title>This pane</Title>
        <Row label="Size" value={`${Math.round(pane.width)} x ${Math.round(pane.height)}`} />
        <Row label="Side" value={pane.side} />
      </Card>
      <Card>
        <Title>Cameras facing you</Title>
        {cameras.source === 'unavailable' ? (
          <Body muted>Camera directions need iOS 27.1 and a development build.</Body>
        ) : (
          cameras.forward.map(camera => <Row key={camera.uniqueID} label={camera.localizedName} value={camera.position} />)
        )}
      </Card>
    </Page>
  );
}
