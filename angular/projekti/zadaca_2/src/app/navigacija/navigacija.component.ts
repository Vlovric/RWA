import { Component, OnInit } from '@angular/core';
import { KorisnikService } from '../servisi/korisnikService';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { GithubAuthService } from '../servisi/github';

@Component({
  selector: 'app-navigacija',
  templateUrl: './navigacija.component.html',
  styleUrl: './navigacija.component.scss'
})
export class NavigacijaComponent implements OnInit {
  korime: string = '';
  githubLogin: boolean = false;

  constructor(private korisnikService: KorisnikService, private http: HttpClient, private router: Router, private githubAuthService: GithubAuthService) { }

  async ngOnInit() {
    this.korisnikService.korime$.subscribe(korime => {
      this.korime = korime;
    });

    this.githubLogin = await this.checkGithubToken();
  }

  initiateGithubLogin(){
    this.githubAuthService.initiateGithubLogin();
  }

  async checkGithubToken() {
    try {
      const response = await this.githubAuthService.provjeriGithubToken();
      console.log("response je : ", response);
      if (response.message === "Ima") {
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error checking GitHub token:', error);
      return false;
    }
  }

  logout() {
    this.http.get('/odjavikorisnika', { responseType: 'text' }).subscribe(
      (response: any) => {
        if (response === 'Logged out successfully') {
          this.korisnikService.updateKorime();
          this.githubLogin = false;
          this.router.navigate(['/']);
          console.log('Logged out successfully', response);
        } else {
          console.error('Unexpected response data', response);
        }
      },
      (error) => {
        console.error('Error logging out', error);
      }
    );
  }
  
  
  
}
