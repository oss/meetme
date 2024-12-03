import { forwardRef } from "react";
import BaseButton from "./base-button";
function RedButton({ children, className='', ...rest }, ref) {
    return (
        <BaseButton 
            className={`bg-rutgers_red hover:bg-red-600 text-white transition-colors duration-200 py-1 px-1 border ${className}`}
            {...rest}
            ref={ref}
        >
            {children}
        </BaseButton>
    );
}

export default forwardRef(RedButton);
