import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  constructor(private _router: Router) {}

  navigateToApp() {
    this._router.navigate(['/tasks']);
  }
  navigateToCalender() {
    this._router.navigate(['/calendar']);
  }
}
