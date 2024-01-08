export default function ListIcon({
    onClick = () => { },
    selected,
}: {
    onClick: () => void;
    selected: boolean;
}) {
    return (
        <div
            onClick={onClick}
            className={`cursor-pointer flex flex-col w-fit h-fit p-2 rounded ${selected ? 'bg-red-300' : 'bg-white'
                } transition-all hover:scale-110 duration-100`}
        >
            {/* /*what does this do*/}
            {[1, 2, 3].map((num) => (
                <div
                    key={num}
                    className={`w-[30px] h-[6px] ${selected ? 'bg-white' : 'bg-gray-300'
                        } my-[2px]`}
                ></div>
            ))}
        </div>
    );
}
