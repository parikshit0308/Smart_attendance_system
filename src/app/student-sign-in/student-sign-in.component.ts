import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-student-sign-in',
  templateUrl: './student-sign-in.component.html',
  styleUrls: ['./student-sign-in.component.scss']
})
export class StudentSignInComponent implements OnInit {

  signInForm!: FormGroup;

  @Output() NextBtnClick = new EventEmitter<string>();

  constructor(private fb: FormBuilder, private router: Router) {}

  ngOnInit(): void {
    this.signInForm = this.fb.group({
      studentEmail: ['', [Validators.required, Validators.email]],
      studentPassword: ['', Validators.required]
    });
  }

  // Sign-in logic
  onSignIn(): void {
    if (this.signInForm.invalid) {
      alert('Please fill out the form correctly.');
      return;
    }

    const { studentEmail, studentPassword } = this.signInForm.value;
    const storedStudentInfo = sessionStorage.getItem('studentInfo');
    
    if (storedStudentInfo) {
      const studentInfo = JSON.parse(storedStudentInfo);
      if (studentEmail === studentInfo.email && studentPassword === studentInfo.password) {
        alert('Successfully logged in!');
        this.router.navigate(['/dashboard']);
      } else {
        alert('Invalid email or password!');
      }
    } else {
      alert('No account found. Please sign up first!');
    }
  }

  // Navigate to Sign-Up page
  onSignUp(): void {
    this.NextBtnClick.emit("ShowSignUp");
  }

  showCamera(): void {
    this.NextBtnClick.emit("ShowCamera");
  }

  // Optional: Add logic for Forgot Password
  onForgotPassword(): void {
    alert('Forgot Password logic will go here');
  }
}
