const Baza = require("./baza.js");
const kodovi = require("./kodovi.js");
const base32 = require('base32-encoding')

class KorisnikDAO {
	constructor() {
		this.baza = new Baza("RWA2023vlovric21.sqlite");
	}

	dajSve = async function () {
		this.baza.spojiSeNaBazu();
		let sql = "SELECT * FROM Korisnik;";
		var podaci = await this.baza.izvrsiUpit(sql, []);
		this.baza.zatvoriVezu();
		return podaci;
	};

	daj = async function (korime) {
		this.baza.spojiSeNaBazu();
		let sql = "SELECT * FROM Korisnik WHERE korime=?;";
		var podaci = await this.baza.izvrsiUpit(sql, [korime]);
		this.baza.zatvoriVezu();
		if (podaci.length == 1) return podaci[0];
		else return null;
	};

	dodaj = async function (korisnik) {
		console.log(korisnik);
		try {
			let sql = `INSERT INTO Korisnik (ime,prezime,lozinka,email,korime,idUloga,tajni_kljuc,ukljuceno) VALUES (?,?,?,?,?,?,?,0)`;
			let podaci = [
				korisnik.ime,
				korisnik.prezime,
				kodovi.kreirajSHA256(korisnik.lozinka, korisnik.korime),
				korisnik.email,
				korisnik.korime,
				korisnik.uloga,
			];
			await this.baza.izvrsiUpit(sql, podaci);
			return true;
		} catch (error) {
            console.error("SQLite error:", error);
            return { error: "SQLite error occurred", details: error.message };
        }
	};

	obrisi = async function (korime) {
		try {
			this.baza.spojiSeNaBazu();
	
			let sql = "SELECT idKorisnik FROM Korisnik WHERE korime=?";
			let result = await this.baza.izvrsiUpit(sql, [korime]);
			if (result.length === 0) {
				console.log("No user found with korime:", korime);
				this.baza.zatvoriVezu();
				return false;
			}
	
			const idKorisnik = result[0].idKorisnik;
	
			sql = "DELETE FROM Favoriti WHERE idKorisnik=?";
			await this.baza.izvrsiUpit(sql, [idKorisnik]);
	
			sql = "DELETE FROM Korisnik WHERE idKorisnik=?";
			await this.baza.izvrsiUpit(sql, [idKorisnik]);
	
			this.baza.zatvoriVezu();
			return true;
		} catch (error) {
			console.error("SQLite error:", error);
			return { error: "SQLite error occurred", details: error.message };
		}
	};
	

	azuriraj = async function (korime, korisnik) {
		try {
			let postojeci = await this.daj(korime);
			this.baza.spojiSeNaBazu();
			console.log("AZURIRAJ ime: " + korisnik.ime);
			if (korisnik.ime == undefined) korisnik.ime = postojeci.ime;
			if (korisnik.prezime == undefined) korisnik.prezime = postojeci.prezime;
			console.log("AZURIRAJ korime: " + korime);
			if (korisnik.lozinka == undefined){
				korisnik.lozinka = postojeci.lozinka;
			}else{
				korisnik.lozinka = kodovi.kreirajSHA256(korisnik.lozinka, korime)
			};
			console.log("AZURIRAJ ime: " + korisnik.ime);
			let sql = `UPDATE Korisnik SET ime=?, prezime=?, lozinka=? WHERE korime=?`;
			let podaci = [korisnik.ime, korisnik.prezime, korisnik.lozinka, korime];
			await this.baza.izvrsiUpit(sql, podaci);
			this.baza.zatvoriVezu();
			return true;
		} catch (error) {
			return error;
		}
	};

	iskljuci2FA = async function (korime){
		try{
			const hasTajniKljuc = await this.tajniKljucPostoji(korime);
			const ukljucenoStatus = await this.ukljucenoStatus(korime);
			if (hasTajniKljuc === true) {
				if(ukljucenoStatus){
					this.baza.spojiSeNaBazu();
					let sql = `UPDATE Korisnik SET ukljuceno = 0 WHERE korime = ?`;
					await this.baza.izvrsiUpit(sql, [korime]);
				}else{
					return "Već je isključeno";
				}
			} else {
				return "Nema tajni ključ"
			}
			this.baza.zatvoriVezu();
			return "Isključeno";
		} catch(error){
			console.error("SQLite error:", error);
			return { error: "SQLite error occurred", details: error.message };
		}
	}

	ukljucenoStatus = async function (korime) {
		try {
			this.baza.spojiSeNaBazu();
			let sql = `SELECT ukljuceno FROM Korisnik WHERE korime = ?`;
			let result = await this.baza.izvrsiUpit(sql, [korime]);
			const ukljucenoValue = result[0].ukljuceno;
			this.baza.zatvoriVezu();
			return ukljucenoValue;
		} catch(error) {
			console.error("SQLite error:", error);
			return { error: "SQLite error occurred", details: error.message };
		}
	}
	

	tajniKljucPostoji = async function (korime) {
		try {
			this.baza.spojiSeNaBazu();
			let sql = `SELECT COUNT(*) AS count FROM Korisnik WHERE korime=? AND tajni_kljuc IS NOT NULL`;
			let result = await this.baza.izvrsiUpit(sql, [korime]);
			this.baza.zatvoriVezu();
	
			return result[0].count > 0;
		} catch (error) {
			console.error("SQLite error:", error);
			return { error: "SQLite error occurred", details: error.message };
		}
	};

	ukljuci2FA = async function (korime){
		try{
			const ukljuceno = await this.ukljucenoStatus(korime);
			const tajniPostoji = await this.tajniKljucPostoji(korime);
			if(ukljuceno){
				return "Već je uključeno";
			}else{
				if(tajniPostoji){
					this.baza.spojiSeNaBazu();
					let sql = `UPDATE Korisnik SET ukljuceno = 1 WHERE korime = ?`;
					await this.baza.izvrsiUpit(sql, [korime]);
					this.baza.zatvoriVezu();
					return "Uključeno";
				}else{
					let kljuc = this.kreirajTajniKljuc(korime);
					this.baza.spojiSeNaBazu();
					let insertSql = `UPDATE Korisnik SET tajni_kljuc = ? WHERE korime = ?`;
                	await this.baza.izvrsiUpit(insertSql, [kljuc, korime]);
					let sql = `UPDATE Korisnik SET ukljuceno = 1 WHERE korime = ?`;
					await this.baza.izvrsiUpit(sql, [korime]);
					this.baza.zatvoriVezu();
					return kljuc;
				}
			}
		}catch (error) {
			console.error("SQLite error:", error);
			return { error: "SQLite error occurred", details: error.message };
		}
	}

	kreirajTajniKljuc = function(korime){
		let tekst = korime + new Date() + kodovi.dajNasumceBroj(10000000, 90000000);
		let hash = kodovi.kreirajSHA256(tekst);
		let tajniKljuc = base32.stringify(hash, "ABCDEFGHIJKLMNOPRSTQRYWXZ234567");
		return tajniKljuc.toUpperCase();
	}
}

module.exports = KorisnikDAO;
