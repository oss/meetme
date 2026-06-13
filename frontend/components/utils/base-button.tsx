import { forwardRef } from "react";

function BaseButton({ children, className='', ...rest}, ref) {
    return (
        <button type="button"
            className={`rounded-lg text-center font-normal text-sm ${className} `}
            {...rest}
            ref={ref}
        >
            {children}
        </button>
    );
}

export default forwardRef(BaseButton);
