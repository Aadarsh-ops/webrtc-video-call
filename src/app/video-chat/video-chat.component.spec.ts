import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoChatComponent } from './video-chat.component';

describe('LandingComponent', () => {
  let component: VideoChatComponent;
  let fixture: ComponentFixture<VideoChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VideoChatComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VideoChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
