import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  name: string = '';
  photo: string = '';
  email: string = '';

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    // Pegando dados
    const token = this.route.snapshot.queryParamMap.get('token');
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        this.name = decoded.name;
        this.photo = decoded.photo;
        this.email = decoded.email || '';
      }
      catch (err) {
        console.error('Token inválido:', err);
      }
    }
  }
}
