import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentCameraComponent } from './student-camera.component';

describe('StudentCameraComponent', () => {
  let component: StudentCameraComponent;
  let fixture: ComponentFixture<StudentCameraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StudentCameraComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentCameraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
