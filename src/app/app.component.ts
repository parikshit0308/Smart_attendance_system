import { Component } from '@angular/core';

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
    }

    if(event == "ShowSignUp"){
      this.signIn = false;
      this.signUp = true;
    }
  }
}
