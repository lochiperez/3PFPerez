import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { StudentService } from './student.service';
import { Student } from 'src/app/shared/interfaces/student.interface';
import { of } from 'rxjs';

describe('StudentService', () => {
  let service: StudentService;
  let mockResponseList: Student[] = [
    {
      "name": "Christina",
      "lastname": "Little",
      "cursos": [
        {
          "id": 1,
          "course": "Angular",
          "professor": "Juan Perez",
        },
        {
          "course": "VueJS",
          "professor": "Alexander Armstrong",
          "id": 3
        }
      ],
      "id": 7
    }
  ];
  let mockEditedStudent: Student = {
    "name": "Juan",
    "lastname": "Perez",
    "cursos": [
      {
        "id": 1,
        "course": "Angular",
        "professor": "Juan Perez",
      },
      {
        "course": "VueJS",
        "professor": "Alexander Armstrong",
        "id": 3
      }
    ],
    "id": 7
  };
  let mockAddedStudent: Student = {
    "name": "Euna",
    "lastname": "Harvey",
    "cursos": [],
    "id": 8
  };
  let studentToEdit: Student = {
    "name": "Euna",
    "lastname": "Harvey",
    "cursos": [],
    "id": 8
  };

  let httpController: HttpTestingController;
  let apiUrl = 'https://62aa1e323b314385544268cd.mockapi.io/students/';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(StudentService);
    httpController = TestBed.inject(HttpTestingController);

    spyOn(service, 'getStudentToEdit').and.returnValue(
      of(
        {
          "name": "Euna",
          "lastname": "Harvey",
          "cursos": [],
          "id": 8
        }
      )
    );

    spyOn(service, 'setStudentToEdit').and.returnValue(Promise.resolve(true));
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get students', () => {
    service.getStudents().subscribe((res) => {
      expect(res).toEqual(mockResponseList);
    });
    const req = httpController.expectOne({
      method: 'GET',
      url: `${apiUrl}`,
    });
    req.flush(mockResponseList);
  });

  it('should get student by id', () => {
    service.getStudentById(7).subscribe((res) => {
      expect(res).toEqual(mockResponseList[0])
    });
    const req = httpController.expectOne({
      method: 'GET',
      url: `${apiUrl}7`
    });
    req.flush(mockResponseList[0]);
  });

  it('should delete student by id', () => {
    service.deleteStudentById(7).subscribe((res) => {
      expect(res).toEqual(mockResponseList[0])
    });
    const req = httpController.expectOne({
      method: 'DELETE',
      url: `${apiUrl}7`
    });
    req.flush(mockResponseList[0]);
  });

  it('should edit student by id', () => {
    service.editStudentById(7, mockEditedStudent).subscribe((res) => {
      expect(res).toEqual(mockEditedStudent)
    });
    const req = httpController.expectOne({
      method: 'PUT',
      url: `${apiUrl}7`
    });
    req.flush(mockEditedStudent);
  });

  it('should add student', () => {
    service.addStudent(mockAddedStudent).subscribe((res) => {
      expect(res).toEqual(mockAddedStudent)
    });
    const req = httpController.expectOne({
      method: 'POST',
      url: `${apiUrl}`
    });
    req.flush(mockAddedStudent);
  });

  it('should get student to edit', () => {
    service.getStudentToEdit().subscribe((res) => {
      expect(res).toEqual(studentToEdit)
    })
  });

  it('should set student to edit and return true', async () => {
    service.setStudentToEdit(studentToEdit)
    expect(service.setStudentToEdit).toHaveBeenCalled();
    expect(await service.setStudentToEdit(studentToEdit)).toBeTrue;
  });

});
