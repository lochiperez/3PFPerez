import { OverlayModule } from '@angular/cdk/overlay';
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { StudentService } from 'src/app/core/services/student.service';
import { Student } from 'src/app/shared/interfaces/student.interface';

import { StudentsFormComponent } from './students-form.component';

describe('StudentsFormComponent', () => {
  let component: StudentsFormComponent;
  let fixture: ComponentFixture<StudentsFormComponent>;
  let studentService: StudentService;
  let router: Router;

  let student: Student = {
    "name": "Noelia",
    "lastname": "Trantow",
    "cursos": [],
    "id": 18
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StudentsFormComponent],
      imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        RouterTestingModule,
        OverlayModule,
      ],
      providers: [
        StudentService,
        MatSnackBar,
      ],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentsFormComponent);
    component = fixture.componentInstance;
    studentService = TestBed.inject(StudentService);
    router = TestBed.inject(Router);
    fixture.detectChanges();

    spyOn(studentService, 'getStudentToEdit').and.returnValue(
      of(student)
    )
    spyOn(router, 'navigate').and.stub();

    component.ngOnInit();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create a form using formbuilder', () => {
    expect(component.studentForm instanceof FormGroup).toBeTruthy();
  });

  it('should get studentToEdit when initialized', () => {
    expect(component.studentToEdit).toBeTruthy();
    expect(component.studentToEdit).toEqual(student);
  });

  it('should call addStudent when onSubmit is called with new student and navigate to students', async () => {
    const addSpy = spyOn(studentService, 'addStudent').and.returnValue(
      of({
        "name": "Shanie",
        "lastname": "Heathcote",
        "cursos": [],
        "id": 9
      })
    );
    component.studentToEdit = null;
    component.onSubmit();
    expect(addSpy).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledOnceWith(['dashboard/students']);
  });

  it('should call editStudentById when onSubmit is called with an edited student and then navigate to students', () => {
    const editSpy = spyOn(studentService, 'editStudentById').and.returnValue(
      of({
        "name": "Shanie",
        "lastname": "Heathcote",
        "cursos": [],
        "id": 9
      })
    );
    component.studentToEdit = student
    component.onSubmit();
    expect(editSpy).toHaveBeenCalledWith(student.id, student);
    expect(router.navigate).toHaveBeenCalledWith(['dashboard/students']);
  })
});
