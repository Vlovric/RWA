import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { FavoritI } from '../../interfaces/FavoritiI';
import { favoritDetaljiI } from '../../interfaces/favoritDetaljiI';

@Injectable({
  providedIn: 'root'
})
export class FavoritiService {

  private restServis = environment.restServis;
  private favoriti?: FavoritI[];

  constructor() { }

  async dohvatiFavorite(): Promise<FavoritI[]> {
    try {
      const response = await fetch(`${this.restServis}/baza/favoriti`);
      
      if (response.ok) {
        const podaci = await response.json() as FavoritI[];
        this.favoriti = podaci.map((f: FavoritI) => ({
          idSerija: f.idSerija,
          naziv: f.naziv,
          opis: f.opis,
          broj_sezona: f.broj_sezona,
          broj_epizoda: f.broj_epizoda,
          popularnost: f.popularnost,
          slika: f.slika,
          vanjska_stranica: f.vanjska_stranica,
          tmdb_id: f.tmdb_id
        }));
        return this.favoriti;
      } else {
        throw new Error('Fetch nije uspio.');
      }
    } catch (error) {
      console.error('Pogreska:', error);
      return [];
    }
  }
 

async dohvatiFavorita(imeSerije: string): Promise<favoritDetaljiI[]> {
  try {
    const response = await fetch(`${this.restServis}/baza/favoritDetalji/${imeSerije}`);
    console.log("dohvatiFavorita: ", response);
    
    if (response.ok) {
      const dohvaceniDetalji = await response.json() as favoritDetaljiI[];
      console.log("dohvaceniDetalji: ", dohvaceniDetalji);
      return dohvaceniDetalji;
    } else {
      throw new Error('Fetch nije uspio.');
    }
  } catch (error) {
    console.error('Pogreska pri dohvaćanju detalja:', error);
    return [];
  }
}

}
