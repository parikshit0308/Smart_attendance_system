import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Api_Service } from '../api-services.service';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-list',
  templateUrl: './admin-list.component.html',
  styleUrls: ['./admin-list.component.scss']
})
export class AdminListComponent implements OnInit {
  studentInfo: any = null;
  isAttendanceActive = false;
  selectedClass: string = '';
  currentPage: number = 1;
  filteredStudents: any[] = [];

  constructor(private apiService: Api_Service, private router: Router) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.fetchStudentList();
    }, 100);

    this.apiService.attendanceStatus$.subscribe(status => {
      this.isAttendanceActive = status;
    });
  }

  filterByClass(): void {
    if (!this.selectedClass || this.selectedClass === '') {
      this.filteredStudents = this.studentInfo;
    } else {
      this.filteredStudents = this.studentInfo.filter(
        (student: any) => (student.studentClass || student.class) === this.selectedClass
      );
    }
    this.currentPage = 1; // ✅ Reset to page 1 on filter
  }

  toggleAttendance() {
    if (this.isAttendanceActive) {
      this.apiService.stopAttendance();
      console.log("status",this.isAttendanceActive);
    } else {
      this.apiService.startAttendance();
      console.log("status",this.isAttendanceActive);
    }
  }

  fetchStudentList(): void {
    this.apiService.getStudentList().subscribe(
      (data) => {
        if (data && data.length > 0) {
          this.studentInfo = data;
          this.filteredStudents = this.studentInfo; 
          sessionStorage.setItem('studentInfo', JSON.stringify(this.studentInfo));
        } else {
          this.studentInfo = [];
          this.filteredStudents = [];
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
    this.router.navigate(['/admin-add']);
  }

  showCamera() {
    this.NextBtnClick.emit("ShowCamera");
  }


  editStudent(student: any): void {
    console.log("Edit Student:", student);
  }
}
