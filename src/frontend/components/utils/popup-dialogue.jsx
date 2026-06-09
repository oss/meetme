/*
TODO: Remove all references to Dialogue 
in favor of PopupDialogue.
*/
function Dialogue({ children }) {
    return (
        <div
            className="w-full h-screen bg-slate-400/50"
            style={{ position: 'fixed', top: 0, right: 0 }}
        >
            <div className="flex items-center justify-center w-full h-screen">
                {children}
            </div>
        </div>
    );
}

function PopupDialogue({ children, onClose, title = '' }) {
    return (
        <div
            className="w-full h-screen bg-slate-400/50"
            style={{ position: 'fixed', top: 0, right: 0 }}
        >
            <div className="flex items-center justify-center w-full h-screen">
                <div className="justify-center px-8 py-5 mx-2 my-2 bg-white rounded-md shadow-sm w-[35rem] max-w-[50%]">
                    <div className="flex justify-between">
                        <p className="font-bold">{title}</p>
                        <button onClick={onClose}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-6 h-6"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>
                    <div className="h-[1px] -mx-8 bg-slate-200 my-3" />
                    {children}
                </div>
            </div>
        </div>
    );
}

module.exports = {
    Dialogue,
    PopupDialogue,
};
