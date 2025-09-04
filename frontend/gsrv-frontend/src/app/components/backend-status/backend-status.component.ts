import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-backend-status',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="backend-status">
      <h2>Backend Status</h2>
      
      <div class="status-card" [class.connected]="isConnected" [class.disconnected]="!isConnected">
        <h3>Connection Status</h3>
        <p>{{ isConnected ? '✅ Connected to Backend' : '❌ Backend Not Connected' }}</p>
        <button (click)="testConnection()" [disabled]="isLoading">
          {{ isLoading ? 'Testing...' : 'Test Connection' }}
        </button>
      </div>

      <div class="data-section" *ngIf="isConnected">
        <h3>Backend Data</h3>
        <div class="data-grid">
          <div class="data-card">
            <h4>Stock Data</h4>
            <button (click)="getStockData()">Get Stock</button>
            <pre *ngIf="stockData">{{ stockData | json }}</pre>
          </div>
          
          <div class="data-card">
            <h4>Claims Data</h4>
            <button (click)="getClaimsData()">Get Claims</button>
            <pre *ngIf="claimsData">{{ claimsData | json }}</pre>
          </div>
        </div>
      </div>

      <div class="error-message" *ngIf="errorMessage">
        <p>Error: {{ errorMessage }}</p>
      </div>
    </div>
  `,
  styles: [`
    .backend-status {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }

    .status-card {
      background: #f5f5f5;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      border-left: 4px solid #ccc;
    }

    .status-card.connected {
      border-left-color: #4caf50;
      background: #e8f5e8;
    }

    .status-card.disconnected {
      border-left-color: #f44336;
      background: #ffebee;
    }

    button {
      background: #007bff;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      margin: 10px 5px;
    }

    button:hover {
      background: #0056b3;
    }

    button:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .data-section {
      margin-top: 30px;
    }

    .data-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .data-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #ddd;
    }

    .data-card h4 {
      margin-top: 0;
      color: #333;
    }

    pre {
      background: #f8f8f8;
      padding: 10px;
      border-radius: 4px;
      overflow-x: auto;
      font-size: 12px;
    }

    .error-message {
      background: #ffebee;
      color: #c62828;
      padding: 15px;
      border-radius: 4px;
      margin-top: 20px;
    }
  `]
})
export class BackendStatusComponent implements OnInit {
  isConnected = false;
  isLoading = false;
  errorMessage = '';
  stockData: any = null;
  claimsData: any = null;

  constructor(private apiService: ApiService, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.testConnection();
  }

  testConnection() {
    this.isLoading = true;
    this.errorMessage = '';

    this.apiService.testConnection().subscribe({
      next: (response: any) => {
        this.isConnected = true;
        this.isLoading = false;
        console.log('Backend connected:', response);
        this.cdr.detectChanges(); // Detect changes after connection test
      },
      error: (error: any) => {
        this.isConnected = false;
        this.isLoading = false;

        if (error.error && error.message) {
          this.errorMessage = `${error.error}: ${error.message}`;
        } else if (error.message) {
          this.errorMessage = error.message;
        } else {
          this.errorMessage = 'Failed to connect to backend';
        }

        console.error('Backend connection failed:', error);
        this.cdr.detectChanges(); // Detect changes after error
      }
    });
  }

  getStockData() {
    this.apiService.getStock().subscribe({
      next: (data: any) => {
        this.stockData = data;
        console.log('Stock data:', data);
        this.cdr.detectChanges(); // Detect changes after loading stock data
      },
      error: (error: any) => {
        this.errorMessage = 'Failed to get stock data: ' + error.message;
        console.error('Stock data error:', error);
        this.cdr.detectChanges(); // Detect changes after error
      }
    });
  }

  getClaimsData() {
    this.apiService.getClaims().subscribe({
      next: (data: any) => {
        this.claimsData = data;
        console.log('Claims data:', data);
        this.cdr.detectChanges(); // Detect changes after loading claims data
      },
      error: (error: any) => {
        this.errorMessage = 'Failed to get claims data: ' + error.message;
        console.error('Claims data error:', error);
        this.cdr.detectChanges(); // Detect changes after error
      }
    });
  }
}
