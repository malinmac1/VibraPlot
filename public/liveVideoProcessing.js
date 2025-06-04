// Declaring x, y values for livePlotting.js
let xValue = 0;
let yValue = 0;
let frequency = 0;

// Setting up starting for databaseSync.js
const startButton = document.getElementById('startButton');
let start = false;

// Declaring a button
let next = document.createElement('button');
next.innerText = "Next";

// Starting script after OpenCV.js is loaded
var Module;

Module.onRuntimeInitialized = function () {
    // Declaring boolean variable
    let streaming = false;

    // Starting processing after video is loaded
    video.addEventListener('loadeddata', (event) => {
        video.addEventListener('canplay', (event) => {
            streaming = true;

            // Assigning HTML elements to variables
            const canvas = document.getElementById('canvasOutput');
            const left = document.getElementById('left');
            const width = document.getElementById('width');
            const bottom = document.getElementById('bottom');
            const height = document.getElementById('height');
            const frequencySelect = document.getElementById('frequency');

            // Setting up initial x, y values
            canvas.width = video.width;
            canvas.height = video.height;
            left.value = 0;
            width.value = 100;
            bottom.value = 0;
            height.value = 100;
            let leftValue = parseInt(left.value) / 100 * canvas.width;
            let widthValue = parseInt(width.value) / 100 * (canvas.width - leftValue);
            let bottomValue = canvas.height - (parseInt(bottom.value) / 100 * canvas.height);
            let heightValue = parseInt(height.value) / 100 * bottomValue;
            let xValueInitial = leftValue + widthValue/2;
            let yValueInitial = canvas.height - (bottomValue - heightValue/2);
            xValue = xValueInitial;
            yValue = yValueInitial;

            // Setting initial frequency
            frequencySelect.value = 30;
            frequency = parseInt(frequencySelect.value);

            // Changing x, y values when input fields are changed
            function widthChange() {
                leftValue = parseInt(left.value) / 100 * canvas.width;
                widthValue = parseInt(width.value) / 100 * (canvas.width - leftValue);
                xValueInitial = leftValue + widthValue/2;
                startButton.innerHTML = 'Start';
                drawInitialPlots();
            }

            function heightChange() {
                bottomValue = canvas.height - (parseInt(bottom.value) / 100 * canvas.height);
                heightValue = parseInt(height.value) / 100 * bottomValue;
                yValueInitial = canvas.height - (bottomValue - heightValue / 2);
                startButton.innerHTML = 'Start';
                drawInitialPlots();
            }

            left.onchange = widthChange;
            width.onchange = widthChange;

            bottom.onchange = heightChange;
            height.onchange = heightChange;

            // Capturing first frame of the video
            let cap = new cv.VideoCapture(video);
            let frame = new cv.Mat(video.height, video.width, cv.CV_8UC4);

            // Setting the initial location of track window
            let trackWindow = new cv.Rect(leftValue, bottomValue - heightValue, widthValue, heightValue);
            cap.read(frame);

            // Declaring variables for processing
            let roi;
            let hsvRoi;
            let rgbRoi;
            let mask;
            let lowScalar;
            let highScalar;
            let low;
            let high;
            let roiHist;
            let hsvRoiVec;
            let termCrit;
            let hsv;
            let dst;
            let hsvVec;

            // Changing frequency when input field is changed
            frequencySelect.onchange = function () {
                frequency = parseInt(frequencySelect.value);
                clearInterval(initialLoopInterval);
                clearInterval(processVideoInterval);
                initialLoopInterval = setInterval(initialLoop, 1000 / frequency);
            }

            // Declaring loop intervals
            let initialLoopInterval;
            let processVideoInterval;

            // Function to show window location without tracking
            function initialLoop() {
                frame.delete();
                frame = new cv.Mat(video.height, video.width, cv.CV_8UC4);
                cap.read(frame);
                // hardcode the initial location of window
                trackWindow = new cv.Rect(leftValue, bottomValue - heightValue, widthValue, heightValue);
                cv.rectangle(frame, new cv.Point(leftValue, bottomValue - heightValue), new cv.Point(leftValue + widthValue, bottomValue), [255, 0, 0, 255], 2);
                cv.imshow('canvasOutput', frame);
            }

            // Function to process video
            function processVideo() {
                try {
                    // Checking if streaming is stopped
                    if (!streaming) {
                        frame.delete();
                        dst.delete();
                        hsvVec.delete();
                        roiHist.delete();
                        hsv.delete();
                        return;
                    }

                    // Starting processing
                    cap.read(frame);
                    cv.cvtColor(frame, hsv, cv.COLOR_RGBA2RGB);
                    cv.cvtColor(hsv, hsv, cv.COLOR_RGB2HSV);
                    cv.calcBackProject(hsvVec, [0], roiHist, dst, [0, 180], 1);

                    // Tracking using meanshift algorithm
                    [, trackWindow] = cv.meanShift(dst, trackWindow, termCrit);

                    // Drawing tracking window
                    let [x, y, w, h] = [trackWindow.x, trackWindow.y, trackWindow.width, trackWindow.height];
                    cv.rectangle(frame, new cv.Point(x, y), new cv.Point(x + w, y + h), [255, 0, 0, 255], 2);
                    cv.imshow('canvasOutput', frame);

                    // Assigning new values to x, y
                    left.value = x / canvas.width * 100;
                    width.value = w / (canvas.width - x) * 100;
                    bottom.value = (canvas.height - (y + h)) / canvas.height * 100;
                    height.value = h / (y + h) * 100;
                    leftValue = x;
                    bottomValue = y + h;
                    xValue = (x + w/2) - xValueInitial;
                    yValue = (canvas.height - (y + h/2)) - yValueInitial;
                } catch (err) {
                    console.error(err);
                }
            }

            // Starting initial loop
            initialLoopInterval = setInterval(initialLoop, 1000 / frequency);

            // Dispatching events to load livePlotting.js and databaseSync.js
            document.getElementById('canvasOutput').dispatchEvent(new Event('loadeddata'));

            // Starting or stopping tracking and plotting
            startButton.onclick = function () {
                if (!start) {

                    // Stopping initial loop
                    start = true;
                    startButton.innerHTML = 'Stop';
                    clearInterval(initialLoopInterval);

                    // Processing first frame
                    roi = frame.roi(trackWindow);
                    hsvRoi = new cv.Mat();
                    rgbRoi = new cv.Mat();
                    cv.cvtColor(roi, rgbRoi, cv.COLOR_RGBA2RGB);
                    cv.cvtColor(rgbRoi, hsvRoi, cv.COLOR_RGB2HSV);
                    mask = new cv.Mat();
                    lowScalar = new cv.Scalar(30, 30, 0);
                    highScalar = new cv.Scalar(180, 180, 180);
                    low = new cv.Mat(hsvRoi.rows, hsvRoi.cols, hsvRoi.type(), lowScalar);
                    high = new cv.Mat(hsvRoi.rows, hsvRoi.cols, hsvRoi.type(), highScalar);
                    cv.inRange(hsvRoi, low, high, mask);
                    roiHist = new cv.Mat();
                    hsvRoiVec = new cv.MatVector();
                    hsvRoiVec.push_back(hsvRoi);
                    cv.calcHist(hsvRoiVec, [0], mask, roiHist, [180], [0, 180]);
                    cv.normalize(roiHist, roiHist, 0, 255, cv.NORM_MINMAX);
                    roi.delete();
                    rgbRoi.delete();
                    hsvRoi.delete();
                    mask.delete();
                    low.delete();
                    high.delete();
                    hsvRoiVec.delete();
                    termCrit = new cv.TermCriteria(cv.TERM_CRITERIA_EPS | cv.TERM_CRITERIA_COUNT, 10, 1);
                    hsv = new cv.Mat(video.height, video.width, cv.CV_8UC3);
                    dst = new cv.Mat();
                    hsvVec = new cv.MatVector();
                    hsvVec.push_back(hsv);

                    // Starting processing loop
                    processVideoInterval = setInterval(processVideo, 1000 / frequency);

                    // Starting plotting loops
                    plotInterval = setInterval(drawPlots, 1000 / frequency);

                    // Starting database sync
                    document.dispatchEvent(new Event('measurementStarted'));
                } else {

                    // Stopping processing loop
                    start = false;
                    startButton.innerHTML = 'Resume';
                    clearInterval(processVideoInterval);

                    // Starting initial loop
                    initialLoopInterval = setInterval(initialLoop, 1000 / frequency);

                    // Stopping plotting loops
                    clearInterval(plotInterval);

                    // Stopping database sync
                    document.dispatchEvent(new Event('measurementStopped'));

                    // Spawning button
                    const main = document.getElementById('main');
                    main.appendChild(next);

                    // Proceeding to the next step
                    next.addEventListener('click', () => {
                        window.location.href = 'results.html';
                    })
                }
            }
        });
    });
}