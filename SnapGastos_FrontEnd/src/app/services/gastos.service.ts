import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Gasto {
  id: string;
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


  postGastos(gasto: Omit<Gasto, 'id'>) {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<{ gasto: Gasto }>(this.apiURL, gasto, { headers, withCredentials: true });
  }


  getGastos(): Observable<{ gastos: Gasto[] }> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<{ gastos: Gasto[] }>(this.apiURL, { headers, withCredentials: true });
  }


  updateGasto(id: string, gastoAtualizado: Gasto, mes: string) {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put(`${this.apiURL}/${id}?mes=${mes}`, gastoAtualizado, { headers, withCredentials: true });
  }


  deleteGasto(id: string, mes: string) {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete(`${this.apiURL}/${id}?mes=${mes}`, { headers, withCredentials: true });
  }
}
