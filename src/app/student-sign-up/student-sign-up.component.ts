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
    // Initialize the sign-up form with validation
    this.signUpForm = this.fb.group({
      studentName: ['', Validators.required],
      studentEmail: ['', [Validators.required, Validators.email]],
      studentPhone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      studentRollNo: ['', Validators.required],
      studentClass: ['', Validators.required],
      studentDepartment: ['', Validators.required],
      studentPassword: ['', [Validators.required, Validators.minLength(8)]],
      isAdmin: [false]
    });

    // Load previously uploaded images if they exist in sessionStorage
    const storedImages = sessionStorage.getItem('studentImages');
    if (storedImages) {
      this.uploadedImages = JSON.parse(storedImages);
    }
  }

  // Navigate to camera component
  showCamera() {
    const openRoleAccess = "ShowCamera";
    this.NextBtnClick.emit(openRoleAccess);
  }

  // Navigate to sign-in component
  showSignIn() {
    const openRoleAccess = "showSignIn";
    this.NextBtnClick.emit(openRoleAccess);
  }

  // Admin Sign-Up logic
  AdminSignUp() {
    const openRoleAccess = "showAdminSignup";
    this.NextBtnClick.emit(openRoleAccess);
  }

  // Handle file input for image uploads (max 3 images)
  handleFileInput(event: any): void {
    const files = event.target.files;
    if (files && files.length <= 3) {
      this.uploadedImages = [];  // Reset the uploaded images array before adding new ones
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageUrl = e.target?.result as string;
          this.uploadedImages.push(imageUrl);
        };
        reader.readAsDataURL(file);
      }

      // Store the uploaded images separately in sessionStorage
      sessionStorage.setItem('studentImages', JSON.stringify(this.uploadedImages));
    } else {
      alert('You can upload a maximum of 3 photos.');
    }
  }

  // Submit the sign-up form
  onSubmit(): void {
    // Validate form and ensure at least one image is uploaded
    if (this.signUpForm.invalid || this.uploadedImages.length === 0) {
      alert('Please fill all required fields and upload at least one image.');
      return;
    }

    // Extract form data and store student info (without images)
    const studentInfo = this.signUpForm.value;
    studentInfo.uploadedImages = []; // Remove images from the studentInfo object

    // Store the student info in sessionStorage
    sessionStorage.setItem('studentInfo', JSON.stringify(studentInfo));

    // Store the images separately in sessionStorage
    sessionStorage.setItem('studentImages', JSON.stringify(this.uploadedImages));

    console.log('Student Info Stored:', studentInfo);
    console.log('Images Stored Separately:', this.uploadedImages);

    // Show success message and proceed to camera
    alert('Student Sign-Up Successful!');
    this.showCamera();
  }
}
