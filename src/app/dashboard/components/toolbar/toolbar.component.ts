import { Component, Input, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { UserService } from 'src/app/core/services/user.service';
import { User } from 'src/app/shared/interfaces/user.interface';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent {

  constructor(
    public titleService: Title,
    private userService: UserService,
    private router: Router
  ) {}

  @Input() user!: User | null; //datos del usuario logueado

  logOut() {
    this.userService.logOff();
    this.router.navigate(['/']);
  }

}
