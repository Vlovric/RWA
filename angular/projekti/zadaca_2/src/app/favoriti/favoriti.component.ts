import { Component, OnInit } from '@angular/core';
import { FavoritI } from '../../interfaces/FavoritiI';
import { FavoritiService } from '../servisi/favoriti';
import { KorisnikService } from '../servisi/korisnikService';
import { Router } from '@angular/router'
import { favoritDetaljiI } from '../../interfaces/favoritDetaljiI';


@Component({
  selector: 'app-favoriti',
  templateUrl: './favoriti.component.html',
  styleUrl: './favoriti.component.scss'
})
export class FavoritiComponent implements OnInit {
  favoritiData: FavoritI[] = [];
  favoritiDetails: favoritDetaljiI[] = [];
  korime: string = '';

  constructor(private favoritiService: FavoritiService, private KorisnikService: KorisnikService, private router: Router) { }

  async ngOnInit() {
    this.KorisnikService.korime$.subscribe(korime => {
      this.korime = korime;
      if (this.korime.trim() === 'Morate se prijaviti!' || this.korime.trim().length === 0) {
        this.router.navigate(['/prijava']);
      }
    });
    try {
      this.favoritiData = await this.favoritiService.dohvatiFavorite();
    } catch (error) {
      console.error('Pogreska:', error);
    }
  }
  
  async showDetails(serija: FavoritI) {
    try {
      const imeSerije = encodeURIComponent(serija.naziv);
      const favoritDetails = await this.favoritiService.dohvatiFavorita(imeSerije);
      console.log("favoritDetails", favoritDetails);
      this.favoritiDetails = favoritDetails;
    } catch (error) {
      console.error('Pogreska pri dohvaćanju detalja:', error);
    }
  }
  
}
