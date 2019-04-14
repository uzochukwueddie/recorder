import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { takeWhile } from 'rxjs/operators';
import { File } from '@ionic-native/file/ngx';

import { TimerService } from 'src/app/services/timer.service';
import { Timer } from 'src/app/services/timer.interface';
import { RecorderService } from 'src/app/services/recorder.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {
  mins = '00';
  secs = '00';
  cents = '00';
  hasStarted = false;
  fileName: string;
  recordLength: string;

  private destroySubscription = false;

  constructor(
    private router: Router,
    private timerService: TimerService,
    private recorderService: RecorderService,
    private alertController: AlertController,
    private file: File,
  ) {}

  ngOnInit() {
    this.timerService.timerEmitter
      .pipe(takeWhile(() => !this.destroySubscription))
      .subscribe((data: Timer) => {
        this.mins = data.mins;
        this.secs = data.secs;
        this.cents = data.cents;
        this.recordLength = `${this.mins}-${this.secs}`;
      });
  }

  ngOnDestroy() {
    this.destroySubscription = true;
  }

  recordSound() {
    this.hasStarted = true;
    this.timerService.startTimer();
    this.recorderService.startRecord();
  }

  stopRecord() {
    this.timerService.resetTimer();
    this.recorderService.stopRecord();
    this.presentAlertPrompt();
    this.hasStarted = false;
  }

  recordings() {
    this.router.navigate(['/recordings']);
  }

  async presentAlertPrompt() {
    const alert = await this.alertController.create({
      header: 'Save Recording',
      inputs: [
        {
          name: 'title',
          type: 'text',
          value: this.recorderService.createRecordingName()
        }
      ],
      buttons: [
        {
          text: 'SAVE',
          handler: async (value) => {
            if (value.title) {
              this.fileName = `${value.title}_${this.recordLength}`;
            } else {
              this.fileName = `${this.recorderService.fileName}_${this.recordLength}`;
            }
            // move file to directory
            const path = this.file.externalRootDirectory + '/Recorder_Sounds';
            await this.file.moveFile(this.file.externalRootDirectory, this.recorderService.fileName + '.mp3', path, this.fileName + '.mp3');
          }
        },
        {
          text: 'CANCEL',
          role: 'cancel',
          handler: () => {
            console.log('COnform cancel');
          }
        },
      ]
    });

    await alert.present();
  }

}
