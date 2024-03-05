function Tile({children}) {
    return (
        <div
            className={` 
                grow
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
