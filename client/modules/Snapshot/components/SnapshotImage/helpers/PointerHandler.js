import Hammer from 'hammerjs';

export default class PointerHandler {

  constructor ({ element, onPointerDownAndRepeat, onSwipe }) {
    
    if (!element && typeof document !== 'undefined') {
      element = document;
    }

    this.element = element;
    this.onPointerDownAndRepeat = onPointerDownAndRepeat;
    this.onSwipe = onSwipe;

    this.timeoutIds = [];
    this.intervalIds = [];

    this.bind();
  }
  
  bind () {
    this.hammertime = new Hammer(this.element, { touchAction : 'auto' });

    this.hammertime.get('press').set({ time: 150 });
    
    this.hammertime.on('tap', event => {
      if (event.pointers.length === 1) {
        this.onPointerDownAndRepeat(event);
        this.lastRecordedEvent = event;
      }
    });
    this.hammertime.on('press', event => this.startInterval(event));
    this.hammertime.on('pressup', event => this.stopTimeoutAndIntervals());
  }

  unBind () {
    if (this.hammertime) {
      this.hammertime.destroy();
    }

    this.stopTimeoutAndIntervals();
  }

  startInterval (event) {
    this.lastRecordedEvent = event;

    this.stopTimeoutAndIntervals();

    this.intervalTick();

    // Initially, the intervals are 100ms apart
    this.timeoutIds.push(setTimeout(() => {
      this.intervalIds.push(setInterval(this.intervalTick.bind(this), 75));

      // Then, after 500ms, the intervals are 25ms apart
      this.timeoutIds.push(setTimeout(() => {
        this.stopTimeoutAndIntervals();
        this.intervalIds.push(setInterval(this.intervalTick.bind(this), 35));
      }, 500));
    }, 75));
  }

  stopTimeoutAndIntervals () {
    if (this.timeoutIds) {
      this.timeoutIds.forEach(id => clearTimeout(id));
      this.timeoutIds.length = 0;
    }
    if (this.intervalIds) {
      this.intervalIds.forEach(id => clearInterval(id));
      this.intervalIds.length = 0;
    }
  }

  intervalTick () {
    if (this.lastRecordedEvent) {
      this.onPointerDownAndRepeat(this.lastRecordedEvent);
    }
  }
}