import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { jwtDecode } from 'jwt-decode';
import { NgChartsModule } from 'ng2-charts';
import { ChartData } from 'chart.js';
import { Gasto, GastosService } from '../../services/gastos.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FormsModule, NgChartsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  name: string = '';
  picture: string = '';
  email: string = '';
  gastos: Gasto[] = [];
  loading: boolean = true;

  dadosCategoria: ChartData<'pie'> = { labels: [], datasets: [{ data: [] }] };
  // dadosDia: ChartData<'bar'> = { labels: [], datasets: [{ data: [], label: 'Gastos por dia' }] }; WIP

  constructor(private route: ActivatedRoute, private gastosServices: GastosService) { }

  totalMes = 0;
  dataHoje: string = '';
  gastoEditando?: Gasto;
  modalAberto: boolean = false;


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

    this.carregarGraficos();
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


  private carregarGraficos() {
    const mesAtualTemp: string[] = this.dataHoje.split('-')
    const mesAtual: string = mesAtualTemp[1];
    this.gastosServices.getAnaliseCategoria(mesAtual).subscribe(res => {
      const categorias = Object.keys(res.resumoCategoria);
      const valores = Object.values(res.resumoCategoria);
      this.dadosCategoria = {
        labels: categorias,
        datasets: [{ data: valores }]
      };

      this.totalMes = valores.reduce((s, v) => s + v, 0);
    });

    // WIP
    // this.gastosService.getAnalisePorDia(this.mesAtual).subscribe(res => {
    //   const dias   = Object.keys(res.gastosPorDia);
    //   const valores = Object.values(res.gastosPorDia);
    //   this.dadosDia = {
    //     labels: dias,
    //     datasets: [{ data: valores, label: 'Gastos por dia' }]
    //   };
    // });
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


  editarGasto(gasto: Gasto) {
    const nome = prompt('Novo nome:', gasto.nome);
    const valor = prompt('Novo valor:', gasto.valor.toString());
    const categoria = prompt('Nova categoria:', gasto.categoria);
    const data = prompt('Nova data:', gasto.data);

    if (nome && valor && categoria && data) {
      const mesToUpdate = gasto.data.replaceAll("/", "-");
      const gastoAtualizado = { ...gasto, nome, valor: parseFloat(valor), categoria, data, mesToUpdate };

      this.gastosServices.updateGasto(gasto.id, gastoAtualizado, mesToUpdate).subscribe({
        next: () => {
          Object.assign(gasto, gastoAtualizado);
        },
        error: (err) => {
          console.error('Erro ao editar gasto:', err);
        }
      });
    }
  }

  salvarEdicao() {
    if (!this.gastoEditando) {
      return;
    }

    const mesToUpdate = this.gastoEditando.data.replaceAll("/", "-");
    this.gastosServices.updateGasto(this.gastoEditando.id, this.gastoEditando, mesToUpdate).subscribe({
      next: () => {
        const index = this.gastos.findIndex(g => g.id === this.gastoEditando!.id);
        if (index !== -1) {
          this.gastos[index] = { ...this.gastoEditando! };
          this.fecharModal();
          this.carregarGraficos();
        }
      },
      error: (err) => {
        console.error('Erro ao editar gasto:', err);
      }
    });
  }


  deletarGasto() {
    if (!this.gastoEditando) {
      return;
    }

    const mesToDelete = this.gastoEditando!.data.replaceAll("/", "-");
    this.gastosServices.deleteGasto(this.gastoEditando.id, mesToDelete).subscribe({
      next: () => {
        this.gastos = this.gastos.filter(g => g.id !== this.gastoEditando!.id);
        this.fecharModal();
        this.carregarGraficos();
      },
      error: (err) => {
        console.error('Erro ao remover gasto:', err);
      }
    });
  }


  getTotalGastosMes(): number {
    return this.gastos.reduce((total, g) => total + (g.valor || 0), 0);
  }

  abrirModal(gasto: Gasto) {
    this.gastoEditando = { ...gasto };
    this.modalAberto = true;
  }

  fecharModal() {
    this.modalAberto = false;
    this.gastoEditando = undefined;
  }
}
