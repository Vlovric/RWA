import { NgModule } from "@angular/core";
import { PocetnaComponent } from "./pocetna/pocetna.component";
import { DokumentacijaComponent } from "./dokumentacija/dokumentacija.component";
import { FavoritiComponent } from "./favoriti/favoriti.component";
import { KorisniciComponent } from "./korisnici/korisnici.component";
import { PrijavaComponent } from "./prijava/prijava.component";
import { ProfilComponent } from "./profil/profil.component";
import { RegistracijaComponent } from "./registracija/registracija.component";
import { NavigacijaComponent } from "./navigacija/navigacija.component";
import { AppComponent } from "./app.component";
import { FormsModule } from "@angular/forms";
import { RouterModule, Routes } from "@angular/router";
import { BrowserModule } from "@angular/platform-browser";
import { HttpClientModule } from '@angular/common/http';
import { FavoritiService } from "./servisi/favoriti";

export const routes: Routes = [
    {path: '', component: PocetnaComponent},
    {path: 'pocetna', component: PocetnaComponent},
    {path: 'dokumentacija', component: DokumentacijaComponent},
    {path: 'favoriti', component: FavoritiComponent},
    {path: 'korisnici', component: KorisniciComponent},
    {path: 'prijava', component: PrijavaComponent},
    {path: 'profil', component: ProfilComponent},
    {path: 'registracija', component: RegistracijaComponent},
];

@NgModule({
    declarations:[
        NavigacijaComponent,
        AppComponent,
        PocetnaComponent,
        DokumentacijaComponent,
        FavoritiComponent,
        KorisniciComponent,
        PrijavaComponent,
        ProfilComponent,
        RegistracijaComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        RouterModule,
        HttpClientModule,
        RouterModule.forRoot(routes),
    ],
    providers: [FavoritiService],
    bootstrap: [AppComponent],
})

export class AppModule { }