// Assigning HTML elements to variables
const divValues = document.getElementById('plotValues');
const divAccelerations = document.getElementById('plotAccelerations');

// Declaring x,y and time variables
let xValueOld = 0;
let xAcceleration = 0;
let yValueOld = 0;
let yAcceleration = 0;
let time = 0;

// Functions for drawing initial plots
function drawInitialPlots() {

    // Assigning initial x,y and time values
    xValueOld = 0;
    xAcceleration = 0;
    yValueOld = 0;
    yAcceleration = 0;
    time = 0;

    // Declaring plotting variables
    let xValueTrace = {
        x: [time],
        y: [xValue],
        mode: 'lines',
        name: 'X Displacement'
    };
    let xAccelerationTrace = {
        x: [time],
        y: [xAcceleration],
        mode: 'lines',
        name: 'X Acceleration'
    };
    let yValueTrace = {
        x: [time],
        y: [yValue],
        mode: 'lines',
        name: 'Y Displacement'
    };
    let yAccelerationTrace = {
        x: [time],
        y: [yAcceleration],
        mode: 'lines',
        name: 'Y Acceleration'
    };

    // Declaring plotly layouts
    var layoutValues = {
        title: 'Displacement'
    };
    var layoutAccelerations = {
        title: 'Acceleration'
    };

    // Declaring data arrays
    let dataValues = [xValueTrace, yValueTrace];
    let dataAccelerations = [xAccelerationTrace, yAccelerationTrace];

    // Drawing plots
    Plotly.newPlot('plotValues', dataValues, layoutValues, {staticPlot: true});
    Plotly.newPlot('plotAccelerations', dataAccelerations, layoutAccelerations, {staticPlot: true});
}

// Declaring loop intervals
let plotInterval;

// Function for appending x, y and time values to the arrays
function drawPlots() {
    // Updating x, y and time values
    xAcceleration = (xValue - xValueOld) * frequency * frequency;
    xValueOld = xValue;
    yAcceleration = (yValue - yValueOld) * frequency * frequency;
    yValueOld = yValue;
    time += (1000 / frequency);

    // Declaring trace updates
    let xValueTraceUpdate = {
        x: [[time]],
        y: [[xValue]]
    };
    let xAccelerationTraceUpdate = {
        x: [[time]],
        y: [[xAcceleration]]
    };
    let yValueTraceUpdate = {
        x: [[time]],
        y: [[yValue]]
    };
    let yAccelerationTraceUpdate = {
        x: [[time]],
        y: [[yAcceleration]]
    };

    // Updating traces
    Plotly.extendTraces('plotValues', xValueTraceUpdate, [0]);
    Plotly.extendTraces('plotAccelerations', xAccelerationTraceUpdate, [0]);
    Plotly.extendTraces('plotValues', yValueTraceUpdate, [1]);
    Plotly.extendTraces('plotAccelerations', yAccelerationTraceUpdate, [1]);
}

// Starting script after liveVideoProcessing.js is loaded
document.getElementById('canvasOutput').addEventListener('loadeddata', () => {
    // Resizing divs
    divValues.style.width = video.width + 'px';
    divValues.style.height = video.height + 'px';
    divAccelerations.style.width = video.width + 'px';
    divAccelerations.style.height = video.height + 'px';

    // Drawing initial plots
    drawInitialPlots();
});