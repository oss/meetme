function onEnter(e,func){
    if(e.code === 'Enter')
        func(e)
}

export default onEnter;