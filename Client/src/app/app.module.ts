import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { PairingComponent } from './pairing.component';
import { AboutComponent } from './about.component';
import { FirstComponent } from './games/first/first.component';

const routes: Routes = [
  { path: '', redirectTo: '/first', pathMatch: 'full' },
  { path: 'pairing', component: PairingComponent },
  { path: 'about', component: AboutComponent },
  { path: 'first', component: FirstComponent }
];

@NgModule({
  bootstrap: [AppComponent],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes)
  ],
  declarations: [
    AppComponent,
    PairingComponent,
    AboutComponent,
    FirstComponent
  ]
})
export class AppModule { }
