import uniqid from "uniqid";
import { useEffect, useState } from "react";
import "../../index.css";
function TextField({
    placeholder,
    error_status = { status: "normal", message: "" },
    id,
    enter_shortcut = () => {},
    onChange = (e) => {},
    defaultValue,
}) {
    const [status, setStatus] = useState(error_status);
    useEffect(() => {
        if (
            error_status.status !== status.status ||
            error_status.message !== status.message
        ) {
            setStatus(error_status);
        }
    }, [error_status]);

    function get_border() {
        const base_border =
            "font-sans block text-sm leading-5 w-full py-2 px-3 border-2 text-slate-500 rounded-lg shadow-sm focus:outline-none focus:ring";
        switch (status.status) {
            case "normal":
                return base_border;
            case "error":
                return (
                    base_border +
                    " " +
                    "border-rose-600 focus:ring-rose-200 focus:border-rose-500 flex-none"
                );
            default:
                return base_border;
        }
    }

    function handleClick() {
        if (error_status.status === "normal") return;
        setStatus({ status: "normal", message: "" });
    }

    function keypress(e) {
        if (e.code === "Enter") {
            enter_shortcut();
        } else if (error_status.status === "normal") return;
        else setStatus({ status: "normal", message: "" });
    }

    return (
        <div>
            <input
                className={get_border()}
                defaultValue={defaultValue}
                placeholder={placeholder}
                type="text"
                name="search"
                onClick={() => {
                    handleClick();
                }}
                onKeyDown={(e) => {
                    keypress(e);
                }}
                onChange={onChange}
                id={id}
            />
            {status.status === "error" && (
                <p style={{ height: 0 }} className="text-sm text-rose-600">
                    {status.message}
                </p>
            )}
        </div>
    );
}

/*
font-sans block
text-sm
leading-5
w-full
py-2
px-3
border-2
border-rose-600
text-slate-500
rounded-lg
shadow-sm
focus:outline-none
focus:ring
focus:ring-rose-200
focus:border-rose-500
dark:text-slate-400
dark:placeholder:text-slate-600
dark:bg-slate-900
dark:border-rose-500
dark:focus:ring-rose-900
dark:focus:border-rose-600
*/
export default TextField;
