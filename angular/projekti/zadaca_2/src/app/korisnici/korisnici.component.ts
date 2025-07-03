import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { KorisnikService } from '../servisi/korisnikService';
import { Router } from '@angular/router'

interface Korisnik {
  ime: string;
  prezime: string;
  email: string;
  korime: string;
  idUloga: number;
}

@Component({
  selector: 'app-korisnici',
  templateUrl: './korisnici.component.html',
  styleUrl: './korisnici.component.scss'
})
export class KorisniciComponent implements OnInit {
  korisnici: Korisnik[] = [];
  korimeToDelete: string = '';
  korime: string = '';

  constructor(private http: HttpClient, private KorisnikService: KorisnikService, private router: Router) { }

  ngOnInit() {
    this.KorisnikService.korime$.subscribe(korime => {
      this.korime = korime;
      if (this.korime.trim() === 'Morate se prijaviti!' || this.korime.trim().length === 0) {
        this.router.navigate(['/prijava']);
      }
    });
    this.fetchData();
  }

  fetchData() {
    this.http.get<Korisnik[]>('/baza/korisnici')
      .subscribe(
        (data: Korisnik[]) => {
          this.korisnici = data;
        },
        (error) => {
          console.error('Error:', error);
        }
      );
  }

  async deleteKorisnik() {
    if (this.korimeToDelete.toLowerCase() === 'admin') {
      alert("Ne možete obrisati glavnog administratora!");
      return;
    }

    try {
      const deleteResponse = await this.http.delete(`/baza/korisnici/${this.korimeToDelete}`).toPromise();

      if (deleteResponse) {
        console.log(`Korisnik '${this.korimeToDelete}' je obrisan`);
        this.fetchData();
      } else {
        throw new Error('Pogreška u brisanju korisnika.');
      }
    } catch (error) {
      console.error('Pogreška u brisanju korisnika', error);
    }
  }
}
