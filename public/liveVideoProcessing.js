var Module;

Module.onRuntimeInitialized = function () {

    let streaming = false;
    let start = false;

    video.addEventListener('loadeddata', (event) => {
        video.addEventListener('canplay', (event) => {
            streaming = true;
            let video = document.getElementById('videoInput');
            let canvas = document.getElementById('canvasOutput');
            let startButton = document.getElementById('startButton');
            let x1 = document.getElementById('x1');
            let x2 = document.getElementById('x2');
            let y1 = document.getElementById('y1');
            let y2 = document.getElementById('y2');
            xValue = document.getElementById('xValue');
            yValue = document.getElementById('yValue');

            canvas.width = video.width;
            canvas.height = video.height;

            x1.value = 0;
            x2.value = canvas.width;
            y1.value = canvas.height;
            y2.value = 0;

            let left = parseInt(x1.value);
            let right = parseInt(x2.value);
            let top = canvas.height - parseInt(y1.value);
            let bottom = canvas.height - parseInt(y2.value);
            let width = right - left;
            let height = bottom - top;
            let X = left + width/2;
            let Y = canvas.height - (top + height/2);

            xValue.innerHTML = "X: " + X;
            yValue.innerHTML = "Y: " + Y;

            x1.onchange = function () {
                left = parseInt(x1.value);
            }
            x2.onchange = function () {
                right = parseInt(x2.value);
            }
            y1.onchange = function () {
                top = canvas.height - parseInt(y1.value);
            }
            y2.onchange = function () {
                bottom = canvas.height - parseInt(y2.value);
            }

            // take first frame of the video
            let cap = new cv.VideoCapture(video);
            let frame = new cv.Mat(video.height, video.width, cv.CV_8UC4);

            // hardcode the initial location of window
            let trackWindow = new cv.Rect(left, top, width, height);
            cap.read(frame);

            // set up the ROI for tracking
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

            const FPS = 30;

            let initialLoopInterval;
            let processVideoInterval;

            function initialLoop() {
                frame.delete();
                frame = new cv.Mat(video.height, video.width, cv.CV_8UC4);
                cap.read(frame);
                // hardcode the initial location of window
                trackWindow = new cv.Rect(left, top, width, height);
                cv.rectangle(frame, new cv.Point(left, top), new cv.Point(right, bottom), [255, 0, 0, 255], 2);
                cv.imshow('canvasOutput', frame);
                width = right - left;
                height = bottom - top;
                X = left + width/2;
                Y = canvas.height - (top + height/2);
                xValue.innerHTML = "X: " + X;
                yValue.innerHTML = "Y: " + Y;
            }

            function processVideo() {
                console.log('processVideo function is called.')
                try {
                    if (!streaming) {
                        // clean and stop.
                        frame.delete();
                        dst.delete();
                        hsvVec.delete();
                        roiHist.delete();
                        hsv.delete();
                        return;
                    }

                    // start processing.
                    cap.read(frame);
                    cv.cvtColor(frame, hsv, cv.COLOR_RGBA2RGB);
                    cv.cvtColor(hsv, hsv, cv.COLOR_RGB2HSV);
                    cv.calcBackProject(hsvVec, [0], roiHist, dst, [0, 180], 1);

                    // Apply meanshift to get the new location
                    // and it also returns number of iterations meanShift took to converge,
                    // which is useless in this demo.
                    [, trackWindow] = cv.meanShift(dst, trackWindow, termCrit);

                    // Draw it on image
                    let [x, y, w, h] = [trackWindow.x, trackWindow.y, trackWindow.width, trackWindow.height];
                    cv.rectangle(frame, new cv.Point(x, y), new cv.Point(x + w, y + h), [255, 0, 0, 255], 2);
                    cv.imshow('canvasOutput', frame);
                    x1.value = x;
                    x2.value = x + w;
                    y1.value = canvas.height - y;
                    y2.value = canvas.height - (y + h);
                    left = x;
                    right = x + w;
                    top = y;
                    bottom = y + h;
                    X = x + w/2;
                    Y = canvas.height - (y + h/2);
                    xValue.innerHTML = "X: " + X;
                    yValue.innerHTML = "Y: " + Y;
                } catch (err) {
                    console.error(err);
                }
            }

            initialLoopInterval = setInterval(initialLoop, 1000/FPS);

            startButton.onclick = function () {
                if (start === false) {
                    start = true;
                    startButton.innerHTML = 'Stop';
                    clearInterval(initialLoopInterval);

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

                    processVideoInterval = setInterval(processVideo, 1000/FPS);
                } else {
                    start = false;
                    startButton.innerHTML = 'Start';
                    clearInterval(processVideoInterval);
                    initialLoopInterval = setInterval(initialLoop, 1000/FPS);
                }
            }
        });
    });
}