const Baza = require("./baza.js");

class FavoritiDAO {
	constructor() {
		this.baza = new Baza("RWA2023vlovric21.sqlite");
	}
	dajSveFavorite = async function (korime) {
		this.baza.spojiSeNaBazu();
		let sql =
			"SELECT Serija.* FROM Serija JOIN Favoriti ON Serija.idSerija = Favoriti.idSerija WHERE Favoriti.idKorisnik = (SELECT idKorisnik FROM Korisnik WHERE korime=?)";
		console.log("SQL Query:", sql, "Username:", korime);
		var podaci = await this.baza.izvrsiUpit(sql, [korime]);
		this.baza.zatvoriVezu();
		console.log("Retrieved Data:", podaci);
		return podaci;
	};
	dajFavorit = async function(korime, id) {
		this.baza.spojiSeNaBazu();
		let sql =
			"SELECT Serija.* FROM Serija JOIN Favoriti ON Serija.idSerija = Favoriti.idSerija WHERE Favoriti.idKorisnik = (SELECT idKorisnik FROM Korisnik WHERE korime=?) AND Serija.idSerija = ?";
		console.log("SQL Query:", sql, "Username:", korime, "ID:", id);
		var podaci = await this.baza.izvrsiUpit(sql, [korime, id]);
		this.baza.zatvoriVezu();
		console.log("Retrieved Data:", podaci);
		return podaci;
	};
	obrisiFavorit = async function(korime, id){
		this.baza.spojiSeNaBazu();
		let sql = "DELETE FROM Favoriti WHERE idKorisnik = (SELECT idKorisnik FROM Korisnik WHERE korime=?) AND idSerija = ?";
		console.log("SQL Query:", sql, "Username:", korime, "ID:", id);
		var podaci = await this.baza.izvrsiUpit(sql, [korime, id]);
		this.baza.zatvoriVezu();
		console.log("Deleted Data:", podaci);
		return podaci;
	};

	dajSezonaInfo = async function(imeSerije){
		this.baza.spojiSeNaBazu();
		let sql = "SELECT Sezona.* FROM Sezona JOIN Serija ON Sezona.idSerija = Serija.idSerija WHERE Serija.naziv = ?;"
		console.log("Naziv serije sql: " + imeSerije);
		var podaci = await this.baza.izvrsiUpit(sql, [imeSerije]);
		console.log("Podaci: ", podaci);
		this.baza.zatvoriVezu();
		return podaci;
	}
}

module.exports = FavoritiDAO;
