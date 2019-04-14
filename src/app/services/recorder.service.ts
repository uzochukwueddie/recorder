import { Injectable, EventEmitter } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Media, MediaObject } from '@ionic-native/media/ngx';
import { File } from '@ionic-native/file/ngx';

@Injectable({
  providedIn: 'root'
})
export class RecorderService {
  filePath: string;
  fileName: string;
  audio: MediaObject;
  duration: number;
  durationEmitter = new EventEmitter<number>();

  constructor(
    private media: Media,
    private file: File,
    private platform: Platform
  ) { }

  startRecord() {
    if (this.platform.is('android')) {
      this.fileName = this.createRecordingName();
      this.file.checkDir(this.file.externalRootDirectory, 'Recorder_Sounds')
        .then(() => {
          this.filePath = this.file.externalRootDirectory.replace(/file:\/\//g, '') + this.fileName;
          this.audio = this.media.create(this.filePath + '.mp3');
          this.audio.startRecord();
        })
        .catch(() => {
          this.file.createDir(this.file.externalRootDirectory, 'Recorder_Sounds', false)
            .then(() => {
              this.filePath = this.file.externalRootDirectory.replace(/file:\/\//g, '') + this.fileName;
              this.audio = this.media.create(this.filePath + '.mp3');
              this.audio.startRecord();
            })
            .catch((error) => {
              console.log('Directory not created' + error);
            });
        });
    }
  }

  public stopRecord() {
    this.audio.stopRecord();
    this.audio.release();
  }

  playAudio(path) {
    if (this.platform.is('android')) {
      this.audio = this.media.create(path);
      this.audio.play();
      this.audio.setVolume(1);

      this.audio.onStatusUpdate.subscribe((status) => {
        this.duration = Math.round(this.audio.getDuration());
        this.durationEmitter.emit(this.duration);
      });
    }
  }

  stopAudio() {
    if (this.platform.is('android')) {
      this.audio.stop();
      this.audio.release();
    }
  }

  pauseAudio() {
    this.audio.pause();
  }

  resumeAudio() {
    this.audio.play();
  }

  async listFilesInDir() {
    if (this.platform.is('android')) {
      const arr = [];
      const files = await this.file.listDir(this.file.externalRootDirectory, 'Recorder_Sounds');
      for (const item of files) {
        const file: any = await this.getFile(item);
        const itemName = item.name.split('.').slice(0, -1).join('.');
        const date = new Date(file.lastModified);
        const name = itemName.split('_');
        const duration = name[name.length - 1].replace(/-/g, ':');
        name.pop();
        arr.push({
          name: name.join('_'),
          path: item.fullPath,
          nativeUrl: item.nativeURL,
          date: this.getRecordingDate(date),
          duration
        });
      }
      return arr;
    }
  }

  async getFile(fileEntry) {
    try {
      return await new Promise((resolve, reject) => fileEntry.file(resolve, reject));
    } catch(err) {
      console.log(err);
    }
  }

  async removeFileFromDir(fileName) {
    if (this.platform.is('android')) {
      const path = this.file.externalRootDirectory + 'Recorder_Sounds';
      await this.file.removeFile(path, fileName);
    }
  }

  createRecordingName() {
    const today = new Date();
    const day = String(today.getDate());
    const month = String(today.getMonth() + 1);
    const year = today.getFullYear();
    const hour = this.pad(today.getHours());
    const mins = this.pad(today.getMinutes());
    const secs = this.pad(today.getSeconds());

    return `${year}${month}${day}_${hour}${mins}${secs}`;
  }

  getRecordingDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }

  pad(n) {
    return (n < 10) ? `0${n}` : n.toString();
  }
}
