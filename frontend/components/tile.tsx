function TileRoot({ children }){
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

const Title = ({ children }) => {
    return (
        <p className="text-gray-600 font-bold">{children}</p>
    )
}

export default Object.assign(TileRoot, { 
    Title: Title 
});