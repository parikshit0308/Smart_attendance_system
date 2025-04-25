import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Api_Service } from '../api-services.service';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-admin-view',
  templateUrl: './admin-view.component.html',
  styleUrls: ['./admin-view.component.scss']
})
export class AdminViewComponent implements OnInit {
  totalAttendance: any;

  constructor(private apiService: Api_Service, private router: Router) {}

  studentDetails: any;
  attendanceSummary: any = {};
  uniqueDates: string[] = [];
  attendanceMap: { [key: string]: any } = {};  // For storing attendance based on subject & date
  subjectWiseMap: { [key: string]: any } = {};
  subjects: string[] = [];
  name: any
  roll: any
  objectKeys = Object.keys;

  ngOnInit(): void {
    setTimeout(() => {
      this.getStudentDetails()
    }, 100);

    this.name = sessionStorage.getItem("studentNameForview")
    this.roll = sessionStorage.getItem("studentRollForview")
  }

  getStudentDetails() {
    const getId = sessionStorage.getItem("studentIdForview");
    this.apiService.getAttendanceForAdmin(getId).subscribe(
      (response) => {
        this.studentDetails = response;
        console.log("------->",this.studentDetails)
        this.processAttendanceData(this.studentDetails?.attendanceRecords);
      },
      (err) => {
        console.log("Error getting student Details", err);
      }
    );
  }

 
  processAttendanceData(attendanceRecords: any[]) {
    let totalPresent = 0;
    let totalClasses = 0;

    attendanceRecords.forEach(record => {
      // Store unique dates and subjects
      if (!this.uniqueDates.includes(record.date)) {
        this.uniqueDates.push(record.date);
      }
      if (!this.subjects.includes(record.subject)) {
        this.subjects.push(record.subject);
      }

      // Create a mapping of subject -> date -> attendance status (1 or 0)
      if (!this.attendanceMap[record.date]) {
        this.attendanceMap[record.date] = {};
      }
      this.attendanceMap[record.date][record.subject] = record.Attendance_status ? 1 : 0;

      // Create a mapping for subject-wise attendance
      if (!this.subjectWiseMap[record.subject]) {
        this.subjectWiseMap[record.subject] = {};
      }
      this.subjectWiseMap[record.subject][record.date] = record.Attendance_status ? 1 : 0;

      // Calculate total attendance
      if (record.Attendance_status) {
        totalPresent++;
      }
      totalClasses++;
    });

    // Calculate percentage attendance
    this.totalAttendance = (totalPresent / totalClasses) * 100;
  }

  getAttendanceForSubject(subject: string, date: string): any {
    return this.subjectWiseMap[subject]?.[date];
  }
  
  generateExcel() {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.formatAttendanceForExcel());
    const workbook: XLSX.WorkBook = { Sheets: { 'Attendance': worksheet }, SheetNames: ['Attendance'] };
    XLSX.writeFile(workbook, 'attendance.xlsx');
  }

  // Format the attendance data for Excel
  formatAttendanceForExcel() {
    const formattedData: any[] = [];

    const header = {
      StudentName: this.studentDetails?.attendanceRecords[0]?.studentname,
      RollNo: this.studentDetails?.attendanceRecords[0]?.rollno,
    };
    formattedData.push(header);

    this.subjects.forEach(subject => {
      const row: any = { Subject: subject };
      this.uniqueDates.forEach(date => {
        row[date] = this.getAttendanceForSubject(subject, date) || 0;
      });
      formattedData.push(row);
    });
    return formattedData;
  }
  
  @Output() NextBtnClick = new EventEmitter<string>();
  close(){
    this.NextBtnClick.emit("showList");
    this.router.navigate(['/admin-list']);
  }

  // calculateAttendanceSummary(records: any[]) {
  //   const summary: any = {
  //     totalSessions: records.length,
  //     totalPresent: 0,
  //     attendanceByDate: {}
  //   };

  //   records.forEach((record: any) => {
  //     const date = record.date;

  //     if (record.Attendance_status) {
  //       summary.totalPresent++;
  //     }

  //     if (!summary.attendanceByDate[date]) {
  //       summary.attendanceByDate[date] = {
  //         sessions: 0,
  //         present: 0,
  //         records: []
  //       };
  //     }

  //     summary.attendanceByDate[date].sessions++;
  //     if (record.Attendance_status) {
  //       summary.attendanceByDate[date].present++;
  //     }

  //     summary.attendanceByDate[date].records.push(record);
  //   });

  //   this.attendanceSummary = summary;
  //   console.log("Summary:", this.attendanceSummary);
  // }
}
