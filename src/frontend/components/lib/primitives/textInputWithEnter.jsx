import { forwardRef } from "react";
import onEnterInit from "../../../util/onEnter";

function TextBarWithEnter({onEnter=()=>{}, onKeyDown=()=>{}, ...other},ref) {
    return(
        <input type="text" onKeyDown={(e)=>{
            onEnterInit(e,onEnter)
            onKeyDown(e)
        }} {...other} ref={ref}/>
    )
}

export default forwardRef(TextBarWithEnter);
