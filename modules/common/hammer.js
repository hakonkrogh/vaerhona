import { isClient } from '../../core/utils';

var Hammer;
if (isClient) {
  Hammer = require('hammerjs');
}

export default Hammer;
