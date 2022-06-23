import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CourseService } from 'src/app/core/services/course.service';
import { UserService } from 'src/app/core/services/user.service';
import { Courses } from 'src/app/shared/interfaces/course.interface';
import { User } from 'src/app/shared/interfaces/user.interface';

@Component({
  selector: 'app-courses-list',
  templateUrl: './courses-list.component.html',
  styleUrls: ['./courses-list.component.scss']
})
export class CoursesListComponent implements OnInit, AfterViewInit, OnDestroy {

  subscriptions: Subscription = new Subscription();
  user!: User | null;
  loading: boolean = false;

  courses!: Courses[];
  @ViewChild(MatTable) table!: MatTable<any>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns = ['id', 'name', 'professor', 'actions'];
  dataSource = new MatTableDataSource();

  constructor(
    private titleService: Title,
    private userService: UserService,
    private courseService: CourseService,
    private router: Router,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.titleService.setTitle('Cursos');
    this.loading = true;
    this.getUserData();
    this.getCourses();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  getUserData() {
    this.subscriptions.add(
      this.userService.getUserData().subscribe((userData) => {
        this.user = userData;
      })
    );
  }

  getCourses() {
    this.subscriptions.add(
      this.courseService.getCourses().subscribe((coursesData) => {
        this.courses = coursesData;
        this.dataSource.data = this.courses;
        this.loading = false;
      }, (error) => {
        this._snackBar.open(`${error} - No se pudo recuperar la información de los cursos`, 'Cerrar');
      })
    )
  }

  onClickAdd() {
    this.courseService.setCourseToEdit(null)
      .then(() => this.router.navigate(['dashboard/courses/addcourse']))
      .catch((error) => this._snackBar.open(error.message, 'Cerrar'));
  }

  onClickDetails(course: Courses) {
    this.router.navigate([`dashboard/courses/${course.id}`]);
  }

  onClickEdit(course: Courses) { //actualiza el curso a editar en el servicio
    this.courseService.setCourseToEdit(course)
      .then(() => {
        this.router.navigate(['dashboard/courses/addcourse']);
      })
      .catch((error) => {
        this._snackBar.open(error.message, 'Cerrar');
      });
  }

  onClickDelete(course: Courses) {
    /* Se busca el elemento por el id en el array de cursos,
    Se elimina por el index, y luego usando el ViewChild, se renderiza de nuevo la tabla.
    Por ultimo, actualizamos los cursos en el servicio */
    let index = this.courses.findIndex(x => x.id === course.id);
    this.courses.splice(index, 1);
    this.dataSource.data = this.courses
    this.table.renderRows();
    //this.onUpdateDeleteCourse(this.courses)
    this.subscriptions.add(
      this.courseService.deleteCourseById(course.id).subscribe((res) => {
        this._snackBar.open(`El curso de ${res.course} fue eliminado con exito`, 'Ok');
      }, (error) => {
        this._snackBar.open(`${error} - No se pudo eliminar el curso`, 'Cerrar');
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

}
