import { Component, OnInit, OnDestroy, ViewChild, ElementRef, EventEmitter, Output } from '@angular/core';
import * as faceapi from 'face-api.js';
import { Api_Service } from '../api-services.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

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
  isAttendanceEnabled = false;
  isAttendanceActive = false;
  selectedSubjects: any
  studentId: any;
  availableSubjects: string[] = [];
  selectedSubject: string = '';

  allowedLatitude = 18.5401344
  allowedLongitude = 73.8295808;
  allowedRadius = 500;
  capturedFaceDescriptor: any;

  constructor(private apiService: Api_Service, private toastr: ToastrService, private router: Router) {  }
  @Output() NextBtnClick = new EventEmitter<string>();

  async ngOnInit(): Promise<void> {
    const storedStudentInfo = localStorage.getItem('studentInfo');
    if (storedStudentInfo) {
      this.studentInfo = JSON.parse(localStorage.getItem('studentInfo') || '{}');
      console.log("----------------->",this.studentInfo)
    }

    // sessionStorage.clear();

    const storedSubjects = sessionStorage.getItem('selectedSubjects');
    if (storedSubjects) {
      this.selectedSubjects = JSON.parse(sessionStorage.getItem('selectedSubjects') || '{}');
      console.log("subjects",this.selectedSubjects)
    }
    
    const storedImages = localStorage.getItem('studentImages');
    if (storedImages) {
      this.studentImages = JSON.parse(storedImages);
    }

    this.apiService.attendanceStatus$.subscribe(status => {
      this.isAttendanceActive = status; // ✅ Updates button visibility dynamically
      console.log("Status",this.isAttendanceActive);
    });

    const storedData = sessionStorage.getItem('selectedSubjects');
    if (storedData) {
      this.selectedSubjects = JSON.parse(storedData);
    }

    this.studentId = sessionStorage.getItem("StudentID");

    await this.loadFaceApiModels();
  }

  stringifySubjects(obj: any): string {
    return JSON.stringify(obj);
  }

  ngOnDestroy(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
  }

  async loadFaceApiModels() {
    await faceapi.nets.tinyFaceDetector.loadFromUri('/assets/models');
    await faceapi.nets.faceLandmark68Net.loadFromUri('/assets/models');
    await faceapi.nets.faceRecognitionNet.loadFromUri('/assets/models');
    console.log("Face API Models Loaded");
  }

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

  async captureImage(): Promise<void> {
    const video = this.videoElement.nativeElement;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
  
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      this.capturedImage = canvas.toDataURL('image/png');
  
      const capturedImgElement = await this.createImageElement(this.capturedImage);
      if (!capturedImgElement) {
        this.toastr.error('Error processing captured image.', 'Error');
        return;
      }
  
      const capturedFaceDescriptor = await this.getFaceDescriptor(capturedImgElement);
      if (!capturedFaceDescriptor) {
        this.toastr.error("No face detected in the captured image", 'Error');
        return;
      }
  
      this.capturedFaceDescriptor = capturedFaceDescriptor; // save it for comparison later
      console.log("Face descriptor generated in captureImage()");
    }
  }
  

  // async compareImages(): Promise<void> {
  //   if (!this.capturedImage) {
  //     this.toastr.warning('Please capture an image first.', 'Warning');
  //     return;
  //   }

  //   const locationAllowed = await this.isWithinAllowedLocation();
  //   if (!locationAllowed) {
  //     this.toastr.error('You are outside the allowed location. Attendance not marked.', 'Location Error');
  //     return;
  //   }

  //   const capturedImgElement = await this.createImageElement(this.capturedImage);
  //   if (!capturedImgElement) {
  //     this.toastr.error('Error processing captured image.', 'Error');
  //     return;
  //   }

  //   const capturedFaceDescriptor = await this.getFaceDescriptor(capturedImgElement);
  //   if (!capturedFaceDescriptor) {
  //     this.toastr.error("No face detected in the captured image", 'Error');
  //     return;
  //   }

  //   let matchFound = false;

  //   for (const uploadedImage of this.studentImages) {
  //     const uploadedImgElement = await this.createImageElement(uploadedImage);
  //     if (!uploadedImgElement) continue;

  //     const uploadedFaceDescriptor = await this.getFaceDescriptor(uploadedImgElement);
  //     if (!uploadedFaceDescriptor) continue;

  //     const distance = faceapi.euclideanDistance(capturedFaceDescriptor, uploadedFaceDescriptor);
  //     console.log(`Face match distance: ${distance}`);

  //     if (distance < 0.5) {
  //       matchFound = true;
  //       this.toastr.success('Attendance Marked Successfully', 'Success');
  //       break;
  //     }
  //   }

  //   if (!matchFound) {
  //     this.toastr.error('Face not recognized. Please try again.', 'Error');
  //   }
  // }

  async compareImages(): Promise<void> {
    debugger
    if (!this.capturedImage || !this.capturedFaceDescriptor) {
      this.toastr.warning('Please capture an image first.', 'Warning');
      return;
    }
  
    const locationAllowed = await this.isWithinAllowedLocation();
    if (!locationAllowed) {
      this.toastr.error('You are outside the allowed location. Attendance not marked.', 'Location Error');
      return;
    }
  
    let matchFound = false;
  
    for (const uploadedImage of this.studentImages) {
      const uploadedImgElement = await this.createImageElement(uploadedImage);
      if (!uploadedImgElement) continue;
  
      const uploadedFaceDescriptor = await this.getFaceDescriptor(uploadedImgElement);
      if (!uploadedFaceDescriptor) continue;
  
      const distance = faceapi.euclideanDistance(this.capturedFaceDescriptor, uploadedFaceDescriptor);
      console.log(`Face match distance: ${distance}`);
  
      if (distance < 1.5) {
        matchFound = true;
  
        const attendanceData = {
          studentId: this.studentId,
          session: this.selectedSession,
          Attendance_status: true,
          date: new Date().toISOString().split('T')[0],
          rollno: this.studentInfo?.studentRollNo,
          studentname: this.studentInfo?.studentName,
          subject: this.selectedSubjects?.[this.studentInfo?.studentClass] || 'N/A'
        };
  
        console.log("Sending Attendance Data:", attendanceData);
  
        this.apiService.markAttendance(attendanceData).subscribe({
          next: () => {
            this.toastr.success('Attendance Marked Successfully', 'Success');
          },
          error: (err) => {
            console.error(err);
            this.toastr.error('Error saving attendance. Please try again.', 'Error');
          }
        });
  
        break;
      }
    }
  
    if (!matchFound) {
      this.toastr.error('Face not recognized. Please try again.', 'Error');
    }
  }
  
  

  private async createImageElement(base64: string): Promise<HTMLImageElement | null> {
    debugger
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = base64;
      img.onload = () => resolve(img);
      img.onerror = reject;
    });
  }

  async getFaceDescriptor(image: HTMLImageElement): Promise<Float32Array | null> {
    debugger
    const detections = await faceapi.detectSingleFace(image, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();
    return detections ? detections.descriptor : null;
  }
 private async isWithinAllowedLocation(): Promise<boolean> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        this.toastr.error('Geolocation is not supported by this browser.', 'Error');
        resolve(false);
      }

      navigator.geolocation.getCurrentPosition(position => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        const distance = this.getDistanceFromLatLonInMeters(this.allowedLatitude, this.allowedLongitude, userLat, userLng);
        console.log('User Location Distance:', distance);
        resolve(distance <= this.allowedRadius);
      }, error => {
        this.toastr.error('Error getting location. Please allow location access.', 'Error');
        resolve(false);
      });
    });
  }

  private getDistanceFromLatLonInMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  showList(){
    this.router.navigate(['/admin-list'])
  }
}
