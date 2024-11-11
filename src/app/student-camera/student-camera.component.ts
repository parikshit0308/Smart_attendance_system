import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-student-camera',
  templateUrl: './student-camera.component.html',
  styleUrls: ['./student-camera.component.scss']
})
export class StudentCameraComponent implements OnInit, OnDestroy {

  videoElement: HTMLVideoElement | null = null;
  stream: MediaStream | null = null;
  currentFacingMode: string = 'user'; // Default: 'user' (front camera)

  constructor() { }

  ngOnInit(): void {
    // The camera will not start automatically, waiting for the button click
  }

  ngOnDestroy(): void {
    // Clean up: stop all tracks when the component is destroyed
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
  }

  // Start the camera with a given facing mode (called on button click)
  startCamera(): void {
    if (!this.videoElement) {
      this.videoElement = document.createElement('video');
      this.videoElement.width = 640;
      this.videoElement.height = 480;
      document.body.appendChild(this.videoElement); // Attach video to DOM
    }

    // Start the camera stream based on the default facing mode (front camera)
    this.getCameraStream(this.currentFacingMode);
  }

  // Capture image from the video and store it in sessionStorage
  captureImage(): void {
    if (this.videoElement) {
      const canvas = document.createElement('canvas');
      canvas.width = this.videoElement.videoWidth;
      canvas.height = this.videoElement.videoHeight;

      const context = canvas.getContext('2d');
      if (context) {
        // Apply mirroring transformation if the front camera (selfie mode) is being used
        if (this.currentFacingMode === 'user') {
          context.scale(-1, 1); // Flip horizontally (mirror effect)
          context.drawImage(this.videoElement, -canvas.width, 0, canvas.width, canvas.height); // Draw the video with the mirror effect
        } else {
          context.drawImage(this.videoElement, 0, 0, canvas.width, canvas.height); // Normal drawing for rear camera
        }

        // Get base64 string of the captured image
        const imageUrl = canvas.toDataURL('image/png');
        console.log('Captured image:', imageUrl);

        // Store the captured image in sessionStorage
        sessionStorage.setItem('capturedImage', imageUrl);

        // Optionally, display the captured image as feedback
        const img = document.createElement('img');
        img.src = imageUrl;
        document.body.appendChild(img);
      }
    }
  }

  // Request camera stream with a specified facing mode (front or rear camera)
  getCameraStream(facingMode: string): void {
    // Stop the existing stream before starting a new one
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }

    // Request media stream with the given facing mode (front or rear camera)
    navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: facingMode // 'user' (front) or 'environment' (rear)
      }
    })
    .then((stream: MediaStream) => {
      this.stream = stream;
      if (this.videoElement) {
        this.videoElement.srcObject = stream;
        this.videoElement.play(); // Start the video playback

        // Apply mirror effect for front camera (selfie mode)
        if (facingMode === 'user') {
          this.videoElement.style.transform = 'scaleX(-1)'; // Mirror the video horizontally (selfie effect)
        } else {
          this.videoElement.style.transform = ''; // Remove transformation for rear camera
        }
      }
    })
    .catch((err) => {
      console.error('Error accessing the camera: ', err);
    });
  }

  // Compare the uploaded and captured images
  compareImages(): void {
    const uploadedImage = sessionStorage.getItem('uploadedImage');
    const capturedImage = sessionStorage.getItem('capturedImage');
    
    if (uploadedImage && capturedImage) {
      // Convert the base64 to images for comparison
      const uploadedImg = new Image();
      const capturedImg = new Image();

      uploadedImg.src = uploadedImage;
      capturedImg.src = capturedImage;

      uploadedImg.onload = () => {
        capturedImg.onload = () => {
          const isMatch = this.compareImagePixels(uploadedImg, capturedImg);
          if (isMatch) {
            console.log('Images match!');
          } else {
            console.log('Images do not match.');
          }
        };
      };
    } else {
      console.log('Images not found in session storage.');
    }
  }

  // Compare pixel-by-pixel if the images match
  private compareImagePixels(image1: HTMLImageElement, image2: HTMLImageElement): boolean {
    const canvas1 = document.createElement('canvas');
    const canvas2 = document.createElement('canvas');
    const ctx1 = canvas1.getContext('2d');
    const ctx2 = canvas2.getContext('2d');

    if (ctx1 && ctx2) {
      canvas1.width = image1.width;
      canvas1.height = image1.height;
      canvas2.width = image2.width;
      canvas2.height = image2.height;

      ctx1.drawImage(image1, 0, 0);
      ctx2.drawImage(image2, 0, 0);

      const data1 = ctx1.getImageData(0, 0, image1.width, image1.height).data;
      const data2 = ctx2.getImageData(0, 0, image2.width, image2.height).data;

      // Compare pixel data
      for (let i = 0; i < data1.length; i++) {
        if (data1[i] !== data2[i]) {
          return false; // If any pixel doesn't match, return false
        }
      }

      return true; // If all pixels match, return true
    }

    return false; // If canvas context is not available, return false
  }
}
