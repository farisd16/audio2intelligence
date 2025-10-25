import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpeakerModal } from '../speaker-modal/speaker-modal';
import { AudioModal } from '../audio-modal/audio-modal';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Speaker } from '../speaker-modal/speaker-modal';

// Material imports
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';

// ngx-graph imports
import { NgxGraphModule, Node } from '@swimlane/ngx-graph';
import { NgxChartsModule } from '@swimlane/ngx-charts';

export interface Audio {
  id: number;
  name: string;
  description: string;
  utterances?: Utterance[];
}

interface Codeword {
  word: string;
  meaning: string;
}

export interface Utterance {
  speaker: string;
  start_time: string;
  end_time: string;
  text: { en: string; ru: string };
}

interface ContextResponseData {
  context: {
    name: string;
    description: string;
    // backend returns a list of objects like { word: string, meaning: string }
    codewords: Array<{ word: string; meaning: string }>;
  };
  hierarchy: Array<{
    parent_name: string;
    child_name: string;
  }>;
  speakers: Speaker[];
  audio_samples: Audio[];
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
    ReactiveFormsModule,
    FormsModule,
  ],
  templateUrl: './session-component.html',
  styleUrl: './session-component.scss',
})
export class SessionComponent implements OnInit {
  private url = 'http://localhost:8000';

  summary =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc nec dictum augue. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Sed fringilla rutrum posuere. Vivamus maximus purus vitae ex sodales, nec aliquet sem vestibulum. Praesent varius risus at urna vulputate condimentum. Interdum et malesuada fames ac ante ipsum primis in faucibus. Pellentesque tempor, est in scelerisque condimentum, tellus dolor varius arcu, et sollicitudin magna urna id tortor. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc nec dictum augue. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Sed fringilla rutrum posuere. Vivamus maximus purus vitae ex sodales, nec aliquet sem vestibulum. Praesent varius risus at urna vulputate condimentum. Interdum et malesuada fames ac ante ipsum primis in faucibus. Pellentesque tempor, est in scelerisque condimentum, tellus dolor varius arcu, et sollicitudin magna urna id tortor.';
  placeholderText = 'Intercepted radio message of Russian soldiers communicating plan of attack';
  contextId: string = '';
  language = 'en';

  displayedColumns: string[] = ['word', 'desc'];
  codewords: Codeword[] = [];
  dataSource = this.codewords;

  audios: Audio[] = [
    { id: 1, name: 'Audio 1', description: this.placeholderText },
    { id: 2, name: 'Audio 2', description: this.placeholderText },
    { id: 3, name: 'Audio 3', description: this.placeholderText },
    { id: 4, name: 'Audio 4', description: this.placeholderText },
    { id: 5, name: 'Audio 5', description: this.placeholderText },
    { id: 6, name: 'Audio 6', description: this.placeholderText },
    { id: 7, name: 'Audio 7', description: this.placeholderText },
    { id: 8, name: 'Audio 8', description: this.placeholderText },
  ];

  nodes: { id: string; label?: string }[] = [];
  links: { source: string; target: string }[] = [];
  speakers: Speaker[] = [];

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private http: HttpClient,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.contextId = params['id'];
      this.resetContext();
    });
  }

  resetContext() {
    this.http.get<ContextResponseData>(this.url + '/' + this.contextId).subscribe((context) => {
      this.audios = context.audio_samples;
      this.summary = context.context.description;
      // map backend codewords (array of {word, meaning}) into our Codeword[]
      if (Array.isArray(context.context.codewords)) {
        this.codewords = context.context.codewords.map((cw) => ({
          word: cw.word,
          meaning: cw.meaning,
        }));
      } else {
        // Fallback: keep previous empty list
        this.codewords = [];
      }

      this.dataSource = this.codewords;
      this.speakers = context.speakers;
      this.nodes = context.speakers.map((speaker) => ({
        id: speaker.id,
        label: speaker.name,
      }));
      this.links = context.hierarchy
        .map((h) => {
          // Find the corresponding node IDs
          const parentNode = this.nodes.find((n) => n.label === h.parent_name);
          const childNode = this.nodes.find((n) => n.label === h.child_name);

          // Only include the link if both nodes exist
          if (parentNode && childNode) {
            return {
              source: parentNode.id,
              target: childNode.id,
            };
          }
          // Skip invalid links
          return null;
        })
        .filter((l) => l !== null);
      this.cdr.detectChanges();
    });
  }

  onNodeClick(node: Node) {
    // Open SpeakerModal as a Material dialog and pass node ID
    this.dialog.open(SpeakerModal, {
      panelClass: 'dark-cyan-dialog',
      data: { speaker: this.speakers.find((n) => n.id === node.id) },
    });
  }

  onAudioClick(id: number) {
    // Open Material dialog and pass audio ID
    this.dialog.open(AudioModal, {
      maxWidth: '80vw',
      panelClass: 'dark-cyan-dialog',
      data: { audio: this.audios[id] },
    });
  }

  onAddClick() {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const formData = new FormData();
    formData.append('context_id', this.contextId); // form field
    formData.append('audio_sample', input.files[0], input.files[0].name); // file field
    this.http.put(this.url + '/upload', formData).subscribe({
      next: () => {
        this.resetContext();
      },
      error: (error) => {
        console.error('Error uploading file:', error);
      },
    });
  }

  goBack() {
    this.router.navigate(['']);
  }
}
