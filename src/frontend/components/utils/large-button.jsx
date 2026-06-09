import { useState, useEffect } from 'react';

function LargeButton({ text, click_passthrough, disabled = false }) {
    const [disabled_, setDisabled] = useState(disabled);
    useEffect(() => {
        setDisabled(disabled);
    }, [disabled]);
    return (
        <button
            type="button"
            className="text-center w-full p-3
        rounded-lg bg-rutgers_red text-white font-bold
        hover:bg-red-600 transition-colors duration-200
        my-4 max-w-sm disabled:bg-gray-300"
            onClick={click_passthrough}
            disabled={disabled_}
        >
            {text}
        </button>
    );
}

export default LargeButton;
