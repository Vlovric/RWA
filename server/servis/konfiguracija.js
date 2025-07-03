const ds = require("fs/promises");

class Konfiguracija {
	constructor() {
		this.konf = {};
	}
	dajKonf() {
		return this.konf;
	}

	async ucitajKonfiguraciju() {
		try {
			let podaci = await ds.readFile(process.argv[2], "UTF-8");
			this.konf = pretvoriJSONkonfig(podaci);
		} catch (error) {
			console.error("Error reading configuration:", error);
		}
	}
}

function pretvoriJSONkonfig(podaci) {
	let konf = {};
	var nizPodataka = podaci.split("\n");
	for (let podatak of nizPodataka) {
		var podatakNiz = podatak.split("=");
		var naziv = podatakNiz[0];
		var vrijednost = podatakNiz.slice(1).join("=");
		konf[naziv] = vrijednost;
	}
	return konf;
}

module.exports = Konfiguracija;
