export default function GridIcon({
    onClick = () => {},
    selected,
}: {
    onClick: () => void;
    selected: boolean;
}) {
    return (
        <div
            onClick={onClick}
            className={`cursor-pointer w-fit h-fit rounded shadow-sm ${
                selected ? 'bg-red-300' : 'bg-white'
            } p-2 grid grid-cols-3 transition-all hover:scale-110 duration-100`}
        >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <div
                    key={num}
                    className={`w-[6px] h-[6px] ${
                        selected ? 'bg-white' : 'bg-gray-300'
                    } m-[2px]`}
                ></div>
            ))}
        </div>
    );
}
