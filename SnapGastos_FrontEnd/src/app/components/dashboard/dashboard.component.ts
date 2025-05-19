import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { jwtDecode } from 'jwt-decode';
import { Gasto, GastosService } from '../../services/gastos.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FormsModule],
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

  dataHoje: string = '';


  ngOnInit() {
    this.processarToken();

    this.dataHoje = this.dataAtual();

    this.gastosServices.getGastos().subscribe({
      next: (res) => {
        this.gastos = (res.gastos || []).filter(g => g && g.nome);
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


  private dataAtual() {
    const dataAtual = new Date();
    const anoAtual = dataAtual.getFullYear();
    const mesAtual = String(dataAtual.getMonth() + 1).padStart(2, '0');
    const diaAtual = String(dataAtual.getDate()).padStart(2, '0');
    return `${anoAtual}-${mesAtual}-${diaAtual}`
  }


  adicionarGasto(form: NgForm) {
    if (form.invalid) {
      return;
    }

    this.gastosServices.postGastos(form.value).subscribe({
      next: (res) => {
        this.gastos.push(res.gasto);
        form.resetForm();
      },
      error: (err) => {
        console.error('Erro ao adicionar: ', err);
      }
    });
  }


  deletarGasto(gasto: Gasto) {
    const mesToDelete = gasto.data.replaceAll("/", "-");
    this.gastosServices.deleteGasto(gasto.id, mesToDelete).subscribe({
      next: (res: any) => {
        console.log(res.mensagem);
        this.gastos = this.gastos.filter(g => g.id !== gasto.id);
      },
      error: (err) => {
        console.error('Erro ao remover gasto:', err);
      }
    });
  }
}
