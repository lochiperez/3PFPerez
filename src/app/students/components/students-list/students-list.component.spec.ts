import { OverlayModule } from '@angular/cdk/overlay';
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { BrowserModule, Title } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { StudentService } from 'src/app/core/services/student.service';
import { UserService } from 'src/app/core/services/user.service';
import { Student } from 'src/app/shared/interfaces/student.interface';

import { StudentsListComponent } from './students-list.component';

describe('StudentsListComponent', () => {
  let component: StudentsListComponent;
  let fixture: ComponentFixture<StudentsListComponent>;
  let userService: UserService;
  let studentService: StudentService;
  let router: Router;
  let location: Location;
  let titleService: Title;
  let _snackBar: MatSnackBar;

  let user = {
    id: 1,
    username: 'admin',
    name: 'Rodrigo',
    lastname: 'Perez',
    rol: 'admin'
  };

  let students: Student[] = [
    {
      "name": "Phyllis",
      "lastname": "Crooks",
      "cursos": [],
      "id": 17
    },
    {
      "name": "Noelia",
      "lastname": "Trantow",
      "cursos": [],
      "id": 18
    }
  ];

  let student: Student = {
    "name": "Noelia",
    "lastname": "Trantow",
    "cursos": [],
    "id": 18
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StudentsListComponent],
      imports: [
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        RouterTestingModule,
        OverlayModule,
        MatTableModule,
        MatPaginatorModule,
        MatIconModule
      ],
      providers: [
        UserService,
        StudentService,
        MatSnackBar,
      ],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentsListComponent);
    component = fixture.componentInstance;
    userService = TestBed.inject(UserService);
    studentService = TestBed.inject(StudentService);
    router = TestBed.inject(Router);

    spyOn(userService, 'getUserData').and.returnValue(
      of(user)
    );

    spyOn(studentService, 'getStudents').and.returnValue(
      of(students)
    );

    component.ngOnInit();
    component.ngAfterViewInit();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get the user data when initialized', () => {
    expect(component.user).toBeTruthy();
    expect(component.user).toEqual(user);
  });

  it('should get students list when initialized', () => {
    expect(component.studentsData.length > 0).toBeTruthy();
    expect(component.studentsData).toEqual(students);
  });

  it('should delete student when onDeleteStudent is called', () => {
    const deleteSpy = spyOn(studentService, 'deleteStudentById').and.returnValue(
      of({
        "name": "Noelia",
        "lastname": "Trantow",
        "email": "Eloisa.Trantow@example.org",
        "cursos": [],
        "id": 18
      })
    )
    component.onDeleteStudent(18);
    expect(deleteSpy).toHaveBeenCalled();
  });

  it('should set student to edit when onClickEdit is called and navigate to studentForm', async () => {
    const editSpy = spyOn(studentService, 'setStudentToEdit').and.returnValue(Promise.resolve(true));
    spyOn(router, 'navigate').and.stub();
    component.onClickEdit(student);
    expect(editSpy).toHaveBeenCalledWith(student);
    expect(await router.navigate).toHaveBeenCalledWith(['dashboard/students/studentform']);
  });

  it('should set studentToEdit to null when onClickAdd is called and navigate to studentForm', async () => {
    const editSpy = spyOn(studentService, 'setStudentToEdit').and.returnValue(Promise.resolve(true));
    spyOn(router, 'navigate').and.stub();
    component.onClickAdd();
    expect(editSpy).toHaveBeenCalledWith(null);
    expect(await router.navigate).toHaveBeenCalledWith(['dashboard/students/studentform']);
  });

  it('should navigate to Student details when onClickDetails is called', async () => {
    spyOn(router, 'navigate').and.stub();
    component.onClickDetails(student); //mock student id=18
    expect(await router.navigate).toHaveBeenCalledWith(['dashboard/students/18']);
  })
});
