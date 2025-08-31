import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-global-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Global loading disabled -->
  `,
  styles: [`
    /* Global loading disabled */
  `]
})
export class GlobalLoadingComponent implements OnInit {
  loading = false;

  constructor(private apiService: ApiService) { }

  ngOnInit() {
    // Disabled global loading
  }
}
