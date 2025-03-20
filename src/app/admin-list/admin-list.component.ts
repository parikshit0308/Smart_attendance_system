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
  totalCount: any;

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
    this.totalCount = this.filteredStudents.length;
    this.currentPage = 1;
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
    debugger
    this.apiService.getStudentList().subscribe(
      (data) => {
        debugger
        if (data && data.length > 0) {
          this.studentInfo = data;
          this.filteredStudents = this.studentInfo; 
          console.log(this.filteredStudents)
          this.totalCount = this.filteredStudents.length;
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
    let studentsToExport = [];
  
    if (!this.selectedClass || this.selectedClass === '') {
      studentsToExport = this.studentInfo;
    } else {
      studentsToExport = this.studentInfo.filter(
        (student: any) => (student.studentClass || student.class) === this.selectedClass
      );
    }
  
    studentsToExport.sort((a: any, b: any) => Number(a.rollno) - Number(b.rollno));
  
    const worksheet = XLSX.utils.json_to_sheet(studentsToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
  
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  
    const fileName = this.selectedClass ? `${this.selectedClass}_Students.xlsx` : `All_Students.xlsx`;
    saveAs(blob, fileName);
  }
  

  @Output() NextBtnClick = new EventEmitter<string>();

  showAdd() {
    this.NextBtnClick.emit("showAdd");
    this.router.navigate(['/admin-add']);
  }

  editStudent(student: any): void {
    console.log("Edit Student:", student);
  }

  showCamera(){
    this.router.navigate(['/student-camera'])
  }
}
