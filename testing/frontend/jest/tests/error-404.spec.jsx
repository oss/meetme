import Error404 from '../../../../frontend/pages/error-404.jsx';
import renderer from 'react-test-renderer';


it('should render as expected and match the snapshot', () => {
    const container = renderer.create(<Error404 />);
    expect(container).toMatchSnapshot();
}); 
