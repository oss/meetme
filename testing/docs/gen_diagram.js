const madge = require('madge');
//{includeNpm: true}
madge('/project/frontend/index.js',).then((res) => {

    const dependency_graph=res.obj();
    //console.log(dependency_graph);
    graph_arr = []
    indexes_logged = {}

    for(file in dependency_graph){

        if(dependency_graph[file].length === 0)
            continue;

        const dep_list = dependency_graph[file];
        for(let i=0;i<dep_list.length;i++){
            
            let dependency_string = dep_list[i];
            let file_string = file;

            if(dependency_string.startsWith('components')){
                continue;
            }
            if(file_string.startsWith('components')){
                file_string = file_string.slice('components/'.length);
                continue;
            }

            if(indexes_logged[dependency_string] === undefined){
                indexes_logged[dependency_string] = true;
                //dependency_string = dependency_string+"["+dependency_string+"]"
            }

            graph_arr.push(file_string+" --> "+dependency_string);
        }
    }
    graph_arr.forEach(element => {
        console.log(element)
    });
});