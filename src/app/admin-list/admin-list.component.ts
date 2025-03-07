import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Api_Service } from '../api-services.service';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-admin-list',
  templateUrl: './admin-list.component.html',
  styleUrls: ['./admin-list.component.scss']
})
export class AdminListComponent implements OnInit {
  studentInfo: any = null;
  isAttendanceActive = false;

  constructor(private apiService: Api_Service) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.fetchStudentList();
    }, 100);

    this.apiService.attendanceStatus$.subscribe(status => {
      this.isAttendanceActive = status;
    });
  }

  toggleAttendance() {
    if (this.isAttendanceActive) {
      this.apiService.stopAttendance();
    } else {
      this.apiService.startAttendance();
    }
  }

  fetchStudentList(): void {
    debugger
    this.apiService.getStudentList().subscribe(
      (data) => {
        console.log("Students data",data)
        if (data && data.length > 0) {
          this.studentInfo = data

          console.log("Student info",this.studentInfo)
          sessionStorage.setItem('studentInfo', JSON.stringify(this.studentInfo));
        } else {
          console.log('No student data found.');
        }
      },
      (error) => {
        console.error('Error fetching students:', error);
      }
    );
  }


  exportToExcel(): void {
    const worksheet = XLSX.utils.json_to_sheet(this.studentInfo); // Convert JSON to worksheet
    const workbook = XLSX.utils.book_new(); // Create a new workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students'); // Append sheet

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' }); // Generate Excel buffer
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' }); // Convert to Blob

    saveAs(blob, 'StudentList.xlsx'); // Save file
  }

  @Output() NextBtnClick = new EventEmitter<string>();

  showAdd() {
    this.NextBtnClick.emit("showAdd");
  }

  showCamera() {
    this.NextBtnClick.emit("ShowCamera");
  }


  editStudent(student: any): void {
    console.log("Edit Student:", student);
  }
}
