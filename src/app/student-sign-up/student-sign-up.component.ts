import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-student-sign-up',
  templateUrl: './student-sign-up.component.html',
  styleUrls: ['./student-sign-up.component.scss']
})
export class StudentSignUpComponent implements OnInit {

  @Output() NextBtnClick = new EventEmitter<string>();

  showCamera(){
    let openroleacess="ShowCamera"
    this.NextBtnClick.emit(openroleacess)
  }

  showSignIn(){
    let openroleacess="showSignIn"
    this.NextBtnClick.emit(openroleacess)
  }

  uploadedImages: string[] = [];
  studentName: string = '';
  studentEmail: string = '';
  studentPhone: string = '';
  studentRollNo: string = '';
  studentClass: string = '';
  studentDepartment: string = '';
  studentPassword: string = '';  // Add the password field

  constructor() { }

  ngOnInit(): void {
    const storedImages = sessionStorage.getItem('uploadedImages');
    if (storedImages) {
      this.uploadedImages = JSON.parse(storedImages);
    }
  }

  // Handle image upload
  handleFileInput(event: any): void {
    const files = event.target.files;
    if (files) {
      // Limit to a maximum of 3 images
      if (files.length > 3) {
        alert('You can upload a maximum of 3 photos.');
        return;
      }

      // Clear the previous uploaded images
      this.uploadedImages = [];

      // Process each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        
        reader.onload = (e) => {
          const imageUrl = e.target?.result as string;

          // Store the image in the uploaded images array
          this.uploadedImages.push(imageUrl);
        };

        reader.readAsDataURL(file); // Convert file to base64
      }

      // Store the uploaded images in sessionStorage
      sessionStorage.setItem('uploadedImages', JSON.stringify(this.uploadedImages));
      console.log('Uploaded Images Stored:', this.uploadedImages);
    }
  }

  // Form submit
  onSubmit(): void {
    if (this.uploadedImages.length === 0) {
      alert('Please upload at least one image.');
      return;
    }

    // Store other student information in sessionStorage (optional)
    const studentInfo = {
      name: this.studentName,
      email: this.studentEmail,
      phone: this.studentPhone,
      rollNo: this.studentRollNo,
      studentClass: this.studentClass,
      department: this.studentDepartment,
      password: this.studentPassword // Store the password if needed
    };

    sessionStorage.setItem('studentInfo', JSON.stringify(studentInfo));
    console.log('Student Info Stored:', studentInfo);

    // Proceed with your logic for submitting the form
  }
}
