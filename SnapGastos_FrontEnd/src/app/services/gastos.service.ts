import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Gasto {
  nome: string;
  valor: number;
  categoria: string;
  data: string;
}

@Injectable({
  providedIn: 'root'
})
export class GastosService {
  private apiURL = 'http://localhost:3000/gastos';

  constructor(private http: HttpClient) { }

  getGastos(): Observable<{ gastos: Gasto[] }> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<{ gastos: Gasto[] }>(this.apiURL, { headers, withCredentials: true });
  }
}
