import { Component, Inject } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
} from '@angular/material/dialog';
import { SpeakerModal } from '../speaker-modal/speaker-modal';
import { Utterance, Audio } from '../session-component/session-component';
import { LanguageService } from '../language.service';

interface Transcript {
  speaker: string;
  timestamp: string;
  content: string;
}

interface Speaker {
  name: string;
  id: number;
}

@Component({
  selector: 'app-audio-modal',
  imports: [MatDividerModule, MatTableModule, MatDialogModule],
  templateUrl: './audio-modal.html',
  styleUrl: './audio-modal.scss',
})
export class AudioModal {
  // audioId is provided via MAT_DIALOG_DATA when opened by MatDialog
  constructor(
    public dialogRef: MatDialogRef<AudioModal>,
    @Inject(MAT_DIALOG_DATA) public data: { audio: Audio },
    private dialog: MatDialog,
    private languageService: LanguageService
  ) {
    this.name = data.audio.name;
    this.transcripts =
      data.audio.utterances?.map((utt) => ({
        speaker: utt.speaker,
        timestamp: `${utt.start_time} - ${utt.end_time}`,
        content: languageService.currentLanguage === 'en' ? utt.text.en : utt.text.ru,
      })) || [];
  }

  language = 'en';
  name = 'Intercepted Communication 1';
  desc =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc nec dictum augue. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Sed fringilla rutrum posuere. Vivamus maximus purus vitae ex sodales, nec aliquet sem vestibulum. Praesent varius risus at urna vulputate condimentum. Interdum et malesuada fames ac ante ipsum primis in faucibus. Pellentesque tempor, est in scelerisque condimentum, tellus dolor varius arcu, et sollicitudin magna urna id tortor. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc nec dictum augue. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Sed fringilla rutrum posuere. Vivamus maximus purus vitae ex sodales, nec aliquet sem vestibulum. Praesent varius risus at urna vulputate condimentum. Interdum et malesuada fames ac ante ipsum primis in faucibus. Pellentesque tempor, est in scelerisque condimentum, tellus dolor varius arcu, et sollicitudin magna urna id tortor.';
  placeholderTranscript: Transcript = {
    speaker: 'Speaker A',
    content:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc nec dictum augue. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Sed fringilla rutrum posuere. Vivamus maximus purus vitae ex sodales, nec aliquet sem vestibulum. Praesent varius risus at urna vulputate condimentum. Interdum et malesuada fames ac ante ipsum primis',
    timestamp: '0:00-1:00',
  };
  displayedColumns: string[] = ['timestamp', 'speaker', 'content'];
  transcripts: Transcript[] = [
    this.placeholderTranscript,
    this.placeholderTranscript,
    this.placeholderTranscript,
  ];
  speakers: Speaker[] = [
    { name: 'Speaker A', id: 1 },
    { name: 'Speaker B', id: 2 },
  ];

  onClose() {
    this.dialogRef.close();
  }

  onSpeakerClick(speakerId: number) {
    // Close the material dialog, then open the SpeakerModal as a Material dialog
    this.dialogRef.close();
    this.dialog.open(SpeakerModal, {
      panelClass: 'dark-cyan-dialog',
      data: { speakerId: String(speakerId) },
    });
  }
}
