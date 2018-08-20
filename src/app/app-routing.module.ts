import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: './pages/tabs/tabs.module#TabsPageModule'
  },
  {
    path: 'home',
    loadChildren: './pages/home/home.module#HomePageModule'
  },
  {
    path: 'trip',
    loadChildren: './pages/trip/trip.module#TripPageModule'
  },
  {
    path: 'my-observations',
    loadChildren: './pages/my-observations/my-observations.module#MyObservationsPageModule'
  },
  {
    path: 'varsom',
    loadChildren: './pages/varsom/varsom.module#VarsomPageModule'
  },
  {
    path: 'user-settings',
    loadChildren: './pages/user-settings/user-settings.module#UserSettingsPageModule'
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
