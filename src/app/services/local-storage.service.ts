import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  constructor() { }

  setData(key, data) {
    const jsonData = JSON.stringify(data);
    localStorage.setItem(key, jsonData);
  }

  getData(key) {
    const value = localStorage.getItem(key);
    return JSON.parse(value);
  }

  removeData(key) {
    localStorage.removeItem(key);
  }
}
