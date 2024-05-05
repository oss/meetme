const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];

interface IMeetingColumnHeader {
    month: number;
    day: number;
    year: number;
}

function MeetingColumnHeader(props: IMeetingColumnHeader) {
    const month = `${months[props.month].substring(0, 3)}.`;

    return (
        <div className="bg-gray-200" >
            <div className={`flex justify-center items-center h-20`}>
                <div className={'text-center text-slate-500'}>
                    <h3 className="text-sm -mb-1 font-semibold">{month}</h3>
                    <h4 className="text-3xl font-bold">{props.day}</h4>
                </div>
            </div>
        </div>
    );
}

export default MeetingColumnHeader;
