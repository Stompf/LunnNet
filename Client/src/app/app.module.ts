import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { PairingComponent } from './pairing.component';
import { AboutComponent } from './about.component';
import { FirstComponent } from './games/first/first.component';
import { CarComponent } from './games/car/car.component';
import { AsteroidsComponent } from './games/asteroids/asteroids.component';
import { MultiplayerComponent } from './games/multiplayer/multiplayer.component';

const routes: Routes = [
  { path: '', redirectTo: '/multiplayer', pathMatch: 'full' },
  { path: 'pairing', component: PairingComponent },
  { path: 'about', component: AboutComponent },
  { path: 'first', component: FirstComponent },
  { path: 'car', component: CarComponent },
  { path: 'asteroids', component: AsteroidsComponent },
  { path: 'multiplayer', component: MultiplayerComponent }
];

@NgModule({
  bootstrap: [AppComponent],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes, { useHash: true })
  ],
  declarations: [
    AppComponent,
    PairingComponent,
    AboutComponent,
    FirstComponent,
    CarComponent,
    AsteroidsComponent,
    MultiplayerComponent
  ]
})
export class AppModule { }
