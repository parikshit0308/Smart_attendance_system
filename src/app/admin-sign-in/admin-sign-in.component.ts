import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Api_Service } from '../api-services.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-sign-in',
  templateUrl: './admin-sign-in.component.html',
  styleUrls: ['./admin-sign-in.component.scss']
})
export class AdminSignInComponent implements OnInit {
  @Output() NextBtnClick = new EventEmitter<string>();
  signInForm!: FormGroup;

  constructor(private fb: FormBuilder, private apiService: Api_Service,private router: Router) {}

  ngOnInit(): void {
    this.signInForm = this.fb.group({
      adminEmail: ['', [Validators.required, Validators.email]],
      adminPassword: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  onSignIn() {
    debugger
    if (this.signInForm.invalid) {
      alert('Please fill out the form correctly.');
      return;
    }

    const requestBody = {
      email: this.signInForm.value.adminEmail,
      password: this.signInForm.value.adminPassword
    };

    this.apiService.signInAdmin(requestBody).subscribe({
      next: (response) => {
        alert('Admin logged in successfully!');
        this.showList();
      },
      error: (error) => {
        if (error.status === 400) {
          alert('Invalid email or password!');
        } else {
          alert('Something went wrong. Please try again.');
        }
      }
    });
  }

  showSignUp() {
    this.NextBtnClick.emit("showAdminSignup");
    this.router.navigate(['/admin-sign-up']);
  }

  showList() {
    this.NextBtnClick.emit("showList");
    this.router.navigate(['/admin-list']);
  }
}
