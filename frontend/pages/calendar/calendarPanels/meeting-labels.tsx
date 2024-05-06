interface IMeetingLabels {
    rowsCount: number;
    timeIntervals: number;
    startHour: Date;
    displayHeight: number;
}

function MeetingLabels(props: IMeetingLabels) {
    let currentHour = props.startHour.getHours();
    let currentMinute = 0;

    const displayMinuteInterval: number = 0;

    return (
        <div
            className="mr-4"
            style={{ transform: `translateY(-${props.displayHeight / 2}rem)` }}
        >
            <div className="h-20" />
            {[...Array(props.rowsCount + 1)].map((x, i) => {
                let displayHour = currentHour;
                let suffix = "AM";
                if (displayHour == 0 || displayHour == 24) {
                    displayHour = 12;
                    suffix = "AM";
                }
                if (displayHour > 24) {
                    displayHour %= 12;
                    suffix = "AM";
                } else if (displayHour > 12) {
                    displayHour -= 12;
                    suffix = "PM";
                }

                const out = (
                    <div
                        key={i}
                        className="text-xs text-slate-500 flex items-center justify-end"
                        style={{ height: `${props.displayHeight}rem` }}
                    >
                        <p>
                            {displayMinuteInterval === currentMinute
                                ? `${displayHour}:${currentMinute
                                    .toString()
                                    .padStart(2, "0")}${suffix}`
                                : ""}
                        </p>
                    </div>
                );

                currentMinute += props.timeIntervals;
                if (currentMinute >= 60) {
                    currentHour += Math.floor(currentMinute / 60);
                    currentMinute = currentMinute % 60;
                }

                return out;
            })}
        </div>
    );
}

export default MeetingLabels;
