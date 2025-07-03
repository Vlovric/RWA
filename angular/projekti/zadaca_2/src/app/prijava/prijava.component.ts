import { Component } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router'; 
import { kreirajSHA256Sol } from '../servisi/moduli/kodovi';
import { NgForm } from '@angular/forms';
import { KorisnikService } from '../servisi/korisnikService'
import { environment } from '../environments/environment';
import { AfterViewInit, Renderer2 } from '@angular/core';

declare const grecaptcha: any;

@Component({
  selector: 'app-prijava',
  templateUrl: './prijava.component.html',
  styleUrl: './prijava.component.scss'
})
export class PrijavaComponent implements AfterViewInit {
  errorMessage: string = '';
  
  constructor(private http: HttpClient, private router: Router, private KorisnikService: KorisnikService, private renderer: Renderer2) {}
  private restServis = environment.restServis;
  siteKey: string = '';


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

  async onSubmit(form: NgForm) {
    const token = await this.executeRecaptcha();
    
      const korime = form.value.korime;
      const lozinka = kreirajSHA256Sol(form.value.lozinka, korime);

      this.http.post<any>(`${this.restServis}/recaptcha`, { token })
        .subscribe((response: { isValid: boolean }) => {
          if (response.isValid) {
            this.http.post<any>(`${this.restServis}/baza/korisnici/${korime}/prijava`, { lozinka }, { observe: 'response' })
              .subscribe((loginResponse: HttpResponse<any>) => {
                if (loginResponse.status === 201) {
                  console.log('Login successful');
                  this.KorisnikService.updateKorime();
                  this.router.navigate(['/']);
                } else {
                  console.log('Login failed');
                }
              }, error => {
                console.error('Error during login:', error);
                this.errorMessage = 'Netočni podatci!';
              });
          } else {
            console.log('reCAPTCHA validation failed');
          }
        }, error => {
          console.error('Error while validating reCAPTCHA:', error);
        });
  }
}
