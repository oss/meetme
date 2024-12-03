function StackRoot({ children }){
    return (
        <div className='grid'>
            {children}
        </div>
    );
}

const Item = ({ children }) => {
    return (
        <div style={{gridRow: 1, gridColumn:1}}>
            {children}
        </div>
    )
}

export default Object.assign(StackRoot, { 
    Item: Item
});