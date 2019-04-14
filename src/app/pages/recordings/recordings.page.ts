import { TimerService } from 'src/app/services/timer.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { RecorderService } from 'src/app/services/recorder.service';
import { takeWhile } from 'rxjs/operators';
import { Timer } from 'src/app/services/timer.interface';

@Component({
  selector: 'app-recordings',
  templateUrl: './recordings.page.html',
  styleUrls: ['./recordings.page.scss'],
})
export class RecordingsPage implements OnInit, OnDestroy {
  records = [];
  isPaused: boolean;
  isPlaying: boolean;
  isComplete: boolean;
  filename: string;

  mins = '00';
  secs = '00';
  recordDuration: string;
  steps = 0;

  private destroySubscription = false;

  constructor(
    private recorderService: RecorderService,
    private timerService: TimerService
  ) { }

  ngOnInit() {
    this.allRecordings();
    this.timerService.timerEmitter
      .pipe(takeWhile(() => !this.destroySubscription))
      .subscribe((data: Timer) => {
        this.mins = data.mins;
        this.secs = data.secs;
        this.steps = data.steps;
        this.isPaused = false;
        if (data.complete) {
          this.isPaused = true;
          this.isComplete = true;
          this.timerService.stopTimer();
        }
      });
  }

  ngOnDestroy() {
    this.destroySubscription = true;
  }

  allRecordings() {
    this.recorderService.listFilesInDir()
      .then((data) => {
        this.records = data;
      });
  }

  playAudio(file) {
    if (this.isPlaying) {
      this.recorderService.stopAudio();
    }
    this.timerService.resetTimer();
    this.timerService.startTimer();
    this.isPaused = false;
    this.isPlaying = true;
    this.isComplete = false;
    this.filename = file.name;
    this.recorderService.playAudio(file.path);
  }

  stopPlaying() {
    this.steps = 0;
    this.recorderService.stopAudio();
    this.timerService.stopTimer();
    this.timerService.resetTimer();
  }

  pauseAudio(file) {
    this.isPaused = true;
    this.isPlaying = false;
    this.isComplete = false;
    this.filename = file.name;
    this.recorderService.pauseAudio();
    this.timerService.stopTimer();
  }

  resumeAudio(file) {
    this.isPaused = false;
    this.isPlaying = true;
    this.isComplete = false;
    this.filename = file.name;
    this.recorderService.resumeAudio();
    this.timerService.startTimer();
  }

  deleteAudio(record) {
    const value = `${record.name}_${record.duration.replace(/:/g, '-')}`;
    this.recorderService.removeFileFromDir(value + '.mp3')
      .then(() => {
        this.allRecordings();
      });
  }

  changeDuratioToSeconds(duration) {
    const d = duration.split(':');
    const d1 = Number(d[0]);
    const d2 = Number(d[1]);

    return (d1 * 60) + d2;
  }

}
