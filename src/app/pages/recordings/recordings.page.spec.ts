import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecordingsPage } from './recordings.page';

describe('RecordingsPage', () => {
  let component: RecordingsPage;
  let fixture: ComponentFixture<RecordingsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RecordingsPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecordingsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
