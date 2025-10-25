import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpeakerModal } from './speaker-modal';

describe('SpeakerModal', () => {
  let component: SpeakerModal;
  let fixture: ComponentFixture<SpeakerModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpeakerModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpeakerModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
