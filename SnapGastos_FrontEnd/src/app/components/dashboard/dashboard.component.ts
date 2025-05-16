import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { Gasto, GastosService } from '../../services/gastos.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  name: string = '';
  picture: string = '';
  email: string = '';
  gastos: Gasto[] = [];
  loading: boolean = true;

  constructor(private route: ActivatedRoute, private gastosServices: GastosService) { }

  ngOnInit() {
    this.processarToken();

    this.gastosServices.getGastos().subscribe({
      next: (res) => {
        this.gastos = res.gastos;
        this.loading = false;
      },
      error: (erro) => {
        console.error('Erro ao buscar gastos: ', erro);
        this.loading = false;
      }
    });
  }

  private processarToken() {
    // 1. Primeiro tenta pela URL (caso login recém-feito)
    const tokenAuth = this.route.snapshot.queryParamMap.get('token');

    if (tokenAuth) {
      this.salvarToken(tokenAuth);
      // Remove o token da URL
      window.history.replaceState({}, document.title, '/dashboard');
    }


    // 2. Se não vier da URL, tenta pelo localStorage
    const tokenAuth2 = tokenAuth || localStorage.getItem('auth_token');

    if (tokenAuth2) {
      try {
        const decoded: any = jwtDecode(tokenAuth2);
        this.name = decoded.name || '';
        this.picture = decoded.picture || '';
        this.email = decoded.email || '';
      }
      catch (error) {
        console.error('Token inválido:', error);
        localStorage.removeItem('auth_token'); // limpa se estiver corrompido
      }
    }
  }

  private salvarToken(token: string) {
    localStorage.setItem('auth_token', token);
  }
}
