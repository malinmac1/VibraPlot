//Starting script after OpenCV.js is loaded
var Module;

Module.onRuntimeInitialized = function () {

    let streaming = false;
    let start = false;

    // Starting processing after video is loaded
    video.addEventListener('loadeddata', (event) => {
        video.addEventListener('canplay', (event) => {
            streaming = true;

            // Assigning HTML elements to variables
            let video = document.getElementById('videoInput');
            let canvas = document.getElementById('canvasOutput');
            let startButton = document.getElementById('startButton');
            let left = document.getElementById('left');
            let width = document.getElementById('width');
            let bottom = document.getElementById('bottom');
            let height = document.getElementById('height');
            let X = document.getElementById('X');
            let Y = document.getElementById('Y');
            let frequencySelect = document.getElementById('frequency');

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
            let xValue = leftValue + widthValue/2;
            let yValue = canvas.height - (bottomValue - heightValue/2);

            X.innerHTML = "X: " + xValue;
            Y.innerHTML = "Y: " + yValue;

            // Setting initial frequency
            frequencySelect.value = 30;
            let frequency = parseInt(frequencySelect.value);

            // Changing x, y values when input fields are changed
            left.onchange = function () {
                leftValue = parseInt(left.value) / 100 * canvas.width;
                widthValue = parseInt(width.value) / 100 * (canvas.width - leftValue);
                xValue = leftValue + widthValue/2;
                X.innerHTML = "X: " + xValue;
            }
            width.onchange = function () {
                leftValue = parseInt(left.value) / 100 * canvas.width;
                widthValue = parseInt(width.value) / 100 * (canvas.width - leftValue);
                xValue = leftValue + widthValue/2;
                X.innerHTML = "X: " + xValue;
            }
            bottom.onchange = function () {
                bottomValue = canvas.height - (parseInt(bottom.value) / 100 * canvas.height);
                heightValue = parseInt(height.value) / 100 * bottomValue;
                yValue = canvas.height - (bottomValue - heightValue/2);
                Y.innerHTML = "Y: " + yValue;
            }
            height.onchange = function () {
                bottomValue = canvas.height - (parseInt(bottom.value) / 100 * canvas.height);
                heightValue = parseInt(height.value) / 100 * bottomValue;
                yValue = canvas.height - (bottomValue - heightValue/2);
                Y.innerHTML = "Y: " + yValue;
            }

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
                initialLoopInterval = setInterval(initialLoop, 1000/frequency);
            }

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
                console.log('processVideo function is called.')
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
                    xValue = x + w/2;
                    yValue = canvas.height - (y + h/2);
                    X.innerHTML = "X: " + xValue;
                    Y.innerHTML = "Y: " + yValue;
                } catch (err) {
                    console.error(err);
                }
            }

            // Starting initial loop
            initialLoopInterval = setInterval(initialLoop, 1000/frequency);

            // Starting or stopping tracking
            startButton.onclick = function () {
                if (start === false) {
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
                    processVideoInterval = setInterval(processVideo, 1000/frequency);
                } else {
                    // Stopping processing loop
                    start = false;
                    startButton.innerHTML = 'Start';
                    clearInterval(processVideoInterval);

                    // Starting initial loop
                    initialLoopInterval = setInterval(initialLoop, 1000/frequency);
                }
            }
        });
    });
}