import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AudioModal } from './audio-modal';

describe('AudioModal', () => {
  let component: AudioModal;
  let fixture: ComponentFixture<AudioModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AudioModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AudioModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
