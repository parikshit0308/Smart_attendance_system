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

  onSignIn(): void {
    if (this.signInForm.invalid) {
      alert('Please fill out the form correctly.');
      return;
    }

    const { studentEmail, studentPassword } = this.signInForm.value;
    const storedStudentInfo = sessionStorage.getItem('studentInfo');
    
    if (storedStudentInfo) {
      const studentInfo = JSON.parse(storedStudentInfo);
      // Ensure the correct keys for student email and password
      if (studentEmail === studentInfo.studentEmail && studentPassword === studentInfo.studentPassword) {
        alert('Successfully logged in!');
        this.showCamera();
      } else {
        alert('Invalid email or password!');
      }
    } else {
      alert('No account found. Please sign up first!');
    }
  }

  onSignUp(): void {
    this.NextBtnClick.emit("ShowSignUp");
  }

  showCamera(): void {
    this.NextBtnClick.emit("ShowCamera");
  }
}
