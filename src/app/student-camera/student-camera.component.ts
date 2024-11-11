import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-student-camera',
  templateUrl: './student-camera.component.html',
  styleUrls: ['./student-camera.component.scss']
})
export class StudentCameraComponent implements OnInit, OnDestroy {

  @ViewChild('videoElement') videoElement: ElementRef<HTMLVideoElement> | undefined;
  stream: MediaStream | null = null;
  currentFacingMode: string = 'user'; // Default is front-facing camera (selfie mode)
  selectedSession: string = '';
  availableSessions: string[] = ['8:40 Am-9:40 Am', '9:40 Am-10:40 Am', '11:00 Am-12:00 Pm', '12:00 Pm-13:00 Pm', '13:40 Pm-14:40 Pm', '14:40 Pm-15:40 Pm'];
  capturedImage: string | null = null;
  studentInfo: any = {};

  // Store uploaded images from sessionStorage
  studentImages: string[] = [];

  constructor() { }

  ngOnInit(): void {

    const storedStudentInfo = sessionStorage.getItem('studentInfo');
    console.log('Stored student info from sessionStorage:', storedStudentInfo);

    if (storedStudentInfo) {
      // Parse the student info and assign it to the studentInfo object
      this.studentInfo = JSON.parse(storedStudentInfo);
      console.log('Parsed student info:', this.studentInfo); // Debugging step
    }
    // Load uploaded images from sessionStorage (studentImages key)
    const storedImages = sessionStorage.getItem('studentImages');
    if (storedImages) {
      this.studentImages = JSON.parse(storedImages); // Array of images
    }
  }

  ngOnDestroy(): void {
    // Clean up: stop all tracks when the component is destroyed
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
  }

  // Start the camera with the front-facing camera (selfie mode)
  startCamera(): void {
    if (this.videoElement) {
      const video: HTMLVideoElement = this.videoElement.nativeElement;

      // Request front-facing camera (selfie mode) stream
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
        .then((stream) => {
          this.stream = stream;
          video.srcObject = stream;
          video.play();

          // Apply a mirror effect (flip horizontally) for front camera (selfie mode)
          video.style.transform = 'scaleX(-1)';
        })
        .catch((err) => {
          console.error('Error accessing the camera: ', err);
        });
    }
  }

  // Capture image from the video feed and store it
  captureImage(): void {
    if (this.videoElement) {
      const video: HTMLVideoElement = this.videoElement.nativeElement;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        this.capturedImage = canvas.toDataURL('image/png'); // Store the captured image as base64 string
      }
    }
  }

  // Compare the uploaded images from sessionStorage with the captured image
  compareImages(): void {
    const capturedImage = this.capturedImage;

    if (this.studentImages.length > 0 && capturedImage) {
      const capturedImg = new Image();
      capturedImg.src = capturedImage;

      capturedImg.onload = () => {
        let matchFound = false;

        // Loop through each uploaded image to compare with the captured image
        for (const uploadedImage of this.studentImages) {
          const uploadedImg = new Image();
          uploadedImg.src = uploadedImage;

          uploadedImg.onload = () => {
            const isMatch = this.compareImagePixels(uploadedImg, capturedImg);
            if (isMatch) {
              matchFound = true;
              console.log('Images match!');
            }
          };
        }

        if (!matchFound) {
          console.log('No matching images found.');
        }
      };
    } else {
      console.log('No student images or captured image found in session storage.');
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
