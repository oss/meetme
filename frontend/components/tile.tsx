function Tile({children}) {
    return (
        <div
            className={`
                relative
                rounded-md
                overflow-x-auto
                overflow-y-auto
                x-full
                y-full
                shadow-sm
            `}
        >
            {children}
        </div>
    );
}

export default Tile;
