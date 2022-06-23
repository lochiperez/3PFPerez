import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CourseService } from 'src/app/core/services/course.service';
import { StudentService } from 'src/app/core/services/student.service';
import { UserService } from 'src/app/core/services/user.service';
import { Courses } from 'src/app/shared/interfaces/course.interface';
import { Student } from 'src/app/shared/interfaces/student.interface';
import { User } from 'src/app/shared/interfaces/user.interface';

@Component({
  selector: 'app-courses-details',
  templateUrl: './courses-details.component.html',
  styleUrls: ['./courses-details.component.scss']
})
export class CoursesDetailsComponent implements OnInit, OnDestroy {

  subscriptions: Subscription = new Subscription();
  user!:User | null; //Datos del usuario logueado
  loading:boolean = false;

  course!:Courses; //Curso a mostrar detalles
  students!:Student[];
  studentsByCourse:Student[] = [];

  constructor(
    private titleService: Title,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private courseService: CourseService,
    private studentService: StudentService,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.titleService.setTitle('Detalles del Curso');
    this.loading = true;
    this.getUserData();
    this.getCourseDetails();
    this.getStudents();
  }

  getUserData() {
    this.subscriptions.add(
      this.userService.getUserData().subscribe((userData) => {
        this.user = userData;
      })
    );
  }

  getCourseDetails() {
    let id:number = parseInt(this.route.snapshot.paramMap.get('id') as string);
    this.subscriptions.add(
      this.courseService.getCourseById(id).subscribe((res) => {
        this.course = res;
        this.loading = false;
      }, (error) => {
        this._snackBar.open(`${error} - No se pudo recuperar la informacion del curso`, 'Cerrar');
        this.router.navigate(['dashboard/courses']);
      })
    );
  }

  getStudents() {
    let id:number = parseInt(this.route.snapshot.paramMap.get('id') as string);
    this.subscriptions.add(
      this.studentService.getStudents().subscribe((res) => {
        this.students = res;
        this.students.forEach(student => {
          if(student.cursos!.filter((course) => course.id == id).length > 0) {
            this.studentsByCourse.push(student)
          }
        });
      })
    );
  }

  onClickEdit() {
    this.courseService.setCourseToEdit(this.course)
    .then(() => {
      this.router.navigate(['dashboard/courses/addcourse']);
    })
    .catch((error) => this._snackBar.open(error.message, 'Cerrar'));
  }

  onDeleteCourse() {
    this.subscriptions.add(
      this.courseService.deleteCourseById(this.course.id).subscribe((res) => {
        this._snackBar.open(`El curso de ${res.course } fue eliminado  con exito`, 'Ok');
        this.router.navigate(['dashboard/courses']);
      }, (error) => {
        this._snackBar.open(`${error} - No se pudo eliminar el curso`, 'Cerrr');
      })
    );
  }

  onDeleteInscription(student:Student) {
    /* Se busca el elemento por el id del curso en el array de cursos del estudiante,
    Se elimina por el index, y luego usando el ViewChild, se renderiza de nuevo la tabla.
    Por ultimo, se actualiza el estudiante en el listado de estudiantes y se setean en el servicio*/
    let courses: Courses[] = student.cursos!;
    let index = courses.findIndex((x) => x.id === this.course.id);
    courses.splice(index,1);
    student.cursos = courses;
    this.studentService.editStudentById(student.id, student).subscribe((res) => {
      this._snackBar.open(`Se actualizó la información de los cursos de ${res.name} ${res.lastname}`, 'Ok');
    }, (error) => {
      this._snackBar.open(`${error} - No se pudo actualizar la información de los cursos del alumno`, 'Cerrar');
    })
    let indexOfStudent = this.studentsByCourse.findIndex((x) => x.id === student.id);
    this.studentsByCourse.splice(indexOfStudent,1);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

}
