import { OverlayModule } from '@angular/cdk/overlay';
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { StudentService } from 'src/app/core/services/student.service';
import { UserService } from 'src/app/core/services/user.service';
import { Student } from 'src/app/shared/interfaces/student.interface';

import { StudentsDetailsComponent } from './students-details.component';

describe('StudentsDetailsComponent', () => {
  let component: StudentsDetailsComponent;
  let fixture: ComponentFixture<StudentsDetailsComponent>;
  let studentService: StudentService;
  let userService: UserService;
  let router: Router;
  let route: ActivatedRoute;

  let user = {
    id: 1,
    username: 'admin',
    name: 'Rodrigo',
    lastname: 'Perez',
    rol: 'admin'
  };

  let mockStudent: Student = {
    "name": "Noelia",
    "lastname": "Trantow",
    "cursos": [],
    "id": 18
  };

  let mockCourse = {
    "course": "Angular",
    "professor": "Mandy Grant",
    "id": 1
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StudentsDetailsComponent],
      imports: [
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        RouterTestingModule,
        OverlayModule,
      ],
      providers: [
        StudentService,
        UserService,
        MatSnackBar,
      ],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentsDetailsComponent);
    component = fixture.componentInstance;
    studentService = TestBed.inject(StudentService);
    userService = TestBed.inject(UserService);
    router = TestBed.inject(Router);
    route = TestBed.inject(ActivatedRoute);

    spyOn(userService, 'getUserData').and.returnValue(
      of(user)
    );

    spyOn(studentService, 'getStudentById').and.returnValue(
      of(mockStudent)
    );

    spyOn(router, 'navigate').and.stub();

    component.ngOnInit();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get the user data when initialized', () => {
    expect(component.user).toBeTruthy();
    expect(component.user).toEqual(user);
  });

  it('should get the student details when is initialized', () => {
    expect(studentService.getStudentById).toHaveBeenCalled();
    expect(component.student).toBeTruthy();
    expect(component.student).toEqual(mockStudent);
  });

  it('should set studentToEdit and navigate to studentForm when onClickEdit is called', async () => {
    const editSpy = spyOn(studentService, 'setStudentToEdit').and.returnValue(Promise.resolve(true));
    component.onClickEdit();
    expect(editSpy).toHaveBeenCalledOnceWith(mockStudent);
    expect(await router.navigate).toHaveBeenCalledWith(['dashboard/students/studentform']);
  });

  it('Should delete student and navigate to students when onDeleteStudent is called', () => {
    const deleteSpy = spyOn(studentService, 'deleteStudentById').and.returnValue(
      of({
        "name": "Noelia",
        "lastname": "Trantow",
        "cursos": [],
        "id": 18
      })
    );
    component.onDeleteStudent();
    expect(deleteSpy).toHaveBeenCalledWith(18);
    expect(router.navigate).toHaveBeenCalledWith(['dashboard/students']);
  });

  it('should set studentToEdit and navigate to addInscription when onClickInscription is called', async () => {
    const editSpy = spyOn(studentService, 'setStudentToEdit').and.returnValue(Promise.resolve(true));
    component.onClickInscription();
    expect(editSpy).toHaveBeenCalledWith(mockStudent);
    expect(await router.navigate).toHaveBeenCalledWith(['dashboard/inscriptions/addinscription']);
  });

  it('should delete inscription and edit student when onDeleteInscription is called', () => {
    const editSpy = spyOn(studentService, 'editStudentById').and.returnValue(of(mockStudent));
    component.onDeleteInscription(mockCourse);
    expect(editSpy).toHaveBeenCalledWith(18, mockStudent);
  })
});
