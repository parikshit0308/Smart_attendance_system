import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';4
import { Api_Service } from '../api-services.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-student-sign-up',
  templateUrl: './student-sign-up.component.html',
  styleUrls: ['./student-sign-up.component.scss']
})
export class StudentSignUpComponent implements OnInit {

  @Output() NextBtnClick = new EventEmitter<string>();

  signUpForm!: FormGroup;
  uploadedImages: string[] = [];

  constructor(private fb: FormBuilder, private apiService: Api_Service, private toastr: ToastrService,private router: Router) {}

  ngOnInit(): void {
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
    // localStorage.clear();
    // sessionStorage.clear();
    const storedImages = localStorage.getItem('studentImages');
    if (storedImages) {
      this.uploadedImages = JSON.parse(storedImages);
    }
  }

  showCamera() {
    this.NextBtnClick.emit("ShowCamera");
    localStorage.setItem('studentToken', 'true');
    sessionStorage.setItem('studentToken', 'true');
    this.router.navigate(['/student-camera']);
  }

  showSignIn() {
    this.NextBtnClick.emit("showSignIn");
    this.router.navigate(['/student-sign-in']);
  }

  AdminSignUp() {
    this.NextBtnClick.emit("showAdminSignup");
    this.router.navigate(['/admin-sign-up']);
  }

  handleFileInput(event: any): void {
    const files = event.target.files;
    if (files && files.length > 3) {
      this.toastr.warning('You can upload a maximum of 3 photos.','Warning')
      return;
    }
    
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

    localStorage.setItem('studentImages', JSON.stringify(this.uploadedImages));
  }

  studentId: any;
  onSubmit(): void {
    debugger
    if (this.signUpForm.invalid || this.uploadedImages.length === 0) {
      this.toastr.error('Please fill all required fields and upload at least one image','Warning')
      return;
    }
    // Keeping your localStorage/sessionStorage logic as it is
    const studentInfo = this.signUpForm.value;
    sessionStorage.setItem('studentInfo', JSON.stringify(studentInfo));
    localStorage.setItem('studentInfo', JSON.stringify(studentInfo));
    localStorage.setItem('studentImages', JSON.stringify(this.uploadedImages));

    // Creating the object with backend's expected format
    const requestBody = {
      class: studentInfo.studentClass,
      department: studentInfo.studentDepartment,
      email: studentInfo.studentEmail,
      name: studentInfo.studentName,
      password: studentInfo.studentPassword,
      phoneno: studentInfo.studentPhone,
      rollno: studentInfo.studentRollNo,
      images: this.uploadedImages.map(image => image.split(',')[1]) // Extract only base64 string
    };

    console.log(requestBody)

    this.apiService.signUp(requestBody).subscribe({
      next: (response) => {
        debugger
        console.log(response)
        if(response.studentId){
          this.studentId = response.studentId
          sessionStorage.setItem("StudentID",this.studentId)
        }
        this.toastr.success('Student Sign-Up Successful!','Success')
        console.log(response);
        this.showCamera();
      },
      error: (error) => {
        this.toastr.error('Error during sign-up. Please try again.','Error')
        console.error(error);
      }
    });
  }
}