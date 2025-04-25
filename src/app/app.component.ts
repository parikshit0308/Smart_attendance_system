import { Component } from '@angular/core';
import { flatMap } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'final-project';

  signIn: boolean = false;
  signUp: boolean = false;
  camera: boolean = false;
  adminList: boolean = false;
  adminView: boolean = false;
  adminAdd: boolean = false;
  adminSignUp: boolean = false;
  adminSignin: boolean = false

  ngOnInit(): void {
    this.signUp = true;
  }

  NextBtnClick(event: any): void{
    if(event == "showSignIn"){
      this.signIn = true;
      this.signUp = false;
    }

    if(event == "ShowCamera"){
      this.signIn = false;
      this.signUp = false;
      this.camera = true;
      this.adminList = false;
    }

    if(event == "ShowSignUp"){
      this.signIn = false;
      this.signUp = true;
    }

    if(event == "showAdminSignup"){
      this.adminSignUp= true;
      this.signUp = false;
      this.signIn = false;
      this.adminSignin = false;
    }

    if(event == "showAdminSignIn"){
      this.adminSignin = true;
      this.adminSignUp = false;
    }

    if(event == "showList"){
      this.adminList = true;
      this.adminView = false;
      this.adminAdd = false;
      this.adminSignUp = false;
      this.adminSignin = false;
      this.camera = false;
    }

    if(event == "showAdd"){
      this.adminAdd = true;
      this.adminView = false;
      this.adminList = false;
      this.adminSignUp = false;
      this.adminSignin = false;
    }

    if(event == "showView"){
      this.adminAdd = false;
      this.adminView = true;
      this.adminList = false;
      this.adminSignUp = false;
      this.adminSignin = false;
    }
  }
}
