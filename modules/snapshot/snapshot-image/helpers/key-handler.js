export default class KeyHandler {

  constructor ({ onKeyPressAndRepeat }) {
    if (typeof document !== 'undefined' && document.addEventListener) {
      this.bind();

      this.onKeyPressAndRepeat = onKeyPressAndRepeat;
    }
  }
  
  bind () {
    if (typeof document !== 'undefined') {

      // Register the listener function
      this.onKeyPressListener = event => this.onKeyPress(event);

      document.addEventListener('keydown', this.onKeyPressListener, false);
    }
  }

  unBind () {
    if (typeof document !== 'undefined') {
      document.removeEventListener('keydown', this.onKeyPressListener);
    }
  }

  onKeyPress (event) {
    this.onKeyPressAndRepeat(event);
  }
}