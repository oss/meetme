const x = require("./gz_2010_us_040_00_500k.json 01-42-48-561.json")
const y = require("./state_info.json")
const FileSystem = require("fs");

const arr = []
for(let i=0;i<x.features.length;i++){
    const state = x.features[i]
    console.log(state);
    for(let j=0;j<y.length;j++){
        if(state.properties.STATE == y[j].state_id){
            const new_state = {...state};
            new_state.properties.NAME = y[j].name
            arr.push(new_state)
            break;
        }
    }
}
FileSystem.writeFile('file.json', JSON.stringify(arr), (error) => {
    if (error) throw error;
  });