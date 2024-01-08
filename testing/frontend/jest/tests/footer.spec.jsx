import renderer from 'react-test-renderer';
import Footer from '../../../../frontend/components/footer.jsx'

//good example of a simple snapshot test
it('should render as expected and match the snapshot', () => {
    const container = renderer.create(<Footer />);
    expect(container).toMatchSnapshot();
}); 