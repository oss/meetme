import renderer from 'react-test-renderer';
import Tile from '../../../../frontend/components/utils/tile.jsx';

it('should render as expected and match the snapshot', () => {
    const container = renderer.create(<Tile />);
    expect(container).toMatchSnapshot();
});

//css files for branch coverage ideally we should re write the component
it('should render as expected and match the snapshot', () => {
    const container = renderer.create(<Tile title="Invite Your Collaborators" subtitle="this is a subtitle" grow default_padding={false} bg_color verticallyCenter default_margin={false} fullHeight overflowX extracss></Tile>);
    expect(container).toMatchSnapshot();
}); 
