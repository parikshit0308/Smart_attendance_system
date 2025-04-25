import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StudentCameraComponent } from './student-camera/student-camera.component';
import { StudentSignInComponent } from './student-sign-in/student-sign-in.component';
import { StudentSignUpComponent } from './student-sign-up/student-sign-up.component';
import { AdminSignInComponent } from './admin-sign-in/admin-sign-in.component';
import { AdminSignUpComponent } from './admin-sign-up/admin-sign-up.component';
import { AdminListComponent } from './admin-list/admin-list.component';
import { AdminAddComponent } from './admin-add/admin-add.component';
import { StudentAuthGuard } from './auth/student-auth.guard';
import { AdminViewComponent } from './admin-view/admin-view.component';

const routes: Routes = [
  { path: '', redirectTo: 'student-sign-in', pathMatch: 'full' },
  { path: 'student-sign-in', component: StudentSignInComponent },
  { path: 'student-sign-up', component: StudentSignUpComponent },
  { path: 'student-camera', component: StudentCameraComponent, canActivate: [StudentAuthGuard] },
  { path: 'admin-sign-in', component: AdminSignInComponent },
  { path: 'admin-sign-up', component: AdminSignUpComponent },
  { path: 'admin-list', component: AdminListComponent },
  { path: 'admin-add', component: AdminAddComponent },
  { path: 'admin-view', component: AdminViewComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
