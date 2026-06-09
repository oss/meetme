import uniqid from 'uniqid';
import { useNavigate } from 'react-router-dom';

function NavDropdown({
    image,
    showMenu,
    items,
    onMouseDown,
    onMouseLeave,
    onUserSelect = () => {},
    cssString = '',
}) {
    const navigate = useNavigate();
    return (
        <div
            onMouseLeave={onMouseLeave}
            className="rounded-md hover:bg-gray-100 transition-all duration-150 p-1"
        >
            <div
                onMouseDown={() => {
                    onMouseDown();
                }}
            >
                <div className={cssString}>
                    <div className="flex items-center p-1 hover:cursor-pointer">
                        {image}
                    </div>
                </div>
            </div>
            {
                <div
                    className={`z-10 absolute right-0 w-auto text-left 
          ${showMenu ? 'scale-100' : 'scale-0'} 
        z-50 origin-top transition-all ease-linear duration-75`}
                >
                    <ul
                        className={`block float-left w-full p-3 list-none bg-white rounded-lg whitespace-nowrap`}
                    >
                        {items.map((dropdown_entry) => (
                            <li
                                key={uniqid()}
                                onClick={() => {
                                    onUserSelect();
                                    navigate(dropdown_entry.url);
                                }}
                                className="hover:cursor-pointer duration-100 transition-all hover:text-gray-400 p-1"
                            >
                                {dropdown_entry.text}
                            </li>
                        ))}
                    </ul>
                </div>
            }
        </div>
    );
}

export default NavDropdown;
