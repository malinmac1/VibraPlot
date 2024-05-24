// Assigning HTML elements to variables
const video = document.querySelector('#videoInput');
const videoSelect = document.querySelector('#videoSelect');

// Getting all video devices
navigator.mediaDevices.enumerateDevices()
    .then(devices => {
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        videoDevices.forEach(videoDevice => {
            const option = document.createElement('option');
            option.value = videoDevice.deviceId;
            option.text = videoDevice.label || `Camera ${videoSelect.length + 1}`;
            videoSelect.appendChild(option);
        });
    });

// Function to get video stream
function getVideo(deviceId) {
    navigator.mediaDevices.getUserMedia({ video: { deviceId: deviceId } })
        .then(stream => {
            video.srcObject = stream;
            video.onloadedmetadata = (event) => {
                video.width = visualViewport.width / 5;
                video.height = video.width * (video.videoHeight / video.videoWidth);
                video.play();
            };
        })
        .catch(() => {
            alert('You have to allow camera access to use this feature.');
        });
}

// Initial function call
getVideo();

// Changing video stream when a new video device is selected
videoSelect.onchange = () => {
    getVideo(videoSelect.value);
};