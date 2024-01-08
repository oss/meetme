import '../../index.css';

function Button({
    text,
    paddingX = 2,
    paddingY = 2,
    red = false,
    fullWidth = false,
    click_passthrough,
    rounded = 'rounded-lg',
}) {
    return (
        <button
            type="button"
            className={`${red ? 'bg-red-500' : 'bg-white'}
          ${red ? 'text-white' : 'text-gray-600'}
          ${red ? 'border-red-500' : 'border-gray-400'}
          ${red ? 'hover:bg-red-600' : 'hover:bg-gray-200'}
          ${` px-${paddingX} `}
          ${` py-${paddingY} `}
          ${fullWidth ? 'w-full' : ''}
          text-center
          ${' ' + rounded + ' '} font-normal text-sm
          transition-colors duration-200
          my-2 border`}
            onClick={click_passthrough}
        >
            {text}
        </button>
    );
}
export default Button;
