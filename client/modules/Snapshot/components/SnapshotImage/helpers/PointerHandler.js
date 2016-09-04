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
    this.hammerMc = new Hammer.Manager(this.element);
    this.hammerMc.on('hammer.input', event => this.onInput(event));
  }

  unBind () {
    if (this.hammerMc) {
      this.hammerMc.destroy();
    }

    this.stopInterval();
  }

  onInput (event) {
    if (!event.isFinal && event.pointers.length === 1) {
      this.onPointerDownAndRepeat(event);

      if (event.isFirst) {
        this.startInterval(event);
      }
    }
    else {
      this.stopInterval();
    }
  }

  startInterval (event) {
    this.lastEvent = event;

    this.stopInterval();

    // Initially, the intervals are 100ms apart
    this.intervalAndTimeoutIds.push(setTimeout(() => {
      this.intervalAndTimeoutIds.push(setInterval(this.intervalTick.bind(this), 100));

      // Then, after 500ms, the intervals are 25ms apart
      this.intervalAndTimeoutIds.push(setTimeout(() => {
        this.intervalAndTimeoutIds.push(setInterval(this.intervalTick.bind(this), 50));
      }, 500));
    }, 500));
  }

  stopInterval () {
    if (this.intervalAndTimeoutIds && this.intervalAndTimeoutIds.length > 0) {
      this.intervalAndTimeoutIds.forEach(id => clearTimeout(id));
      this.intervalAndTimeoutIds.length = 0;
    }
  }

  intervalTick () {
    if (this.lastEvent) {
      this.onPointerDownAndRepeat(this.lastEvent);
    }
  }
}