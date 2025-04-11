import { render } from '@testing-library/react';
import Tile from '../../../../frontend/components/utils/tile.jsx';

it('should render as expected and match the snapshot', () => {
    const { container } = render(<Tile />);
    expect(container.firstChild).toMatchSnapshot();
});

//css files for branch coverage ideally we should re write the component
it('should render as expected and match the snapshot', () => {
    const { container } = render(<Tile title="Invite Your Collaborators" subtitle="this is a subtitle" grow default_padding={false} bg_color verticallyCenter default_margin={false} fullHeight overflowX extracss></Tile>);
    expect(container.firstChild).toMatchSnapshot();
}); 
