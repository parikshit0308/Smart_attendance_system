import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-student-sign-up',
  templateUrl: './student-sign-up.component.html',
  styleUrls: ['./student-sign-up.component.scss']
})
export class StudentSignUpComponent implements OnInit {

  @Output() NextBtnClick = new EventEmitter<string>();

  signUpForm!: FormGroup;
  uploadedImages: string[] = [];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    // Initialize form with validation
    this.signUpForm = this.fb.group({
      studentName: ['', Validators.required],
      studentEmail: ['', [Validators.required, Validators.email]],
      studentPhone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      studentRollNo: ['', Validators.required],
      studentClass: ['', Validators.required],
      studentDepartment: ['', Validators.required],
      studentPassword: ['', [Validators.required, Validators.minLength(8)]],
      isAdmin: [false],
    });
    // Load previously uploaded images from localStorage
    const storedImages = localStorage.getItem('studentImages');
    if (storedImages) {
      this.uploadedImages = JSON.parse(storedImages);
    }
  }

  // Navigate to camera component
  showCamera() {
    this.NextBtnClick.emit("ShowCamera");
  }

  // Navigate to sign-in component
  showSignIn() {
    this.NextBtnClick.emit("showSignIn");
  }

  // Navigate to admin sign-up
  AdminSignUp() {
    this.NextBtnClick.emit("showAdminSignup");
  }

  // Handle file input for image uploads (max 3 images)
  handleFileInput(event: any): void {
    const files = event.target.files;
    if (files && files.length > 3) {
      alert('You can upload a maximum of 3 photos.');
      return;
    }
    
    this.uploadedImages = []; // Clear previous images
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        this.uploadedImages.push(imageUrl);
      };
      reader.readAsDataURL(file);
    }

    // Store images in localStorage
    localStorage.setItem('studentImages', JSON.stringify(this.uploadedImages));
  }

  // Submit form
  onSubmit(): void {
    if (this.signUpForm.invalid || this.uploadedImages.length === 0) {
      alert('Please fill all required fields and upload at least one image.');
      return;
    }

    const studentInfo = this.signUpForm.value;
    sessionStorage.setItem('studentInfo', JSON.stringify(studentInfo));
    localStorage.setItem('studentInfo', JSON.stringify(studentInfo));
    localStorage.setItem('studentImages', JSON.stringify(this.uploadedImages));

    alert('Student Sign-Up Successful!');
    this.showCamera();
  }
}