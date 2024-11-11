import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-admin-sign-up',
  templateUrl: './admin-sign-up.component.html',
  styleUrls: ['./admin-sign-up.component.scss']
})
export class AdminSignUpComponent implements OnInit {
  form!: FormGroup;

  @Output() NextBtnClick = new EventEmitter<string>();

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    // Define the form controls and validations
    this.form = this.fb.group({
      adminName: ['', Validators.required],
      adminPhone: [
        '',
        [Validators.required, Validators.pattern(/^\d{10}$/)]
      ],
      adminEmail: ['', [Validators.required, Validators.email]],
      adminPassword: [
        '',
        [Validators.required, Validators.minLength(8)]
      ],
      adminKey: ['', Validators.required],
      adminBranch: ['', Validators.required]
    });
  }

  // Handle form submission
  onSubmit(): void {
    if (this.form.invalid) {
      alert('Please fill in all required fields correctly.');
      return;
    }

    const adminInfo = this.form.value; // Get all form values
    sessionStorage.setItem('adminInfo', JSON.stringify(adminInfo));
    alert('Admin Sign-Up Successful!');
  }

  showSignIn() {
    this.NextBtnClick.emit('showAdminSignIn');
  }

  showList(){
    this.NextBtnClick.emit('showList');
  }
}
