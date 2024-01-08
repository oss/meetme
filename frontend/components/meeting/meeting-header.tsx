import React from "react";
import Button from "../utils/button";

interface IMeetingHeader {
    title: string;
    buttonTitle?: string;
    onButtonPress?: any;
}

function MeetingHeader(props: IMeetingHeader) {
    return (
        <div className="flex justify-between items-center h-16">
            <h2 className="font-bold text-2xl">{props.title}</h2>
            {props.onButtonPress ? (
                <Button
                    text={
                        props.buttonTitle !== undefined
                            ? props.buttonTitle
                            : "Untitled Button"
                    }
                    click_passthrough={props.onButtonPress}
                />
            ) : (
                <></>
            )}
        </div>
    );
}

export default MeetingHeader;
