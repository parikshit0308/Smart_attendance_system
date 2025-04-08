import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { NgxPaginationModule } from 'ngx-pagination';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AdminViewComponent } from './admin-view/admin-view.component';
import { AdminAddComponent } from './admin-add/admin-add.component';
import { AdminListComponent } from './admin-list/admin-list.component';
import { StudentCameraComponent } from './student-camera/student-camera.component';
import { StudentSignUpComponent } from './student-sign-up/student-sign-up.component';
import { StudentSignInComponent } from './student-sign-in/student-sign-in.component';
import { AdminSignUpComponent } from './admin-sign-up/admin-sign-up.component';
import { AdminSignInComponent } from './admin-sign-in/admin-sign-in.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    AdminViewComponent,
    AdminAddComponent,
    AdminListComponent,
    StudentCameraComponent,
    StudentSignUpComponent,
    StudentSignInComponent,
    AdminSignUpComponent,
    AdminSignInComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgSelectModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot({
      positionClass: 'toast-top-right',
      timeOut: 3000, 
      progressBar: true,
    }),
    NgxPaginationModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
