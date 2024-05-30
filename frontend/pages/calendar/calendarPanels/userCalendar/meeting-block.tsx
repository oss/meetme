interface IMeetingBlock {
    row: number;
    column: number;
    selectFromHere: any;
    selectToHere: any;
    updateDisplayGrid: any;

    selectedLevel: number;
    collaborators: any[];
    selectedUsers: any[];
    displayHeight: number;

    start: number;
    end: number;
    readonly: boolean;
    setSelectedUsers: (users: any[]) => void;
}

function MeetingBlock({
    row,
    column,
    onMouseDown,
    onMouseUp,
    onMouseOver,
    start,
    end,
    available = false,
}: IMeetingBlock) {
    const displayHeight: number = 0.9;
    const bgRGB = 'rgb(252,165,165)'
    const disabled = (start === null || end === null);

    return (
        <div
            className={`
            ${disabled ? "bg-gray-600 border-transparent" : "border-slate-200"}
            ${new Date(start).getMinutes() === 0 ? "border-t-red-600" : ""} 
            border-[1px] border-solid transition-colors duration-75 flex justify-evenly`}
            style={{
                height: `${displayHeight}rem`,
                backgroundColor: !disabled && (available && bgRGB)
            }}
            data-row={row}
            data-col={column}
            data-start={start}
            data-end={end}
            data-time-start={new Date(start).getTime()}
            data-time-end={new Date(end).getTime()}
            onMouseOver={onMouseOver}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            //onMouseEnter={setSelectedUsers}
        />
    );
}

export default MeetingBlock;
