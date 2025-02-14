import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import * as faceapi from 'face-api.js';

@Component({
  selector: 'app-student-camera',
  templateUrl: './student-camera.component.html',
  styleUrls: ['./student-camera.component.scss']
})
export class StudentCameraComponent implements OnInit, OnDestroy {

  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  stream: MediaStream | null = null;
  selectedSession: string = '';
  availableSessions: string[] = ['8:40 Am-9:40 Am', '9:40 Am-10:40 Am', '11:00 Am-12:00 Pm', '12:00 Pm-13:00 Pm', '13:40 Pm-14:40 Pm', '14:40 Pm-15:40 Pm'];
  capturedImage: string | null = null;
  studentInfo: any = {};
  studentImages: string[] = [];

  constructor() {}

  async ngOnInit(): Promise<void> {
    // Load student info
    const storedStudentInfo = sessionStorage.getItem('studentInfo');
    if (storedStudentInfo) {
      this.studentInfo = JSON.parse(storedStudentInfo);
    }

    // Load uploaded student images from localStorage
    const storedImages = localStorage.getItem('studentImages');
    if (storedImages) {
      this.studentImages = JSON.parse(storedImages);
    }

    // Load Face-api.js models
    await this.loadFaceApiModels();
  }

  ngOnDestroy(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
  }

  // Load face recognition models
  async loadFaceApiModels() {
    await faceapi.nets.tinyFaceDetector.loadFromUri('/assets/models');
    await faceapi.nets.faceLandmark68Net.loadFromUri('/assets/models');
    await faceapi.nets.faceRecognitionNet.loadFromUri('/assets/models');
  }

  // Start camera
  async startCamera(): Promise<void> {
    if (this.videoElement) {
      try {
        if (this.stream) {
          this.stream.getTracks().forEach(track => track.stop());
        }

        const constraints: MediaStreamConstraints = {
          video: { facingMode: 'user' } 
        };
  
        this.stream = await navigator.mediaDevices.getUserMedia(constraints);
        this.videoElement.nativeElement.srcObject = this.stream;
        this.videoElement.nativeElement.play();
      } catch (error) {
        console.error('Error accessing camera:', error);
      }
    }
  }

  captureImage(): void {
    const video = this.videoElement.nativeElement;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      this.capturedImage = canvas.toDataURL('image/png');
    }
  }

  async compareImages(): Promise<void> {
    if (!this.capturedImage) {
      alert('Please capture an image first.');
      return;
    }

    const capturedImgElement = await this.createImageElement(this.capturedImage);
    if (!capturedImgElement) {
      alert('Error processing captured image.');
      return;
    }

    const capturedFaceDescriptor = await this.getFaceDescriptor(capturedImgElement);
    if (!capturedFaceDescriptor) {
      alert('No face detected in the captured image.');
      return;
    }

    let matchFound = false;

    for (const uploadedImage of this.studentImages) {
      const uploadedImgElement = await this.createImageElement(uploadedImage);
      if (!uploadedImgElement) continue;

      const uploadedFaceDescriptor = await this.getFaceDescriptor(uploadedImgElement);
      if (!uploadedFaceDescriptor) continue;

      const distance = faceapi.euclideanDistance(capturedFaceDescriptor, uploadedFaceDescriptor);
      console.log(`Face match distance: ${distance}`);

      if (distance < 0.5) { 
        matchFound = true;
        alert('Attendance Marked Successfully!');
        break;
      }
    }

    if (!matchFound) {
      alert('Face not recognized. Please try again.');
    }
  }

  private async createImageElement(base64: string): Promise<HTMLImageElement | null> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = base64;
      img.onload = () => resolve(img);
      img.onerror = reject;
    });
  }

  // Extract face descriptor from an image
  async getFaceDescriptor(image: HTMLImageElement): Promise<Float32Array | null> {
    const detections = await faceapi.detectSingleFace(image, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();
    return detections ? detections.descriptor : null;
  }
}
