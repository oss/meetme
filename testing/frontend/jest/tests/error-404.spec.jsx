import { render } from '@testing-library/react';
import Error404 from '../../../../frontend/pages/error-404.jsx';


it('should render as expected and match the snapshot', () => {
    const { container } = render(<Error404 />);
    expect(container.firstChild).toMatchSnapshot();
}); 
