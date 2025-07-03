import * as CryptoJS from 'crypto-js';

export function kreirajSHA256(tekst: string): string {
  return CryptoJS.SHA256(tekst).toString();
}

export function kreirajSHA256Sol(tekst: string, sol: string): string {
  return CryptoJS.SHA256(tekst + sol).toString();
}


export function dajNasumceBroj(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}
