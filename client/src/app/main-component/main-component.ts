import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Material imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

interface Context {
  id: number;
  name: string;
  dateCreated: string;
  desc: string;
}

@Component({
  selector: 'app-main-component',
  imports: [MatCardModule, MatButtonModule, CommonModule],
  templateUrl: './main-component.html',
  styleUrl: './main-component.scss',
})
export class MainComponent {
  readonly dialog = inject(MatDialog);

  constructor(private router: Router) {}

  contexts: Context[] = [
    {
      id: 1,
      name: 'Session 1',
      dateCreated: 'Oct 25, 2025',
      desc: 'Intercepted radio message of Russian soldiers communicating plan of attack',
    },
    {
      id: 2,
      name: 'Session 2',
      dateCreated: 'Oct 23, 2025',
      desc: 'Intercepted radio message of Russian soldiers communicating plan of attack',
    },
  ];

  openSession(contextId: number) {
    console.log(contextId);
    this.router.navigate(['session', { id: contextId }]);
  }

  openAddDialog() {
    const dialogRef = this.dialog.open(AddSessionDialog, {});
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

  onSubmit(): void {
    console.log(this.name);
    this.dialogRef.close();
  }
}
