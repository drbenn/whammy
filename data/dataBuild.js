const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");

const dataFileName = "filename";

/* INPUT */
const inputXlsxFilepath = path.resolve(__dirname, `data/${dataFileName}.xlsx`);
const outputJsonDirectory = path.resolve('../src/assets/data');
const outputJsonFilepath = path.join(
    outputJsonDirectory,
    'output_data.json'
);
const workbook = xlsx.readFile(inputXlsxFilepath);

const returnData = {
    topics: [],
    dataPoints: [],
    storyMapDataPoints: [],
    fullMapDataPoints: [],
    deliveredGraphDataPoints: []
}

const hexCodes = {
    teal: '#00897b',
    fuscia: '#ec407a'
}

/* DATA */
const pointType1DataSheet = workbook.Sheets["pointType1"];

const pointType1Data = xlsx.utils.sheet_to_json(pointType1DataSheet, {
    range: "A1: D33",
    raw: false,
});

pointType1Data.forEach((row) => {
const dataObject = {
    dataPoint: 'pointType1',
    date: row.date,
    title: row.title,
    lat: row.lat,
    lng: row.lng,
    markerType: 'marker', //icon,arrow
    fillColor: hexCodes.fuscia 
    //if icon: "icon_for_type1"
}
    return["fullMapDataPoints"].push(dataObject);
})

/* OUTPUT */
fs.writeFileSync(outputJsonFilepath, JSON.stringify(returnData), {
    encodeing: "utf8",
});
console.log("Databuild complete");
