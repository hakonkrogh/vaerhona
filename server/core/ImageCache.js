
let cache = Symbol('cache');

export default class ImageCache {
  constructor () {

    this.maxFilesToCache = 10;

    this[cache] = [];
  }

  add ({ src, image }) {
    if (!this.includes({ src })) {
      this[cache].unshift({ src, image });

      if (this[cache].length > this.maxFilesToCache) {
        this[cache].length = 10;
      }
    }
  }

  get ({ src }) {
    const item = this[cache].find(item => item.src === src);

    if (item) {
      return item.image;
    }

    return false;
  }

  includes ({ src }) {
    return !!this.get({ src });
  }
}