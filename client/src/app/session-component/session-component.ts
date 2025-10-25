import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpeakerModal } from '../speaker-modal/speaker-modal';
import { MatDialog } from '@angular/material/dialog';

// Material imports
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';

// ngx-graph imports
import { NgxGraphModule, Node } from '@swimlane/ngx-graph';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { AudioModal } from '../audio-modal/audio-modal';
import { Router } from '@angular/router';

interface Audio {
  id: number;
  name: string;
  desc: string;
}

interface Codeword {
  word: string;
  desc: string;
}

@Component({
  selector: 'app-session-component',
  imports: [
    MatCardModule,
    MatButtonModule,
    CommonModule,
    NgxGraphModule,
    NgxChartsModule,
    MatTableModule,
    MatIconModule,
  ],
  templateUrl: './session-component.html',
  styleUrl: './session-component.scss',
})
export class SessionComponent {
  summary =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc nec dictum augue. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Sed fringilla rutrum posuere. Vivamus maximus purus vitae ex sodales, nec aliquet sem vestibulum. Praesent varius risus at urna vulputate condimentum. Interdum et malesuada fames ac ante ipsum primis in faucibus. Pellentesque tempor, est in scelerisque condimentum, tellus dolor varius arcu, et sollicitudin magna urna id tortor. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc nec dictum augue. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Sed fringilla rutrum posuere. Vivamus maximus purus vitae ex sodales, nec aliquet sem vestibulum. Praesent varius risus at urna vulputate condimentum. Interdum et malesuada fames ac ante ipsum primis in faucibus. Pellentesque tempor, est in scelerisque condimentum, tellus dolor varius arcu, et sollicitudin magna urna id tortor.';
  placeholderText = 'Intercepted radio message of Russian soldiers communicating plan of attack';

  displayedColumns: string[] = ['word', 'desc'];
  codewords: Codeword[] = [
    { word: 'kaka', desc: 'This word is used to describe Faruk Demirovic.' },
    { word: 'kaka', desc: 'This word is used to describe Faruk Demirovic.' },
    { word: 'kaka', desc: 'This word is used to describe Faruk Demirovic.' },
  ];
  dataSource = this.codewords;

  audios: Audio[] = [
    { id: 1, name: 'Audio 1', desc: this.placeholderText },
    { id: 2, name: 'Audio 2', desc: this.placeholderText },
    { id: 3, name: 'Audio 3', desc: this.placeholderText },
    { id: 4, name: 'Audio 4', desc: this.placeholderText },
    { id: 5, name: 'Audio 5', desc: this.placeholderText },
    { id: 6, name: 'Audio 6', desc: this.placeholderText },
    { id: 7, name: 'Audio 7', desc: this.placeholderText },
    { id: 8, name: 'Audio 8', desc: this.placeholderText },
  ];

  nodes = [
    { id: '1', label: 'Root' },
    { id: '2', label: 'Child A' },
    { id: '3', label: 'Child B' },
    { id: '4', label: 'Single Node' },
  ];

  links = [
    { source: '1', target: '2', label: 'Edge 1-2' },
    { source: '1', target: '3', label: 'Edge 1-3' },
  ];

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(private dialog: MatDialog, private router: Router) {}

  onNodeClick(node: Node) {
    // Open SpeakerModal as a Material dialog and pass node ID
    this.dialog.open(SpeakerModal, {
      panelClass: 'dark-cyan-dialog',
      data: { speakerId: node.id },
    });
  }

  onAudioClick(id: number) {
    // Open Material dialog and pass audio ID
    this.dialog.open(AudioModal, {
      maxWidth: '80vw',
      panelClass: 'dark-cyan-dialog',
      data: { audioId: id },
    });
  }

  onAddClick() {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    console.log('Selected file:', file);
  }

  goBack() {
    this.router.navigate(['']);
  }
}
