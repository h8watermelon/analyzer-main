const dataFolder = './addLearningdata/';

const fs = require('fs');
require('json5/lib/register')
const _ = require('lodash')

let countDistances = Number(process.argv[2]);

function groupBy(list, keyGetter) {
    const map = new Map();
    list.forEach((item) => {
         const key = keyGetter(item);
         const collection = map.get(key);
         if (!collection) {
             map.set(key, [item]);
         } else {
             collection.push(item);
         }
    });
    return map;
}

let MODEL = require('./model2.json');

const processLog = (logPathname, index) => {
    console.log(logPathname, `${index + 1}/${numberOfFiles}`)

	// check format of json file
	try {
		data = fs.readFileSync(`${dataFolder}${logPathname}`, 'utf8');
		if( (data[data.length-2] != "]") || (data[data.length-1] != "}") )
		{
			data += "]}";
			fs.writeFileSync(`${dataFolder}${logPathname}`, data)
		}
	} catch (err) {
		console.error(err);
	}

    const log = require(`${dataFolder}${logPathname}`);
    const processName = log.processName;
    let process;
    if (processName in MODEL){
        process = MODEL[processName];
        if (process.distances.length < countDistances){
            let len = process.distances.length;
            process.distances.length = countDistances;
            while (len < countDistances){
                process.distances[len] = {};
                len++;
            }
        }
    }else{
        MODEL[processName] = {
            map: [],
            distances: new Array(countDistances)
        };
        process = MODEL[processName];
        for(let k = 0; k < countDistances; k++ ){
            process.distances[k] = {};
        }
    }
   
    
    const callsGroupedByThread = _.groupBy(log.calls, x => x.threadID);

    for (const calls of Object.values(callsGroupedByThread)){
        if (calls.length <= 1){
            continue;
        } 
        for (let i = 1; i < calls.length; i++){
            const currCall = calls[i];
            let prevCalls = new Array(countDistances); //list of prevCalls

            //cut the lenght of array if index of curCall < countDistances 
            if (i < countDistances){ 
                prevCalls.length = i; 
            }
            
            //fill array of prevCalls
            for (let j = 0; j < prevCalls.length; j++){
                prevCalls[j] = calls[i-1-j];
            }
            // create the map
            for (let k = 0; k < prevCalls.length; k++) {
                if (!process.map.some(module => module.name === prevCalls[k].moduleName)) {
                    process.map.push({ name: prevCalls[k].moduleName, size: prevCalls[k].moduleSize })
                }
            }
            
            if (!process.map.some(module => module.name === currCall.moduleName)){
                process.map.push({name: currCall.moduleName, size: currCall.moduleSize})
            } 

            // find relative length of calls in relative map

            // for prevCalls
            let relativePrevCallReturn = new Array(prevCalls.length).fill(0);
            for (let k = 0; k < prevCalls.length; k++){
                for (let j = 0; j < process.map.length; j++){
                    if (process.map[j].name === prevCalls[k].moduleName){
                        relativePrevCallReturn[k] += prevCalls[k].return_address - prevCalls[k].moduleBase;
                        break;
                    }
                    relativePrevCallReturn[k] += process.map[j].size;
                }
            }

            // for curCall
            let relativeCurrCallReturn = 0;
            for (let j = 0; j < process.map.length; j++){
                if (process.map[j].name === currCall.moduleName){
                    relativeCurrCallReturn += currCall.return_address - currCall.moduleBase;
                    break;
                }
                relativeCurrCallReturn += process.map[j].size;
            }

            // find distances from currCall to prevCalls
            let distanceToPrev = new Array(prevCalls.length);
            for (let k = 0; k < prevCalls.length; k++){
                distanceToPrev[k] = relativeCurrCallReturn - relativePrevCallReturn[k];
            }

            let distancesObject = process.distances;  // link of distances in process
            
            // filling distances in process
            let distancesFromCurrCall = new Array(prevCalls.length);
            for (let k = 0; k < prevCalls.length; k++) {
                if (!(currCall.fname in process.distances[k])) {
                    process.distances[k][currCall.fname] = {};
                }
                distancesFromCurrCall[k] = distancesObject[k][currCall.fname];
            }

            let distancesFromCurrCallToPrevCalls = new Array(prevCalls.length);
            for (let k = 0; k < prevCalls.length; k++) {
                if (!(prevCalls[k].fname in distancesObject[k][currCall.fname])) {
                    distancesFromCurrCall[k][prevCalls[k].fname] = [];
                }
                distancesFromCurrCallToPrevCalls[k] = distancesFromCurrCall[k][prevCalls[k].fname];
            }
        
            for (let k = 0; k < prevCalls.length; k++) {
                if (!distancesFromCurrCallToPrevCalls[k].includes(distanceToPrev[k])){
                    distancesFromCurrCallToPrevCalls[k].push(distanceToPrev[k]);
                } 
            }

        }
    }
    delete require.cache[require.resolve(`${dataFolder}${logPathname}`)]
}

fs.readdir(dataFolder, (err, files) => {
    numberOfFiles = files.length
    files.forEach(processLog)
    fs.writeFileSync('./model2.json', JSON.stringify(MODEL, null, 2))
})

var numberOfFiles
