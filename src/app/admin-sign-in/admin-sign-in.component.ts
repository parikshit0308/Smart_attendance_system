import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-admin-sign-in',
  templateUrl: './admin-sign-in.component.html',
  styleUrls: ['./admin-sign-in.component.scss']
})
export class AdminSignInComponent implements OnInit {
  @Output() NextBtnClick = new EventEmitter<string>();
  
  // Define the form group
  signInForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    // Initialize the form with form controls and validators
    this.signInForm = this.fb.group({
      adminEmail: ['', [Validators.required, Validators.email]],
      adminPassword: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  showSignUp() {
    const openSignUpPage = "showAdminSignup";
    this.NextBtnClick.emit(openSignUpPage);
  }

  onSignIn() {
    if (this.signInForm.invalid) {
      return; // Exit if form is invalid
    }

    const signInData = {
      email: this.signInForm.value.adminEmail,
      password: this.signInForm.value.adminPassword
    };
    
    console.log('Sign-In Data:', signInData);
    // Handle authentication or other sign-in logic here
  }
}
