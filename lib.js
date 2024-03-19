let video;
let videoInputSelect;
let startPlayerButton;
let webcamRunning;

async function onClickPlayerButton() {

  // Check if the video is ready
  if (video.readyState < 2) {
    console.log('Video is not ready.');
    return;
  }

  if (webcamRunning) {
    if (video.srcObject) {
      const tracks = video.srcObject.getTracks();
      tracks.forEach(track => track.stop()); // Stop each track
    }
    video.pause();
    video.srcObject = null;
    startPlayerButton.innerText = "START VIDEO PLAYER";
    webcamRunning = false;
  } else {
    // Your existing code to start the webcam
    startPlayerButton.innerText = "STOP VIDEO PLAYER";
    webcamRunning = true; // Update the flag to indicate the webcam is now running
  }

  // Let's start the video ! 
  video.play();

  setTimeout(processVideo);
}


async function onDocumentLoaded() {
  startPlayerButton = document.getElementById('startPlayer');
  canvasElement = document.getElementById("canvasOutput");
  startPlayerButton.addEventListener('click', onClickPlayerButton);
  canvasCtx = canvasElement.getContext("2d", { willReadFrequently: true });
  video = document.getElementById("videoInput");
  const liveView = document.getElementById("liveView");


  const selection = document.getElementById('selection');
  const videoSourceSelection = document.getElementById('videoSourceSelection');
  const fileInput = document.getElementById('fileInput');
  const videoElement = document.getElementById('videoInput');

  // Initially hide the training button
  startPlayerButton.style.display = 'none'; 

  document.querySelectorAll('input[name="selection"]').forEach(input => {
      input.addEventListener('change', function () {
          videoSourceSelection.style.display = 'block'; // Show video source selection
          startPlayerButton.style.display = 'none'; // Ensure training button is hidden until video source is chosen
      });
  });


  document.querySelectorAll('input[name="videoSource"]').forEach(input => {
      input.addEventListener('change', function () {
          // Here you can implement the logic to handle the video source choice,
          startPlayerButton.style.display = 'block';
          switch (this.value) {
            case 'file':
                console.log('Video input selected');
                if (videoInputSelect) {
                  videoInputSelect.style.display = 'none';
                }
                fileInput.click();
                break;
            case 'webcam':
                console.log('Webcam input selected');
                if (videoInputSelect) {
                  videoInputSelect.style.display = 'inline-block'; // Show existing dropdown
                } else {
                    listVideoInputDevices();
                    enableWebcam();
                }
                break;
            default:
                console.log('Unknown input selected');
        }
      });
  });

  fileInput.addEventListener('change', function() {
    if (this.files && this.files[0]) {
        const file = this.files[0];
        const fileURL = URL.createObjectURL(file);
        video.src = fileURL;
    }
  });
}


// Function to enable webcam and set it as ready
function enableWebcam(deviceId = null) {
  // If there's an existing video stream, stop it first
  if (video.srcObject) {
    video.srcObject.getTracks().forEach(track => track.stop());
  }

  const constraints = {
    video: deviceId ? { deviceId: { exact: deviceId } } : true
  };

  navigator.mediaDevices.getUserMedia(constraints).then(stream => {
    video.srcObject = stream;
    video.onloadedmetadata = () => {
      video.play(); // Ensure the video plays after setting the new source
      isWebcamReady = true;
    };
  }).catch(error => {
    console.error("Error accessing the webcam", error);
  });
}


async function listVideoInputDevices() {
  const devices = await navigator.mediaDevices.enumerateDevices();
  const videoInputDevices = devices.filter(device => device.kind === 'videoinput');

  videoInputSelect = document.getElementById('videoInputSelect');
  if (!videoInputSelect) {
    videoInputSelect = document.createElement('select');
    videoInputSelect.id = 'videoInputSelect';
    document.body.appendChild(videoInputSelect); // Add the select element to the DOM
    videoInputSelect.style.display = 'inline-block';
    
    videoInputSelect.addEventListener('change', () => {
      enableWebcam(videoInputSelect.value); // Use selected webcam
    });
  } else {
    videoInputSelect.innerHTML = ''; // Clear existing options if dropdown already exists
  }

  videoInputDevices.forEach((device, index) => {
    const option = document.createElement('option');
    option.value = device.deviceId;
    option.text = device.label || `Camera ${index+1}`;
    videoInputSelect.appendChild(option);
  });

  videoInputSelect.addEventListener('change', () => {
    if(webcamRunning) {
      enableWebcam(videoInputSelect.value); // Restart webcam with the new selected device
    }
  });
}



function displayVideoDetections(result) {
  // Remove any highlighting from previous frame.
  for (let child of children) {
    liveView.removeChild(child);
  }
  children.splice(0);
}

function processVideo() {
  let begin = Date.now();
  let startTimeMs = performance.now();
  if (lastVideoTime !== video.currentTime) {
    lastVideoTime = video.currentTime;
    let delay = 1000/FPS - (Date.now() - begin);

//    if (webcamRunning) {
      //window.requestAnimationFrame(processVideo);
      //Slow Down the rate
      setTimeout(function(){ //throttle requestAnimationFrame to 20fps
        window.requestAnimationFrame(processVideo);
      }, delay)
//    }
  }
}

document.addEventListener('DOMContentLoaded', onDocumentLoaded)
