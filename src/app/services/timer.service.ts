import { Injectable, EventEmitter } from '@angular/core';
import { RecorderService } from './recorder.service';


@Injectable({
  providedIn: 'root'
})
export class TimerService {
  duration: number;
  currentTimer = 0;
  interval: any;
  lastUpdateTime = new Date().getTime();
  timerEmitter = new EventEmitter<Object>();

  mins: string;
  secs: string;
  cents: string;
  steps = 0;
  recordDuration: string;

  constructor(
    private recorderService: RecorderService
  ) {
    this.recorderService.durationEmitter
      .subscribe(data => {
        this.duration = data;
      });
  }

  startTimer() {
    if (!this.interval) {
      this.lastUpdateTime = new Date().getTime();
      this.interval = setInterval(() => {
        const now = new Date().getTime();
        const dt = now - this.lastUpdateTime;
        this.currentTimer += dt;
        const time = new Date(this.currentTimer);
        this.mins = this.pad(time.getMinutes());
        this.secs = this.pad(time.getSeconds());
        this.cents = this.pad(Math.floor(time.getMilliseconds() / 10));
        this.steps = time.getSeconds();
        this.recordDuration = `${this.mins}:${this.secs}`;
        this.lastUpdateTime = now;

        if (this.steps === this.duration) {
          clearInterval(this.interval);
          const timer = {
            complete: true,
            steps: this.steps,
            mins: this.mins,
            secs: this.secs,
            cents: this.cents,
            recordDuration: this.recordDuration
          };
          this.timerEmitter.emit(timer);
        } else {
          const timer = {
            complete: false,
            steps: this.steps,
            mins: this.mins,
            secs: this.secs,
            cents: this.cents,
            recordDuration: this.recordDuration
          };
          this.timerEmitter.emit(timer);
        }
      }, 1);
    }
  }

  stopTimer() {
    clearInterval(this.interval);
    this.interval = 0;
  }

  resetTimer() {
    this.stopTimer();
    this.currentTimer = 0;
    this.mins = this.pad('0');
    this.secs = this.pad('0');
    this.cents = this.pad('0');
  }

  pad(n) {
    return (n < 10) ? `0${n}` : n.toString();
  }
}
