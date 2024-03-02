function Tile({children,bg_color = 'bg-white'}) {
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
                ${bg_color} 
            `}
        >
            {children}
        </div>
    );
}

export default Tile;
