const dataFolder = './checkData/';

const fs = require('fs');

require('json5/lib/register')
const _ = require('lodash')

let trainDepth = Number(process.argv[2]); // DTT
let compareDepth = Number(process.argv[3]); // DTM



// if (compareDepth > trainDepth){
//     console.log({type: 'input error', details: `distance depth is bigger than comparison depth`})
//     compareDepth = trainDepth;
// }

if ((compareDepth > 10) || (compareDepth < 1)) {
    console.log({ type: 'input error', details: `1 <= CD <= 10!` })
    compareDepth = 10;
}
// if (compareDepth > trainDepth){
//     console.log({ type: 'input error', details: `DTM > DTT` })
//     //compareDepth = trainDepth
//     trainDepth = compareDepth
// }

if ((trainDepth > 20) || (trainDepth < 1)) {
    console.log({ type: 'input error', details: `1 <= TD <= 20!` })
    trainDepth = 20;
}



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
let errors = [];
let findingDistances = [];
let totalDist = 0;
let t = (new Date()).valueOf();
let cnt = 0;
const checkLog = (logPathname, index) => {
    console.log(logPathname, `${index + 1}/${numberOfFiles}`)

    // check format of json file
    try {
        data = fs.readFileSync(`${dataFolder}${logPathname}`, 'utf8');
        if ((data[data.length - 2] != "]") || (data[data.length - 1] != "}")) {
            data += "]}";
            fs.writeFileSync(`${dataFolder}${logPathname}`, data)
        }
    } catch (err) {
        console.error(err);
    }

    const log = require(`${dataFolder}${logPathname}`);
    const processName = log.processName;
    let process;
    if (processName in MODEL) {
        process = MODEL[processName];
        if (process.distances.length < compareDepth) {
            console.log({ type: 'input error', details: `${processName} comparison depth is bigger than length of distances` })
            compareDepth = process.distances.length;
        }
        if (process.distances.length < trainDepth){
            let len = process.distances.length;
            process.distances.length = trainDepth;
            while (len < trainDepth){
                process.distances[len] = {};
                len++;
            }
        }
    } else {
        errors.push({ type: 'process name not found', details: `${processName} not found in the model` })
        return;
    }

    const callsGroupedByThread = _.groupBy(log.calls, x => x.threadID);

    for (const calls of Object.values(callsGroupedByThread)) {
        totalDist += calls.length-1;
        if (calls.length <= 1) {
            continue;
        }
        for (let i = 1; i < calls.length; i++) {
            const currCall = calls[i];
            let prevCalls = new Array(trainDepth); //list of prevCalls

            //cut the lenght of array if index of curCall < trainDepth 
            if (i < trainDepth) {
                prevCalls.length = i;
            }

            //fill array of prevCalls
            for (let j = 0; j < prevCalls.length; j++) {
                prevCalls[j] = calls[i - 1 - j];
            }

            for (let k = 0; k < prevCalls.length; k++) {
                if (!process.map.some(module => module.name === prevCalls[k].moduleName)) {
                    errors.push({ type: 'module name not found!', details: `in process ${processName} module ${prevCalls[k].moduleName} not found` });
                    process.map.push({ name: prevCalls[k].moduleName, size: prevCalls[k].moduleSize })
                }
            }

            if (!process.map.some(module => module.name === currCall.moduleName)) {
                errors.push({ type: 'module name not found!', details: `in process ${processName} module ${currCall.moduleName} not found` });
                process.map.push({ name: currCall.moduleName, size: currCall.moduleSize })
            }

            // find relative length of calls in relative map
            // for prevCalls
            let relativePrevCallReturn = new Array(prevCalls.length).fill(0);
            for (let k = 0; k < prevCalls.length; k++) {
                for (let j = 0; j < process.map.length; j++) {
                    if (process.map[j].name === prevCalls[k].moduleName) {
                        relativePrevCallReturn[k] += prevCalls[k].return_address - prevCalls[k].moduleBase;
                        break;
                    }
                    relativePrevCallReturn[k] += process.map[j].size;
                }
            }
            
            // for curCall
            let relativeCurrCallReturn = 0;
            for (let j = 0; j < process.map.length; j++) {
                if (process.map[j].name === currCall.moduleName) {
                    relativeCurrCallReturn += currCall.return_address - currCall.moduleBase;
                    break;
                }
                relativeCurrCallReturn += process.map[j].size;
            }


            // find distances from currCall to prevCalls
            let distanceToPrev = new Array(prevCalls.length);
            for (let k = 0; k < prevCalls.length; k++) {
                distanceToPrev[k] = relativeCurrCallReturn - relativePrevCallReturn[k];
            }

            let distancesObject = process.distances; // link of distances in process

            // filling distances in process
            let distancesFromCurrCall = new Array(prevCalls.length);

            // check error named 'no such a current function'
            for (let k = 0; k < prevCalls.length; k++) {
                if (currCall.fname in distancesObject[k]) {
                    distancesFromCurrCall[k] = distancesObject[k][currCall.fname];
                }
                else {
                    if (k === 0) {
                        errors.push({
                            type: 'no such a current function',
                            details: `no function called ${currCall.fname} in distances of ${processName}, available functions: ${Object.keys(distancesObject[k])} module_call2: ${currCall.moduleName}`,
                            logPathname,
                            threadId: currCall.threadID
                        })
                    }
                    distancesFromCurrCall[k] = {};
                }
            }

            // check error named 'no such a function #1'
            // if prevCalls[0].fname not in one distance away from currCall => such a function has not been found
          
            let distancesFromCurrCallToPrevCalls = new Array(prevCalls.length);
            for (let k = 0; k < prevCalls.length; k++) {
                if (prevCalls[k].fname in distancesFromCurrCall[k]) {
                    distancesFromCurrCallToPrevCalls[k] = distancesFromCurrCall[k][prevCalls[k].fname];
                }
                else {
                    if (k < compareDepth) {
                        errors.push({
                            type: 'no such a previous function #' + String(k),
                            details: `no function called ${prevCalls[k].fname} in distances of ${processName} of function ${currCall.fname}, available functions: ${Object.keys(distancesFromCurrCall[k])} module_call1: ${prevCalls[k].moduleName} module_call2: ${currCall.moduleName}`,
                            logPathname,
                            threadId: currCall.threadID
                        })
                    }
                    distancesFromCurrCallToPrevCalls[k] = [];
                }
            }

            let f = false;
            for (let j = 0; (j < compareDepth) && (f === false); j++) {
                if (distancesFromCurrCallToPrevCalls[j] != undefined) {
                    for (let k = 0; k < prevCalls.length; k++) {
                        if (distancesFromCurrCallToPrevCalls[j].includes(distanceToPrev[k])) {
                            findingDistances.push({
                                names: `Name of current call: ${currCall.fname}, name of previous call: ${prevCalls[k].fname}`,
                                N_distances: `Current distance encountered in ${j} distances array`
                            })
                            f = true;
                            break;
                        }
                        else if ((j === 0) && (k === 0)){
                            errors.push({
                                type: 'no such neiboring distance!',
                                details: `no distance ${distanceToPrev[0]} between ${currCall.fname} and ${prevCalls[0].fname} in process ${processName} module_call1: ${prevCalls[0].moduleName} module_call2: ${currCall.moduleName}`,
                                logPathname
                            })
                        }
                    }
                }
            }
            if (f === false) {
                errors.push({
                    type: 'no such distance!',
                    details: `no distance ${distanceToPrev[0]} between ${currCall.fname} and ${prevCalls[0].fname} in process ${processName} module_call1: ${prevCalls[0].moduleName} module_call2: ${currCall.moduleName}`,
                    logPathname
                })
                cnt+=1;
            }

        }
    }

}



