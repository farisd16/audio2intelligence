import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

// Material imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

interface Context {
  id: number;
  name: string;
  date: string;
  desc: string;
}

@Component({
  selector: 'app-main-component',
  imports: [MatCardModule, MatButtonModule, CommonModule],
  templateUrl: './main-component.html',
  styleUrl: './main-component.scss',
})
export class MainComponent implements OnInit {
  readonly dialog = inject(MatDialog);

  constructor(private router: Router, private http: HttpClient, private cdr: ChangeDetectorRef) {}

  private url = 'http://localhost:8000';

  contexts: Context[] = [
    {
      id: 1,
      name: 'Session 1',
      date: 'Oct 25, 2025',
      desc: 'Intercepted radio message of Russian soldiers communicating plan of attack',
    },
    {
      id: 2,
      name: 'Session 2',
      date: 'Oct 23, 2025',
      desc: 'Intercepted radio message of Russian soldiers communicating plan of attack',
    },
  ];

  refreshContexts() {
    // Refresh the contexts list after closing the dialog
    this.http.get<Context[]>(this.url).subscribe({
      next: (data) => {
        this.contexts = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error fetching contexts:', error);
      },
    });
  }

  ngOnInit(): void {
    this.refreshContexts();
  }

  openSession(contextId: number) {
    this.router.navigate(['session'], { queryParams: { id: contextId } });
  }

  openAddDialog() {
    const dialogRef = this.dialog.open(AddSessionDialog, {});

    dialogRef.afterClosed().subscribe((result) => {
      this.refreshContexts();
    });
  }
}

@Component({
  selector: 'add-session-dialog',
  templateUrl: 'add-session-dialog.html',
  imports: [FormsModule, MatButtonModule, MatDialogModule, MatInputModule, MatFormFieldModule],
})
export class AddSessionDialog {
  readonly dialogRef = inject(MatDialogRef<AddSessionDialog>);
  name = '';

  constructor(private http: HttpClient) {}

  private url = 'http://localhost:8000';

  onSubmit(): void {
    this.http.post(this.url + '/create-context', { name: this.name }).subscribe({
      next: (response) => {
        console.log('Context created successfully:', response);
      },
      error: (error) => {
        console.error('Error creating context:', error);
      },
    });
    this.dialogRef.close();
  }
}
