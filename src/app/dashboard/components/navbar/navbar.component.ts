import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { StudentService } from 'src/app/core/services/student.service';
import { UserService } from 'src/app/core/services/user.service';
import { User } from 'src/app/shared/interfaces/user.interface';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {

  @Input() user!: User | null;

  constructor(
    private userService: UserService,
    private studentService: StudentService,
    private router: Router
  ) { }

  logOut() {
    this.userService.logOff();
    this.router.navigate(['/']);
  }


}
