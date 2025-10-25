import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

export interface Speaker {
  id: string;
  name: string;
  description: string;
}

@Component({
  selector: 'app-speaker-modal',
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './speaker-modal.html',
  styleUrl: './speaker-modal.scss',
})
export class SpeakerModal {
  // speakerId is provided via MAT_DIALOG_DATA when opened by MatDialog
  speaker: Speaker = { id: '', name: '', description: '' };

  constructor(
    public dialogRef: MatDialogRef<SpeakerModal>,
    @Inject(MAT_DIALOG_DATA) public data: { speaker: Speaker }
  ) {}

  onClose() {
    this.dialogRef.close();
  }
}
