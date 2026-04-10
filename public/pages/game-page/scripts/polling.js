export default class Polling {
  constructor(callback, interval = 2000) {
    this.callback = callback;
    this.interval = interval;
    this.timer = null;
    this.isRunning = false;
  }

  start() {
    if (this.isRunning) return;

    this.isRunning = true;
    this.timer = setInterval(async () => {
      await this.callback();
    }, this.interval);
  }

  stop() {
    if (!this.isRunning) return;

    clearInterval(this.timer);
    this.timer = null;
    this.isRunning = false;
  }

  pause() {
    this.stop(); // same as stop
  }

  resume() {
    this.start();
  }

  setIntervalTime(newInterval) {
    this.interval = newInterval;

    // restart if already running
    if (this.isRunning) {
      this.stop();
      this.start();
    }
  }
}