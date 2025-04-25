import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Api_Service } from '../api-services.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-student-sign-in',
  templateUrl: './student-sign-in.component.html',
  styleUrls: ['./student-sign-in.component.scss']
})
export class StudentSignInComponent implements OnInit {
  signInForm!: FormGroup;
  @Output() NextBtnClick = new EventEmitter<string>();

  constructor(private fb: FormBuilder, private apiService: Api_Service, private toastr: ToastrService,private router: Router) {}

  ngOnInit(): void {
    this.signInForm = this.fb.group({
      studentEmail: ['', [Validators.required, Validators.email]],
      studentPassword: ['', Validators.required]
    });
  }

  onSignIn(): void {
    debugger
    if (this.signInForm.invalid) {
        this.toastr.error('Please fill out the form correctly.','Error');
      return;
    }

    const requestBody = {
      email: this.signInForm.value.studentEmail,
      password: this.signInForm.value.studentPassword
    };
    console.log("Login details",requestBody)
    this.apiService.signIn(requestBody).subscribe({
      next: (response) => {
        debugger
        console.log("Login details",response)
        this.toastr.success('Successfully logged in!','Success')
        sessionStorage.removeItem("studentInfo")
        localStorage.removeItem("studentInfo")
        sessionStorage.setItem('studentInfoForLogin', JSON.stringify({
          name: response.name,
          rollno: response.rollno,
          studentClass: response.studentClass,
          department: response.department,
          studentId: response.studentId
        }));
        this.showCamera();
      },
      error: (error) => {
        if (error.status === 400) {
          this.toastr.error('Invalid email or password!','Error');
        } else {
          this.toastr.error('Something went wrong. Please try again.', 'Error');
        }
      }
    });
  }

  onSignUp(): void {
    this.NextBtnClick.emit("ShowSignUp");
    this.router.navigate(['/student-sign-up']);
  }

  showCamera(): void {
    this.NextBtnClick.emit("ShowCamera");
    localStorage.setItem('studentToken', 'true');
    sessionStorage.setItem('studentToken', 'true');
    this.router.navigate(['/student-camera']);
  }
}
