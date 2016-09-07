import Hammer from 'hammerjs';

export default class PointerHandler {

  constructor ({ element, onPointerDownAndRepeat }) {
    
    if (!element && typeof document !== 'undefined') {
      element = document;
    }

    this.element = element;
    this.onPointerDownAndRepeat = onPointerDownAndRepeat;

    this.intervalAndTimeoutIds = [];

    this.bind();
  }
  
  bind () {
    this.hammerMc = new Hammer(this.element);

    this.hammerMc.get('press').set({
      time: 150
    });

    this.hammerMc.on('press', event => this.startInterval(event));
    this.hammerMc.on('pressup', event => this.stopInterval());
    this.hammerMc.on('hammer.input', event => {
      if (event.isFirst && event.pointers.length === 1) {
        this.onPointerDownAndRepeat(event);
        this.lastRecordedEvent = event;
      }
    });
  }

  unBind () {
    if (this.hammerMc) {
      this.hammerMc.destroy();
    }

    this.stopInterval();
  }

  startInterval (event) {
    this.lastRecordedEvent = event;

    this.stopInterval();

    this.intervalTick();

    // Initially, the intervals are 100ms apart
    this.intervalAndTimeoutIds.push(setTimeout(() => {
      this.intervalAndTimeoutIds.push(setInterval(this.intervalTick.bind(this), 75));

      // Then, after 500ms, the intervals are 25ms apart
      this.intervalAndTimeoutIds.push(setTimeout(() => {
        this.stopInterval();
        this.intervalAndTimeoutIds.push(setInterval(this.intervalTick.bind(this), 35));
      }, 500));
    }, 75));
  }

  stopInterval () {
    if (this.intervalAndTimeoutIds && this.intervalAndTimeoutIds.length > 0) {
      this.intervalAndTimeoutIds.forEach(id => clearTimeout(id));
      this.intervalAndTimeoutIds.length = 0;
    }
  }

  intervalTick () {
    if (this.lastRecordedEvent) {
      this.onPointerDownAndRepeat(this.lastRecordedEvent);
    }
  }
}