import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AdminViewComponent } from './admin-view/admin-view.component';
import { AdminAddComponent } from './admin-add/admin-add.component';
import { AdminListComponent } from './admin-list/admin-list.component';
import { StudentCameraComponent } from './student-camera/student-camera.component';
import { StudentSignUpComponent } from './student-sign-up/student-sign-up.component';
import { StudentSignInComponent } from './student-sign-in/student-sign-in.component';

@NgModule({
  declarations: [
    AppComponent,
    AdminViewComponent,
    AdminAddComponent,
    AdminListComponent,
    StudentCameraComponent,
    StudentSignUpComponent,
    StudentSignInComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgSelectModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