fs.readdir(dataFolder, (err, files) => {
    numberOfFiles = files.length
    files.forEach(checkLog)
    if (errors.length === 0) {
        console.log('there were no errors!');

        let totalCalls = 0;
        files.forEach(logPathname => {
            const log = require(`${dataFolder}${logPathname}`);
            console.log(logPathname, `${log.calls.length} calls`)
            totalCalls += log.calls.length
        })
        console.log('total calls', totalCalls)
    }
    else {
        console.log(errors.length, ' errors found');
        fs.writeFileSync('./errors.json', JSON.stringify(errors))
        Object.entries(_.groupBy(errors, x => x.type)).forEach(([errorType, arrayOfErrors]) => console.log(errorType, arrayOfErrors.length))

        let totalCalls = 0;
        files.forEach(logPathname => {
            const log = require(`${dataFolder}${logPathname}`);
            console.log(logPathname, `${log.calls.length} calls`)
            totalCalls += log.calls.length;
        })
        console.log('total calls', totalCalls)
        console.log('total distances', totalDist)


        let totalExploitCalls = 0;
        files.forEach(logPathname => {
            const log = require(`${dataFolder}${logPathname}`);
            const exploitCalls = log.calls.filter(x => {
                return x.return_address >= log.callRandomFunctionAddress && x.return_address <= log.callRandomFunctionAddress + 448
            }).length
            totalExploitCalls += exploitCalls;
        })
        console.log('total exploit calls', totalExploitCalls)
    }
    if (findingDistances.length === 0) {
        console.log('there were no finding distances!')
    }
    else {
        console.log(findingDistances.length, ' distances found');
        fs.writeFileSync('./distances.json', JSON.stringify(findingDistances))
        Object.entries(_.groupBy(findingDistances, x => x.N_distances)).forEach(([errorType, arrayOfErrors]) => console.log(errorType, arrayOfErrors.length));
    }
    //fs.writeFileSync('./model.json', JSON.stringify(MODEL, null, 2))
    let tme = (new Date()).valueOf() - t;
    console.log('TIME = ', tme);
    console.log(cnt);
    fs.writeFile("output.txt", String(tme) + '\n' + String(cnt), function(error){
        if(error){  // если ошибка
            return console.log(error);
        }
        console.log("Файл успешно записан");
    });
    
})
var numberOfFiles
