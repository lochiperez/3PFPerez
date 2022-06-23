import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Courses } from 'src/app/shared/interfaces/course.interface';

@Injectable({
  providedIn: 'root'
})
export class CourseService {

  courseToEdit!: Courses | null;

  apiUrl = 'https://62b113b1196a9e98702f186f.mockapi.io/courses/';

  constructor(
    private http: HttpClient
  ) { } private handleError(error: HttpErrorResponse) {
    //Manejo de errores http frontend
    if (error) {
      console.warn(`Error de backend: ${error.status}, cuerpo del error: ${error.message}`);
    }
    return throwError('Error de comunicación Http');
  }



  getCourses(): Observable<Courses[]> {
    return this.http.get<Courses[]>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  getCourseById(id: number): Observable<Courses> {
    return this.http.get<Courses>(this.apiUrl + id)
      .pipe(catchError(this.handleError));
  }

  deleteCourseById(id: number): Observable<Courses> {
    return this.http.delete<Courses>(this.apiUrl + id)
      .pipe(catchError(this.handleError));
  }

  editCourseById(id: number, course: Courses): Observable<Courses> {
    return this.http.put<Courses>(this.apiUrl + id, course)
      .pipe(catchError(this.handleError));
  }

  addCourse(course: Courses): Observable<Courses> {
    return this.http.post<Courses>(this.apiUrl, course)
      .pipe(catchError(this.handleError));
  }

  getCourseToEdit(): Observable<Courses | null> {
    return of(this.courseToEdit)
  }

  setCourseToEdit(course: Courses | null) {
    return new Promise((resolve, reject) => {
      if (course || course === null) {
        this.courseToEdit = course;
        return resolve(true)
      } else {
        return reject({ message: ' No se pudo setear el curso a editar' })
      }
    });
  }

}
