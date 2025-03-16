import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StudentAuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {
    const isStudentAuthenticated = !!localStorage.getItem('studentToken');
    if (isStudentAuthenticated) {
      return true;
    } else {
      this.router.navigate(['/student-sign-in']);
      return false;
    }
  }
  
}
