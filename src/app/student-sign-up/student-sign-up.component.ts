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
    const storedImages = sessionStorage.getItem('uploadedImages');
    if (storedImages) {
      this.uploadedImages = JSON.parse(storedImages);
    }
  }

  showCamera() {
    const openRoleAccess = "ShowCamera";
    this.NextBtnClick.emit(openRoleAccess);
  }

  showSignIn() {
    const openRoleAccess = "showSignIn";
    this.NextBtnClick.emit(openRoleAccess);
  }

  AdminSignUp() {
    const openRoleAccess = "showAdminSignup";
    this.NextBtnClick.emit(openRoleAccess);
  }

  // Handle file input for image uploads
  handleFileInput(event: any): void {
    const files = event.target.files;
    if (files && files.length <= 3) {
      this.uploadedImages = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageUrl = e.target?.result as string;
          this.uploadedImages.push(imageUrl);
        };
        reader.readAsDataURL(file);
      }
      sessionStorage.setItem('uploadedImages', JSON.stringify(this.uploadedImages));
    } else {
      alert('You can upload a maximum of 3 photos.');
    }
  }

  onSubmit(): void {
    if (this.signUpForm.invalid || this.uploadedImages.length === 0) {
      alert('Please fill all required fields and upload at least one image.');
      return;
    }

    const studentInfo = this.signUpForm.value;
    studentInfo.uploadedImages = this.uploadedImages;

    sessionStorage.setItem('studentInfo', JSON.stringify(studentInfo));
    console.log('Student Info Stored:', studentInfo);

    alert('Student Sign-Up Successful!');
  }
}
