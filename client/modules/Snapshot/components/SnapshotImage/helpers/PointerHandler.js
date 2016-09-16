import Hammer from 'hammerjs';

export default class PointerHandler {

  constructor ({ element, onPointerDownAndRepeat, onSwipe }) {
    
    if (!element && typeof document !== 'undefined') {
      element = document;
    }

    this.element = element;
    this.onPointerDownAndRepeat = onPointerDownAndRepeat;
    this.onSwipe = onSwipe;

    this.intervalAndTimeoutIds = [];

    this.bind();
  }
  
  bind () {
    this.hammertime = new Hammer(this.element);

    this.hammertime.get('press').set({ time: 150 });
    this.hammertime.get('swipe').set({ direction: Hammer.DIRECTION_HORIZONTAL });
    
    this.hammertime.on('tap', event => {
      if (event.pointers.length === 1) {
        this.onPointerDownAndRepeat(event);
        this.lastRecordedEvent = event;
      }
    });
    this.hammertime.on('press', event => this.startInterval(event));
    this.hammertime.on('pressup', event => this.stopInterval());
    this.hammertime.on('swipe', event => {
      if (event.deltaX < 0) {
        this.onSwipe('left');
      }
      else {
        this.onSwipe('right');
      }
    });
  }

  unBind () {
    if (this.hammertime) {
      this.hammertime.destroy();
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