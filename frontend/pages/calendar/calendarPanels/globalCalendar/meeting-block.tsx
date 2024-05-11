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
    collaborators,
    selectedUsers,
    start,
    end,
    setSelectedUsers,
}: IMeetingBlock) {
    const displayHeight: number = 0.9;
    const colorBrightness: number = selectedUsers.length / collaborators.size;
    const disabled = start === null || end === null;

    function getColorValue(value: number) {
        return value + Math.floor((255 - value) * (1 - colorBrightness));
    }

    const blockColor =
        colorBrightness === 0
            ? "rgb(255, 255, 255)"
            : `rgb(${getColorValue(252)}, ${getColorValue(
                  165
              )}, ${getColorValue(165)})`;

    return (
        <div
            onMouseEnter={() => {
                setSelectedUsers(selectedUsers);
            }}
            className={`${
                disabled ? "bg-gray-600 border-transparent" : "border-slate-200"
            } border-[1px] border-solid transition-colors duration-75 flex justify-evenly`}
            style={{
                height: `${displayHeight}rem`,
                backgroundColor: !disabled && blockColor,
            }}
            data-row={row}
            data-col={column}
            data-start={start}
            data-end={end}
            data-time-start={new Date(start).getTime()}
            data-time-end={new Date(end).getTime()}
        ></div>
    );
}

export default MeetingBlock;
