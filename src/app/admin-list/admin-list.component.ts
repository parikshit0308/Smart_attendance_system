import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-admin-list',
  templateUrl: './admin-list.component.html',
  styleUrls: ['./admin-list.component.scss']
})
export class AdminListComponent implements OnInit {
  studentInfo: any = null;

  ngOnInit(): void {
    this.fetchStudentFromSessionStorage();
  }

  

  fetchStudentFromSessionStorage(): void {
    const storedStudent = sessionStorage.getItem('studentInfo');
    if (storedStudent) {
      this.studentInfo = JSON.parse(storedStudent);
    } else {
      console.log('No student data found in sessionStorage.');
    }
  }

  @Output() NextBtnClick = new EventEmitter<string>();

  showAdd(){
    this.NextBtnClick.emit("showAdd");
  }

editStudent(student: any): void {
    // Logic to edit the selected student, possibly open a form with details
    console.log("Edit Student:", student);
}
}
