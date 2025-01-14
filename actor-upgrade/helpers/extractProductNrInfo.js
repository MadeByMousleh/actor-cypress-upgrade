

let sensorSeries = {
    0: "Not yet in use",
    1: "Mini",
    2: "Outdoor",
    3: "Not yet in use",
    4: "Not yet in use",
    5: "Not yet in use",
    6: "Medium range",
    7: "Long range",
    8: "High Cieling",
    9: "Accessories"
};

let technology = {
    0: "230V",
    1: "NHC",
    2: "24 V",
    3: "KNX",
    4: "Not yet in use",
    5: "DALI",
    6: "DALI wireless",
    7: "On/Off wireless",
    8: "Not yet in use",
    9: "No value"
};

let mounting = {
    0: "Ceiling, flush box",
    1: "ceiling, flush",
    2: "ceiling, surface",
    3: "Wall",
    4: "Wall flush",
    5: "Not yet in use",
    6: "Not yet in use",
    7: "Not yet in use",
    8: "Not yet in use",
    9: "No value"
};

let output = {
    0: "BMS",
    1: "1 channel",
    2: "2 channels",
    3: "Standard",
    4: "Comfort",
    5: "Not yet in use",
    6: "Not yet in use",
    7: "Not yet in use",
    8: "Not yet in use",
    9: "No value"
};

let detection = {
    0: "No value",
    1: "Motion detector",
    2: "Presence detector",
    3: "True presence",
    4: "Not yet in use",
    5: "Not yet in use",
    6: "Not yet in use",
    7: "Not yet in use",
    8: "No value",
    9: "No value"
};


let variant = {
    0: "Wago 1 cable",
    1: "White",
    2: "Black",
    3: "Silver",
    4: "Wago 2 cables",
    5: "Wieland 1 cable",
    6: "Wieland 2 cables",
    7: "Not yet in use",
    8: "Remote control",
    9: "No value"
};


const extractProductInfo = (productNumber) => {

    const number = productNumber.split("-");
    const arr = number[1].split("");

    let seriesName = sensorSeries[arr[0]];
    let technologyName = technology[arr[1]];
    let mountingName = mounting[arr[2]];
    let outputName = output[arr[3]];
    let detectionName = detection[arr[4]];
    let variantName = variant[arr[5]];

    return {
        series: seriesName,
        technology: technologyName,
        mounting: mountingName,
        output: outputName,
        detection: detectionName,
        variant: variantName,
    }

}

export default extractProductInfo;