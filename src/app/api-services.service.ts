import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class Api_Service {
  private apiUrl = 'https://37404yao55.execute-api.ap-south-1.amazonaws.com/stage/student-sign-up';
  private adminURL = 'https://37404yao55.execute-api.ap-south-1.amazonaws.com/stage/admin-sign-up';
  private studentLoginURL = 'https://37404yao55.execute-api.ap-south-1.amazonaws.com/stage/student-sign-in';
  private adminLoginURL = 'https://37404yao55.execute-api.ap-south-1.amazonaws.com/stage/admin-sign-in';
  private getStudentListURL = 'https://37404yao55.execute-api.ap-south-1.amazonaws.com/stage/studentlist';

  constructor(private http: HttpClient) {}

  signUp(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  signIn(data:any): Observable<any> {
    return this.http.post(this.studentLoginURL, data);
  }

  signUpAdmin(data: any): Observable<any> {
    return this.http.post(this.adminURL, data);
  }

  signInAdmin(data: any): Observable<any> {
    return this.http.post(this.adminLoginURL, data);
  }

  uploadImageToS3(imageData: any): Observable<any> {
    return this.http.post('https://gsmp.s3.amazonaws.com/${s3Key}', imageData);
  }

  getStudentList(): Observable<any> {
    return this.http.get<any>(this.getStudentListURL).pipe(
      map((response:any) => response.students || []) // Extract 'students' array safely
    );
  }

  private attendanceStatus = new BehaviorSubject<boolean>(false);
  attendanceStatus$ = this.attendanceStatus.asObservable();
  private timeoutId: any = null;

  startAttendance() {
    this.attendanceStatus.next(true);
    
    // Auto-stop after 7 minutes
    this.timeoutId = setTimeout(() => {
      this.stopAttendance();
    }, 7 * 60 * 1000);
  }

  stopAttendance() {
    this.attendanceStatus.next(false);
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}
