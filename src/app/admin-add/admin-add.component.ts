import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-admin-add',
  templateUrl: './admin-add.component.html',
  styleUrls: ['./admin-add.component.scss']
})
export class AdminAddComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  newStudent = {
    studentName: '',
    studentEmail: '',
    studentDepartment: '',
    studentClass: '',
    studentPhone: '',
    studentRollNo: '',
    photoUrls: [] as string[] // Defining this as an array of strings
  };

  // Handle file selection and preview
  onFilesSelected(event: any): void {
    const files = event.target.files;
    if (files.length + this.newStudent.photoUrls.length > 3) {
      alert('You can upload a maximum of 3 photos.');
    } else {
      for (let i = 0; i < files.length; i++) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          // Add photo URL to the array
          if (this.newStudent.photoUrls.length < 3) {
            this.newStudent.photoUrls.push(e.target.result);
          }
        };
        reader.readAsDataURL(files[i]); // Convert file to base64 data URL
      }
    }
  }

  addStudent(): void {
    // Save the new student data to sessionStorage
    let students = JSON.parse(sessionStorage.getItem('students') || '[]');
    students.push(this.newStudent);
    sessionStorage.setItem('students', JSON.stringify(students));

    // Reset the form after submission
    this.newStudent = {
      studentName: '',
      studentEmail: '',
      studentDepartment: '',
      studentClass: '',
      studentPhone: '',
      studentRollNo: '',
      photoUrls: [] // Reset photo previews
    };

    alert('Student added successfully!');
  }

}
