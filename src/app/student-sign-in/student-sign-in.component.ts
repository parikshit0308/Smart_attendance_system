import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router'; // If you want to navigate to another page after login

@Component({
  selector: 'app-student-sign-in',
  templateUrl: './student-sign-in.component.html',
  styleUrls: ['./student-sign-in.component.scss']
})
export class StudentSignInComponent implements OnInit {

  studentEmail: string = '';
  studentPassword: string = '';

  constructor(private router: Router) { }

  ngOnInit(): void {
    // Initialize the component (optional)
  }

  // Sign-in logic
  onSignIn(): void {
    // Retrieve stored student information from sessionStorage
    const storedStudentInfo = sessionStorage.getItem('studentInfo');
    
    if (storedStudentInfo) {
      const studentInfo = JSON.parse(storedStudentInfo);

      // Check if the entered email and password match the stored values
      if (this.studentEmail === studentInfo.email && this.studentPassword === studentInfo.password) {
        // Successfully logged in, navigate to the dashboard or home page
        alert('Successfully logged in!');
        this.router.navigate(['/dashboard']);  // Or any other route you prefer
      } else {
        alert('Invalid email or password!');
      }
    } else {
      alert('No account found. Please sign up first!');
    }
  }

  // Navigate to Sign-Up page
  @Output() NextBtnClick = new EventEmitter<string>();

  onSignUp(){
    let openroleacess="ShowSignUp";
    this.NextBtnClick.emit(openroleacess)
  }

  showCamera(){
    let openroleacess="ShowCamera"
    this.NextBtnClick.emit(openroleacess)
  }

  // Optional: Add logic for Forgot Password
  onForgotPassword(): void {
    alert('Forgot Password logic will go here');
  }
}
