import { Component } from '@angular/core';
import Autentifikacija from '../servisi/autentifikacija';
import { Router } from '@angular/router';
import { environment } from '../environments/environment';
import { AfterViewInit, Renderer2 } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';

declare const grecaptcha: any;

@Component({
  selector: 'app-registracija',
  templateUrl: './registracija.component.html',
  styleUrl: './registracija.component.scss'
})
export class RegistracijaComponent {
  constructor(private router : Router, private renderer: Renderer2, private http: HttpClient){}
  siteKey: string = '';
  private restServis = environment.restServis;

  ngAfterViewInit(){
    this.fetchSiteKey();
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

  ime: string = '';
  prezime: string = '';
  lozinka: string = '';
  email: string = '';
  korime: string = '';
  uloga: string = '';
  errorMessage: string = '';

  async onSubmit() {
    if (
      this.ime.trim() &&
      this.prezime.trim() &&
      this.lozinka.trim() &&
      this.email.trim() &&
      this.korime.trim() &&
      this.uloga.trim()
    ) {
      const userData = {
        ime: this.ime,
        prezime: this.prezime,
        lozinka: this.lozinka,
        email: this.email,
        korime: this.korime,
        uloga: this.uloga
      };

      const auth = new Autentifikacija();

      const token = await this.executeRecaptcha();
      
      this.http.post<any>(`${this.restServis}/recaptcha`, { token })
        .subscribe(async (response: { isValid: boolean }) => {
          if (response.isValid) {
      try {
        const success = await auth.dodajKorisnika(userData);
        if (success) {
          this.router.navigate(['/prijava']);
          console.log('User registered successfully');
        } else {
          console.error('User registration failed');
        }
      } catch (error) {
        console.error('Error during user registration:', error);
      }
    }else{
      console.log('reCAPTCHA validation failed');
    }
  }, error => {
    console.error('Error while validating reCAPTCHA:', error);
  });

      console.log('Form submitted:', this.ime, this.prezime, this.lozinka, this.email, this.korime, this.uloga);
    } else {
      this.errorMessage = 'Sva polja moraju biti popunjena!';
    }
  }
}
