import { Routes } from '@angular/router';
import { SessionComponent } from './session-component/session-component';
import { MainComponent } from './main-component/main-component';

export const routes: Routes = [
  { path: 'session', component: SessionComponent },
  { path: '', component: MainComponent, pathMatch: 'full' },
];
