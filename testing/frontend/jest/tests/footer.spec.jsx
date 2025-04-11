import { render } from '@testing-library/react';
import Footer from '../../../../frontend/components/lib/ui/footer.jsx'

//good example of a simple snapshot test
it('should render as expected and match the snapshot', () => {
    const { container } = render(<Footer />);
    expect(container.firstChild).toMatchSnapshot();
}); 
