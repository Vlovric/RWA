import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { KorisnikService } from '../servisi/korisnikService';
import { Router } from '@angular/router'
import { environment } from '../environments/environment';
import { AfterViewInit, Renderer2 } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';

declare const grecaptcha: any;

interface LogiraniKorisnik {
  ime: string;
  prezime: string;
  email: string;
  korime: string;
  idUloga: number;
}

@Component({
  selector: 'app-profil',
  templateUrl: './profil.component.html',
  styleUrl: './profil.component.scss'
})
export class ProfilComponent implements OnInit {
  logiraniKorisnik: LogiraniKorisnik | null = null;
  kljucUkljucen: string = '';
  customMessage: string = '';

  imeFieldValue: string = '';
  prezimeFieldValue: string = '';
  lozinkaFieldValue: string = '';

  korime: string = '';

  siteKey: string = '';
  private restServis = environment.restServis;

  constructor(private http: HttpClient, private KorisnikService: KorisnikService, private router: Router, private renderer: Renderer2, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.KorisnikService.korime$.subscribe(async korime => {
      this.korime = korime;
      if (this.korime.trim() === 'Morate se prijaviti!' || this.korime.trim().length === 0) {
        this.router.navigate(['/prijava']);
      }
    });
    this.fetchLogiraniKorisnik();
    
  }

  ngAfterViewInit(){
    this.fetchSiteKey();
    this.fetchKljucUkljucenStatus();
  }

  iskljuci2FA() {
    this.http.get(`${this.restServis}/iskljuci2FA`)
      .subscribe(
        (response: any) => {
          console.log('Isključi response:', response);
          switch (response.message) {
            case 'Isključeno':
              this.fetchKljucUkljucenStatus();
              this.cdr.detectChanges();
              this.customMessage = "Isključeno"
              break;
            case 'Nema tajni ključ':
              this.customMessage = 'Niste još nijednom aktivirali 2FA';
              break;
            case 'Već je isključeno':
              this.customMessage = 'Već je isključeno';
              break;
            default:
              break;
          }
        },
        (error) => {
          console.error('Greška prilikom isključivanja 2FA', error);
        }
      );
  }

  ukljuci2FA() {
    this.http.get<any>(`${this.restServis}/ukljuci2FA`).subscribe(
      (response: any) => {
        console.log('Uključi response:', response);
        console.log("reponse.message je:", response.message)
        if (response.message === 'Uključeno') {
          this.customMessage = 'Uključeno';
          this.fetchKljucUkljucenStatus();
          this.cdr.detectChanges();
        } else if (response.message === 'Već je uključeno') {
          this.customMessage = 'Već je uključeno';
        } else {
          this.fetchKljucUkljucenStatus();
          this.customMessage = "Vaš tajni ključ je: " + response.message;
        }
      },
      (error) => {
        console.error('Greška prilikom uključivanja 2FA', error);
      }
    );
  }
  

  fetchKljucUkljucenStatus() {
    this.http.get<any>(`${this.restServis}/kljucukljucen`)
      .subscribe(
        (response: any) => {
          console.log("reponse fetcha je:", response);

          if(response.message === "Uključeno"){
            this.kljucUkljucen = "Uključeno";
          }else if(response.message === "Isključeno"){
            this.kljucUkljucen = "Isključeno";
          }else{
            this.kljucUkljucen = "Uključeno";
          }
        },
        (error) => {
          console.error('Greška prilikom dohvaćanja statusa ključa', error);
        }
      );
  }

  fetchSiteKey() {
    this.http.get<{ message: string }>('/dajsitekey')
      .subscribe((response: { message: string }) => {
        this.siteKey = response.message;
        console.log("site key nakon fetcha bude:",this.siteKey);

        const script = this.renderer.createElement('script');
        script.src = `https://www.google.com/recaptcha/api.js?render=${this.siteKey}`;
        this.renderer.appendChild(document.body, script);
      }, error => {
        console.error('Error fetching site key:', error);
      });
  }

  executeRecaptcha(): Promise<string> {
    return new Promise((resolve) => {
      grecaptcha.ready(() => {
        grecaptcha.execute(`${this.siteKey}`, { action: 'prijava' })
          .then((token: string) => {
            resolve(token);
          });
      });
    });
  }


  fetchLogiraniKorisnik() {
    this.http.get<LogiraniKorisnik>('/baza/logiranikorisnik')
      .subscribe(
        (data: LogiraniKorisnik) => {
          this.logiraniKorisnik = data;
          this.imeFieldValue = data.ime;
          this.prezimeFieldValue = data.prezime;
        },
        (error) => {
          console.error('Greška u dohvaćanju podataka', error);
        }
      );
  }

  async onSubmitUpdate() {
    const token = await this.executeRecaptcha();

    this.http.post<any>(`${this.restServis}/recaptcha`, { token })
    .subscribe(async (response: { isValid: boolean }) => {
      if (response.isValid) {

    const userData = {
      ime: this.imeFieldValue,
      prezime: this.prezimeFieldValue,
      lozinka: this.lozinkaFieldValue
    };

    this.http.put(`/baza/korisnici/${this.logiraniKorisnik?.korime}`, userData)
      .subscribe(
        (response) => {
          console.log('Response received:', response);
          this.fetchLogiraniKorisnik();
        },
        (error) => {
          console.error('Greška u ažuriranju korisnika', error);
        }
      );
    }else{
      console.log('reCAPTCHA validation failed');
    }
  }, error => {
    console.error('Error while validating reCAPTCHA:', error);
  });
  }
}
