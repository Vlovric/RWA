import { Component, OnInit } from '@angular/core';
import { KorisnikService } from '../servisi/korisnikService';

@Component({
  selector: 'app-pocetna',
  templateUrl: './pocetna.component.html',
  styleUrl: './pocetna.component.scss'
})
export class PocetnaComponent implements OnInit {
  constructor(private KorisnikService: KorisnikService){}

  ngOnInit(){
    this.KorisnikService.updateKorime();
  }
}
