/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.l = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 70);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports) {

	module.exports = require("react");

/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = require("react-redux");

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = require("react-helmet");

/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = require("react-router");

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.Header = undefined;

	var _jsx = function () { var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7; return function createRawReactElement(type, props, key, children) { var defaultProps = type && type.defaultProps; var childrenLength = arguments.length - 3; if (!props && childrenLength !== 0) { props = {}; } if (props && defaultProps) { for (var propName in defaultProps) { if (props[propName] === void 0) { props[propName] = defaultProps[propName]; } } } else if (!props) { props = defaultProps || {}; } if (childrenLength === 1) { props.children = children; } else if (childrenLength > 1) { var childArray = Array(childrenLength); for (var i = 0; i < childrenLength; i++) { childArray[i] = arguments[i + 3]; } props.children = childArray; } return { $$typeof: REACT_ELEMENT_TYPE, type: type, key: key === undefined ? null : '' + key, ref: null, props: props, _owner: null }; }; }();

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(0);

	var _react2 = _interopRequireDefault(_react);

	var _Header = {
	  "header__content": "Header__header__content__2m0LM"
	};

	var _Header2 = _interopRequireDefault(_Header);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	// Import Style


	var Header = exports.Header = function (_Component) {
	  _inherits(Header, _Component);

	  function Header() {
	    _classCallCheck(this, Header);

	    return _possibleConstructorReturn(this, (Header.__proto__ || Object.getPrototypeOf(Header)).apply(this, arguments));
	  }

	  _createClass(Header, [{
	    key: 'render',
	    value: function render() {
	      return _jsx('div', {
	        className: _Header2.default['header']
	      }, void 0, _jsx('div', {
	        className: _Header2.default['header__content']
	      }, void 0, this.props.children));
	    }
	  }]);

	  return Header;
	}(_react.Component);

	exports.default = Header;

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.getSelectedMainNavigation = exports.getPlace = exports.getSelectedPlace = exports.getPlaces = undefined;

	var _PlaceActions = __webpack_require__(8);

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

	// Initial State
	var initialState = {
	  data: [],
	  selected: false
	};

	var PlaceReducer = function PlaceReducer() {
	  var state = arguments.length <= 0 || arguments[0] === undefined ? initialState : arguments[0];
	  var action = arguments[1];

	  switch (action.type) {
	    case _PlaceActions.ADD_PLACE:
	      return {
	        data: [action.place].concat(_toConsumableArray(state.data)),
	        selected: action.place
	      };

	    case _PlaceActions.ADD_PLACES:
	      return {
	        data: [].concat(_toConsumableArray(state.data), _toConsumableArray(action.places)),
	        selected: !state.selected && action.places ? action.places[action.places.length - 1] : state.selected
	      };

	    case _PlaceActions.DELETE_PLACE:
	      var selected = state.selected;

	      // We are deleting the selected one
	      if (state.selected && state.selected.name === action.name) {
	        selected = initialState.selected;
	      }

	      return {
	        data: state.data.filter(function (place) {
	          return place.cuid !== action.cuid;
	        }),
	        selected: selected
	      };

	    case _PlaceActions.UNSELECT_PLACE:
	      return {
	        data: state.data,
	        selected: initialState.selected
	      };

	    default:
	      return state;
	  }
	};

	/* Selectors */

	// Get all places
	var getPlaces = exports.getPlaces = function getPlaces(state) {
	  return state.places.data;
	};

	// Get selected place
	var getSelectedPlace = exports.getSelectedPlace = function getSelectedPlace(state) {
	  return state.places.selected;
	};

	// Get place by cuid
	var getPlace = exports.getPlace = function getPlace(state, cuid) {
	  return state.places.data.filter(function (place) {
	    return place.cuid === cuid;
	  })[0];
	};

	// Get selected main navigation
	var getSelectedMainNavigation = exports.getSelectedMainNavigation = function getSelectedMainNavigation(state) {
	  return state.places.mainNavigation;
	};

	// Export Reducer
	exports.default = PlaceReducer;

/***/ },
/* 6 */
/***/ function(module, exports) {

	module.exports = require("react-intl");

/***/ },
/* 7 */
/***/ function(module, exports) {

	"use strict";
	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var config = {
	  mongoURL: process.env.MONGO_URL || 'mongodb://localhost:27017/vaerhona',
	  port: process.env.PORT || 8000,
	  aws: {}
	};

	var buckets = {
	  'development': 'vaerhona-development',
	  'staging': 'vaerhona-staging',
	  'production': 'vaerhona'
	};

	config.aws.s3BucketName = buckets[process.env.AWS_PROFILE];
	config.imageUrlBase = 'https://' + config.aws.s3BucketName + '.s3-eu-west-1.amazonaws.com';

	Object.freeze(config);

	exports.default = config;

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.UNSELECT_PLACE = exports.DELETE_PLACE = exports.ADD_PLACES = exports.ADD_PLACE = undefined;
	exports.addPlace = addPlace;
	exports.unselectPlace = unselectPlace;
	exports.addPlaceRequest = addPlaceRequest;
	exports.addPlaces = addPlaces;
	exports.fetchPlaces = fetchPlaces;
	exports.fetchPlace = fetchPlace;
	exports.deletePlace = deletePlace;
	exports.deletePlaceRequest = deletePlaceRequest;

	var _apiCaller = __webpack_require__(26);

	var _apiCaller2 = _interopRequireDefault(_apiCaller);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	// Export Constants
	var ADD_PLACE = exports.ADD_PLACE = 'ADD_PLACE';
	var ADD_PLACES = exports.ADD_PLACES = 'ADD_PLACES';
	var DELETE_PLACE = exports.DELETE_PLACE = 'DELETE_PLACE';
	var UNSELECT_PLACE = exports.UNSELECT_PLACE = 'UNSELECT_PLACE';

	// Export Actions
	function addPlace(place) {
	  return {
	    type: ADD_PLACE,
	    place: place
	  };
	}

	function unselectPlace() {
	  return {
	    type: UNSELECT_PLACE
	  };
	}

	function addPlaceRequest(place) {
	  return function (dispatch) {
	    return (0, _apiCaller2.default)('place', 'post', {
	      place: {
	        cuid: place.cuid,
	        name: place.name
	      }
	    }).then(function (res) {
	      return dispatch(addPlace(res.place));
	    });
	  };
	}

	function addPlaces(places) {
	  return {
	    type: ADD_PLACES,
	    places: places
	  };
	}

	function fetchPlaces() {
	  return function (dispatch) {
	    return (0, _apiCaller2.default)('places').then(function (res) {
	      dispatch(addPlaces(res.places));
	    });
	  };
	}

	function fetchPlace(name) {
	  return function (dispatch) {
	    return (0, _apiCaller2.default)('places/' + name).then(function (res) {
	      if (res.place) {
	        return dispatch(addPlace(res.place));
	      }
	    });
	  };
	}

	function deletePlace(cuid) {
	  return {
	    type: DELETE_PLACE,
	    cuid: cuid
	  };
	}

	function deletePlaceRequest(cuid) {
	  return function (dispatch) {
	    return (0, _apiCaller2.default)('places/' + cuid, 'delete').then(function () {
	      return dispatch(deletePlace(cuid));
	    });
	  };
	}

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.SHOW_SNAPSHOT_FROM_INDEX = exports.SHOW_NEXT_SNAPSHOT = exports.SHOW_PREV_SNAPSHOT = exports.DELETE_SNAPSHOT = exports.ADD_SNAPSHOTS = exports.ADD_SNAPSHOT = undefined;
	exports.addSnapshot = addSnapshot;
	exports.addSnapshotRequest = addSnapshotRequest;
	exports.addSnapshots = addSnapshots;
	exports.fetchSnapshots = fetchSnapshots;
	exports.deleteSnapshot = deleteSnapshot;
	exports.deleteSnapshotRequest = deleteSnapshotRequest;
	exports.showPrevSnapshot = showPrevSnapshot;
	exports.showNextSnapshot = showNextSnapshot;
	exports.showSnapshotFromIndex = showSnapshotFromIndex;

	var _apiCaller = __webpack_require__(26);

	var _apiCaller2 = _interopRequireDefault(_apiCaller);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	// Export Constants
	var ADD_SNAPSHOT = exports.ADD_SNAPSHOT = 'ADD_SNAPSHOT';
	var ADD_SNAPSHOTS = exports.ADD_SNAPSHOTS = 'ADD_SNAPSHOTS';
	var DELETE_SNAPSHOT = exports.DELETE_SNAPSHOT = 'DELETE_SNAPSHOT';
	var SHOW_PREV_SNAPSHOT = exports.SHOW_PREV_SNAPSHOT = 'SHOW_PREV_SNAPSHOT';
	var SHOW_NEXT_SNAPSHOT = exports.SHOW_NEXT_SNAPSHOT = 'SHOW_NEXT_SNAPSHOT';
	var SHOW_SNAPSHOT_FROM_INDEX = exports.SHOW_SNAPSHOT_FROM_INDEX = 'SHOW_SNAPSHOT_FROM_INDEX';

	// Export Actions
	function addSnapshot(snapshot) {
	  return {
	    type: ADD_SNAPSHOT,
	    snapshot: snapshot
	  };
	}

	function addSnapshotRequest(snapshot) {
	  return function (dispatch) {
	    return (0, _apiCaller2.default)('snapshots', 'post', {
	      snapshot: {
	        placeCuid: snapshot.placeCuid,
	        temperature: snapshot.temperature,
	        pressure: snapshot.pressure,
	        humidity: snapshot.humidity,
	        dateAdded: snapshot.dateAdded
	      }
	    }).then(function (res) {
	      return dispatch(addSnapshot(res.snapshot));
	    });
	  };
	}

	function addSnapshots(snapshots) {
	  return {
	    type: ADD_SNAPSHOTS,
	    snapshots: snapshots
	  };
	}

	function fetchSnapshots(place) {
	  return function (dispatch) {
	    return (0, _apiCaller2.default)('snapshots/' + place.name).then(function (res) {
	      dispatch(addSnapshots(res.snapshots));
	    });
	  };
	}

	//export function fetchSnapshot (cuid) {
	//  return (dispatch) => {
	//    return callApi(`snapshots/${cuid}`).then(res => dispatch(addSnapshot(res.snapshot)));
	//  };
	//}

	function deleteSnapshot(cuid) {
	  return {
	    type: DELETE_SNAPSHOT,
	    cuid: cuid
	  };
	}

	function deleteSnapshotRequest(cuid) {
	  return function (dispatch) {
	    return (0, _apiCaller2.default)('snapshots/' + cuid, 'delete').then(function () {
	      return dispatch(deleteSnapshot(cuid));
	    });
	  };
	}

	function showPrevSnapshot() {
	  return {
	    type: SHOW_PREV_SNAPSHOT
	  };
	}

	function showNextSnapshot() {
	  return {
	    type: SHOW_NEXT_SNAPSHOT
	  };
	}

	function showSnapshotFromIndex(index) {
	  return {
	    type: SHOW_SNAPSHOT_FROM_INDEX,
	    index: index
	  };
	}

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.getSnapshot = exports.getSelectedSnapshot = exports.getSnapshots = undefined;

	var _SnapshotActions = __webpack_require__(9);

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

	// Initial State
	var initialState = { data: [], selected: false };

	var SnapshotReducer = function SnapshotReducer() {
	  var state = arguments.length <= 0 || arguments[0] === undefined ? initialState : arguments[0];
	  var action = arguments[1];

	  switch (action.type) {
	    case _SnapshotActions.ADD_SNAPSHOT:
	      return {
	        data: [action.snapshot].concat(_toConsumableArray(state.data)),
	        selected: action.snapshot
	      };

	    case _SnapshotActions.ADD_SNAPSHOTS:
	      return {
	        data: action.snapshots,
	        selected: !state.selected && action.snapshots ? action.snapshots[action.snapshots.length - 1] : state.selected
	      };

	    case _SnapshotActions.DELETE_SNAPSHOT:
	      var newListOfSnapshots = state.data.filter(function (snapshot) {
	        return snapshot.cuid !== action.cuid;
	      });
	      var selected = state.selected;

	      // We are deleting the selected one. Select the last one in the reduced list
	      if (state.selected && state.selected.cuid === action.cuid) {
	        if (newListOfSnapshots.length > 0) {
	          selected = newListOfSnapshots[newListOfSnapshots.length - 1];
	        } else {
	          selected = initialState.selected;
	        }
	      }

	      return {
	        data: newListOfSnapshots,
	        selected: selected
	      };

	    case _SnapshotActions.SHOW_PREV_SNAPSHOT:

	      if (!state.selected) {
	        return state;
	      }

	      var selectedIndex1 = state.data.findIndex(function (snapshot, index) {
	        return snapshot.cuid === state.selected.cuid;
	      });

	      if (selectedIndex1 === 0) {
	        return state;
	      }

	      return {
	        data: state.data,
	        selected: state.data[selectedIndex1 - 1]
	      };

	    case _SnapshotActions.SHOW_NEXT_SNAPSHOT:

	      if (!state.selected) {
	        return state;
	      }

	      var selectedIndex2 = state.data.findIndex(function (snapshot, index) {
	        return snapshot.cuid === state.selected.cuid;
	      });

	      if (selectedIndex2 >= state.data.length - 1) {
	        return state;
	      }

	      return {
	        data: state.data,
	        selected: state.data[selectedIndex2 + 1]
	      };

	    case _SnapshotActions.SHOW_SNAPSHOT_FROM_INDEX:

	      if (!state.selected) {
	        return state;
	      }

	      return {
	        data: state.data,
	        selected: state.data[action.index] || state.selected
	      };

	    default:
	      return state;
	  }
	};

	/* Selectors */

	// Get all snapshots
	var getSnapshots = exports.getSnapshots = function getSnapshots(state) {
	  return state.snapshots.data;
	};

	// Get selected snapshot
	var getSelectedSnapshot = exports.getSelectedSnapshot = function getSelectedSnapshot(state) {
	  return state.snapshots.selected;
	};

	// Get snapshot by cuid
	var getSnapshot = exports.getSnapshot = function getSnapshot(state, cuid) {
	  return state.snapshots.data.filter(function (snapshot) {
	    return snapshot.cuid === cuid;
	  })[0];
	};

	// Export Reducer
	exports.default = SnapshotReducer;

/***/ },
/* 11 */
/***/ function(module, exports) {

	module.exports = require("express");

/***/ },
/* 12 */
/***/ function(module, exports) {

	module.exports = require("mongoose");

/***/ },
/* 13 */
/***/ function(module, exports) {

	"use strict";
	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.toggleAddSnapshot = toggleAddSnapshot;
	exports.changeMainNavigation = changeMainNavigation;
	// Export Constants
	var TOGGLE_ADD_SNAPSHOT = exports.TOGGLE_ADD_SNAPSHOT = 'TOGGLE_ADD_SNAPSHOT';
	var CHANGE_MAIN_NAVIGATION = exports.CHANGE_MAIN_NAVIGATION = 'CHANGE_MAIN_NAVIGATION';

	var MAIN_NAVIGATION_ITEMS = exports.MAIN_NAVIGATION_ITEMS = ['image', 'graph'];

	// Ensure that you cannot modify the main navigation items
	Object.freeze(MAIN_NAVIGATION_ITEMS);

	// Export Actions
	function toggleAddSnapshot() {
	  return {
	    type: TOGGLE_ADD_SNAPSHOT
	  };
	}

	function changeMainNavigation(newNavigationName) {
	  return {
	    type: CHANGE_MAIN_NAVIGATION,
	    name: newNavigationName
	  };
	}

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.SWITCH_LANGUAGE = undefined;

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	exports.switchLanguage = switchLanguage;

	var _setup = __webpack_require__(17);

	// Export Constants
	var SWITCH_LANGUAGE = exports.SWITCH_LANGUAGE = 'SWITCH_LANGUAGE';

	function switchLanguage(newLang) {
	  return _extends({
	    type: SWITCH_LANGUAGE
	  }, _setup.localizationData[newLang]);
	}

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _mongoose = __webpack_require__(12);

	var _mongoose2 = _interopRequireDefault(_mongoose);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var Schema = _mongoose2.default.Schema;

	var placeSchema = new Schema({
	  cuid: { type: 'String', required: true },
	  name: { type: 'String', required: true },
	  isPublic: { type: 'Boolean', required: true, default: false }
	});

	exports.default = _mongoose2.default.model('SnapshotPlace', placeSchema);

/***/ },
/* 16 */
/***/ function(module, exports) {

	module.exports = require("webpack");

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.localizationData = exports.enabledLanguages = undefined;

	var _reactIntl = __webpack_require__(6);

	var _intl = __webpack_require__(73);

	var _intl2 = _interopRequireDefault(_intl);

	__webpack_require__(75);

	var _no = __webpack_require__(83);

	var _no2 = _interopRequireDefault(_no);

	var _no3 = __webpack_require__(51);

	var _no4 = _interopRequireDefault(_no3);

	__webpack_require__(74);

	var _en = __webpack_require__(82);

	var _en2 = _interopRequireDefault(_en);

	var _en3 = __webpack_require__(50);

	var _en4 = _interopRequireDefault(_en3);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	// list of available languages
	var enabledLanguages = exports.enabledLanguages = ['no', 'en'];

	// this object will have language-specific data added to it which will be placed in the state when that language is active
	// if localization data get to big, stop importing in all languages and switch to using API requests to load upon switching languages
	var localizationData = exports.localizationData = {};

	// here you bring in 'intl' browser polyfill and language-specific polyfills
	// (needed as safari doesn't have native intl: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl)
	// as well as react-intl's language-specific data
	// be sure to use static imports for language or else every language will be included in your build (adds ~800 kb)


	// need Intl polyfill, Intl not supported in Safari

	global.Intl = _intl2.default;

	// use this to allow nested messages, taken from docs:
	// https://github.com/yahoo/react-intl/wiki/Upgrade-Guide#flatten-messages-object
	function flattenMessages() {
	  var nestedMessages = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
	  var prefix = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];

	  return Object.keys(nestedMessages).reduce(function (messages, key) {
	    var value = nestedMessages[key];
	    var prefixedKey = prefix ? prefix + '.' + key : key;

	    if (typeof value === 'string') {
	      messages[prefixedKey] = value; // eslint-disable-line no-param-reassign
	    } else {
	      Object.assign(messages, flattenMessages(value, prefixedKey));
	    }

	    return messages;
	  }, {});
	}

	// bring in intl polyfill, react-intl, and app-specific language data

	(0, _reactIntl.addLocaleData)(_no2.default);
	localizationData.no = _no4.default;
	localizationData.no.messages = flattenMessages(localizationData.no.messages);

	(0, _reactIntl.addLocaleData)(_en2.default);
	localizationData.en = _en4.default;
	localizationData.en.messages = flattenMessages(localizationData.en.messages);

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.AdminPage = undefined;

	var _jsx = function () { var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7; return function createRawReactElement(type, props, key, children) { var defaultProps = type && type.defaultProps; var childrenLength = arguments.length - 3; if (!props && childrenLength !== 0) { props = {}; } if (props && defaultProps) { for (var propName in defaultProps) { if (props[propName] === void 0) { props[propName] = defaultProps[propName]; } } } else if (!props) { props = defaultProps || {}; } if (childrenLength === 1) { props.children = children; } else if (childrenLength > 1) { var childArray = Array(childrenLength); for (var i = 0; i < childrenLength; i++) { childArray[i] = arguments[i + 3]; } props.children = childArray; } return { $$typeof: REACT_ELEMENT_TYPE, type: type, key: key === undefined ? null : '' + key, ref: null, props: props, _owner: null }; }; }();

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(0);

	var _react2 = _interopRequireDefault(_react);

	var _reactRedux = __webpack_require__(1);

	var _reactRouter = __webpack_require__(3);

	var _reactHelmet = __webpack_require__(2);

	var _reactHelmet2 = _interopRequireDefault(_reactHelmet);

	var _Header = __webpack_require__(4);

	var _Header2 = _interopRequireDefault(_Header);

	var _AdminPage = {
	  "outer": "AdminPage__outer__1h2iE"
	};

	var _AdminPage2 = _interopRequireDefault(_AdminPage);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var _ref = _jsx('div', {}, void 0, _jsx(_reactHelmet2.default, {
	  title: 'Admin'
	}), _jsx('div', {}, void 0, _jsx(_Header2.default, {}, void 0, 'Admin'), 'Admin pages...', _jsx('div', {}, void 0, _jsx(_reactRouter.Link, {
	  to: '/admin/places'
	}, void 0, 'Places'))));

	var AdminPage = exports.AdminPage = function (_Component) {
	  _inherits(AdminPage, _Component);

	  function AdminPage() {
	    _classCallCheck(this, AdminPage);

	    return _possibleConstructorReturn(this, (AdminPage.__proto__ || Object.getPrototypeOf(AdminPage)).apply(this, arguments));
	  }

	  _createClass(AdminPage, [{
	    key: 'render',
	    value: function render() {
	      return _ref;
	    }
	  }]);

	  return AdminPage;
	}(_react.Component);

	AdminPage.PropTypes = {
	  dispatch: _react.PropTypes.func.isRequired,
	  intl: _react.PropTypes.object.isRequired
	};

	AdminPage.contextTypes = {
	  router: _react2.default.PropTypes.object
	};

	function mapStateToProps(state) {
	  return {
	    intl: state.intl
	  };
	}

	exports.default = (0, _reactRedux.connect)(mapStateToProps)(AdminPage);

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.PlacesListPage = undefined;

	var _jsx = function () { var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7; return function createRawReactElement(type, props, key, children) { var defaultProps = type && type.defaultProps; var childrenLength = arguments.length - 3; if (!props && childrenLength !== 0) { props = {}; } if (props && defaultProps) { for (var propName in defaultProps) { if (props[propName] === void 0) { props[propName] = defaultProps[propName]; } } } else if (!props) { props = defaultProps || {}; } if (childrenLength === 1) { props.children = children; } else if (childrenLength > 1) { var childArray = Array(childrenLength); for (var i = 0; i < childrenLength; i++) { childArray[i] = arguments[i + 3]; } props.children = childArray; } return { $$typeof: REACT_ELEMENT_TYPE, type: type, key: key === undefined ? null : '' + key, ref: null, props: props, _owner: null }; }; }();

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(0);

	var _react2 = _interopRequireDefault(_react);

	var _reactRedux = __webpack_require__(1);

	var _reactRouter = __webpack_require__(3);

	var _reactHelmet = __webpack_require__(2);

	var _reactHelmet2 = _interopRequireDefault(_reactHelmet);

	var _Header = __webpack_require__(4);

	var _Header2 = _interopRequireDefault(_Header);

	var _PlaceReducer = __webpack_require__(5);

	var _PlaceActions = __webpack_require__(8);

	var _PlacesListPage = {
	  "outer": "PlacesListPage__outer__1dbgg"
	};

	var _PlacesListPage2 = _interopRequireDefault(_PlacesListPage);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var need = [function (params) {
	  return (0, _PlaceActions.fetchPlaces)();
	}];

	var _ref = _jsx(_reactHelmet2.default, {
	  title: 'Places'
	});

	var _ref2 = _jsx(_Header2.default, {}, void 0, 'Places');

	var PlacesListPage = exports.PlacesListPage = function (_Component) {
	  _inherits(PlacesListPage, _Component);

	  function PlacesListPage() {
	    _classCallCheck(this, PlacesListPage);

	    return _possibleConstructorReturn(this, (PlacesListPage.__proto__ || Object.getPrototypeOf(PlacesListPage)).apply(this, arguments));
	  }

	  _createClass(PlacesListPage, [{
	    key: 'componentDidMount',
	    value: function componentDidMount() {
	      var _this2 = this;

	      // We need to get data if we navigate to here client side
	      if ((!this.props.places || this.props.places.length === 0) && this.props.params) {
	        console.log('need to get places...', this.props.places);
	        need.forEach(function (fn) {
	          return _this2.props.dispatch(fn(_this2.props.params));
	        });
	      }
	    }
	  }, {
	    key: 'render',
	    value: function render() {
	      return _jsx('div', {}, void 0, _ref, _jsx('div', {}, void 0, _ref2, this.props.places.map(function (place, index) {
	        return _jsx('div', {}, index, _jsx(_reactRouter.Link, {
	          to: '/' + place.name
	        }, void 0, place.name, ' - ', place.cuid));
	      })));
	    }
	  }]);

	  return PlacesListPage;
	}(_react.Component);

	PlacesListPage.PropTypes = {
	  places: _react.PropTypes.arrayOf(_react.PropTypes.shape({
	    cuid: _react.PropTypes.string,
	    name: _react.PropTypes.string
	  })).isRequired,
	  dispatch: _react.PropTypes.func.isRequired,
	  intl: _react.PropTypes.object.isRequired
	};

	PlacesListPage.contextTypes = {
	  router: _react2.default.PropTypes.object
	};

	PlacesListPage.need = need;

	function mapStateToProps(state) {
	  return {
	    intl: state.intl,
	    places: (0, _PlaceReducer.getPlaces)(state)
	  };
	}

	exports.default = (0, _reactRedux.connect)(mapStateToProps)(PlacesListPage);

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.getSelectedMainNavigation = exports.getShowAddSnapshot = undefined;

	var _AppActions = __webpack_require__(13);

	// Initial State
	var initialState = {
	  showAddSnapshot: false,
	  mainNavigation: _AppActions.MAIN_NAVIGATION_ITEMS[0]
	}; // Import Actions


	var AppReducer = function AppReducer() {
	  var state = arguments.length <= 0 || arguments[0] === undefined ? initialState : arguments[0];
	  var action = arguments[1];

	  switch (action.type) {

	    case _AppActions.TOGGLE_ADD_SNAPSHOT:
	      return {
	        showAddSnapshot: !state.showAddSnapshot,
	        mainNavigation: state.mainNavigation
	      };

	    case _AppActions.CHANGE_MAIN_NAVIGATION:
	      var mainNavigation = state.mainNavigation;

	      // Check for valid navigation names
	      if (_AppActions.MAIN_NAVIGATION_ITEMS.includes(action.name)) {
	        mainNavigation = action.name;
	      }

	      return {
	        showAddSnapshot: state.showAddSnapshot,
	        mainNavigation: mainNavigation
	      };

	    default:
	      return state;
	  }
	};

	/* Selectors */
	var getShowAddSnapshot = exports.getShowAddSnapshot = function getShowAddSnapshot(state) {
	  return state.app.showAddSnapshot;
	};

	// Get selected main navigation
	var getSelectedMainNavigation = exports.getSelectedMainNavigation = function getSelectedMainNavigation(state) {
	  return state.app.mainNavigation;
	};

	// Export Reducer
	exports.default = AppReducer;

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _jsx = function () { var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7; return function createRawReactElement(type, props, key, children) { var defaultProps = type && type.defaultProps; var childrenLength = arguments.length - 3; if (!props && childrenLength !== 0) { props = {}; } if (props && defaultProps) { for (var propName in defaultProps) { if (props[propName] === void 0) { props[propName] = defaultProps[propName]; } } } else if (!props) { props = defaultProps || {}; } if (childrenLength === 1) { props.children = children; } else if (childrenLength > 1) { var childArray = Array(childrenLength); for (var i = 0; i < childrenLength; i++) { childArray[i] = arguments[i + 3]; } props.children = childArray; } return { $$typeof: REACT_ELEMENT_TYPE, type: type, key: key === undefined ? null : '' + key, ref: null, props: props, _owner: null }; }; }();

	var _react = __webpack_require__(0);

	var _react2 = _interopRequireDefault(_react);

	var _reduxDevtools = __webpack_require__(84);

	var _reduxDevtoolsLogMonitor = __webpack_require__(86);

	var _reduxDevtoolsLogMonitor2 = _interopRequireDefault(_reduxDevtoolsLogMonitor);

	var _reduxDevtoolsDockMonitor = __webpack_require__(85);

	var _reduxDevtoolsDockMonitor2 = _interopRequireDefault(_reduxDevtoolsDockMonitor);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.default = (0, _reduxDevtools.createDevTools)(_jsx(_reduxDevtoolsDockMonitor2.default, {
	  toggleVisibilityKey: 'ctrl-h',
	  changePositionKey: 'ctrl-w'
	}, void 0, _jsx(_reduxDevtoolsLogMonitor2.default, {})));

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.PlacePage = undefined;

	var _jsx = function () { var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7; return function createRawReactElement(type, props, key, children) { var defaultProps = type && type.defaultProps; var childrenLength = arguments.length - 3; if (!props && childrenLength !== 0) { props = {}; } if (props && defaultProps) { for (var propName in defaultProps) { if (props[propName] === void 0) { props[propName] = defaultProps[propName]; } } } else if (!props) { props = defaultProps || {}; } if (childrenLength === 1) { props.children = children; } else if (childrenLength > 1) { var childArray = Array(childrenLength); for (var i = 0; i < childrenLength; i++) { childArray[i] = arguments[i + 3]; } props.children = childArray; } return { $$typeof: REACT_ELEMENT_TYPE, type: type, key: key === undefined ? null : '' + key, ref: null, props: props, _owner: null }; }; }();

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(0);

	var _react2 = _interopRequireDefault(_react);

	var _reactRedux = __webpack_require__(1);

	var _reactRouter = __webpack_require__(3);

	var _reactHelmet = __webpack_require__(2);

	var _reactHelmet2 = _interopRequireDefault(_reactHelmet);

	var _reactIntl = __webpack_require__(6);

	var _SnapshotsNavigator = __webpack_require__(67);

	var _SnapshotsNavigator2 = _interopRequireDefault(_SnapshotsNavigator);

	var _FullHeightWrapper = __webpack_require__(60);

	var _FullHeightWrapper2 = _interopRequireDefault(_FullHeightWrapper);

	var _Header = __webpack_require__(4);

	var _Header2 = _interopRequireDefault(_Header);

	var _AppActions = __webpack_require__(13);

	var _PlaceActions = __webpack_require__(8);

	var _PlaceReducer = __webpack_require__(5);

	var _SnapshotActions = __webpack_require__(9);

	var _SnapshotReducer = __webpack_require__(10);

	var _App = __webpack_require__(53);

	var _App2 = _interopRequireDefault(_App);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	// Define the data dependencies
	var need = [function (params) {
		return (0, _PlaceActions.fetchPlace)(params.placeName);
	}, function (params) {
		return (0, _SnapshotActions.fetchSnapshots)({ name: params.placeName });
	}];

	var _ref = _jsx(_FullHeightWrapper2.default, {}, void 0, _jsx(_reactHelmet2.default, {
		title: 'Loading...'
	}), _jsx(_Header2.default, {}, void 0, _jsx(_App2.default, {
		fill: '#555'
	}), _jsx('div', {}, void 0, 'Loading....')), _jsx('div', {}, void 0, 'Loading...'));

	var _ref2 = _jsx(_App2.default, {
		fill: '#555'
	});

	var _ref3 = _jsx(_reactHelmet2.default, {
		title: 'Not a valid place'
	});

	var _ref4 = _jsx(_Header2.default, {}, void 0, _jsx(_App2.default, {
		fill: '#555'
	}), _jsx('div', {}, void 0, 'Not a valid place'));

	var PlacePage = exports.PlacePage = function (_Component) {
		_inherits(PlacePage, _Component);

		function PlacePage() {
			_classCallCheck(this, PlacePage);

			return _possibleConstructorReturn(this, (PlacePage.__proto__ || Object.getPrototypeOf(PlacePage)).apply(this, arguments));
		}

		_createClass(PlacePage, [{
			key: 'componentDidMount',
			value: function componentDidMount() {
				var _this2 = this;

				// Client side stuff
				if (typeof document !== 'undefined') {

					// We need to get data if we navigate to here client side
					if ((!this.props.snapshots || this.props.snapshots.length === 0) && this.props.params) {
						need.forEach(function (fn) {
							return _this2.props.dispatch(fn(_this2.props.params));
						});
					}

					/*if (!this.props.selectedPlace) {
	    
	    	this.setState({
	    		loading: true,
	    		selectedPlaceNotFound: false
	    	});
	    		fetchPlace(this.props.params.placeName)(this.props.dispatch).then(res => {
	    		this.setState({
	    			loading: false
	    		});
	    			if (!res || !res.place || !res.place.cuid) {
	    			this.setState({
	    				selectedPlaceNotFound: true
	    			});
	    		}
	    	});
	    }*/
				}
			}
		}, {
			key: 'render',
			value: function render() {

				// Waiting for place...
				if (this.state && this.state.loading || !this.props.snapshots || this.props.snapshots.length === 0) {
					return _ref;
				}

				// We have a place, and it's got a name :)
				if (this.props.selectedPlace && this.props.selectedPlace.name) {
					var settingsLink = '/' + this.props.selectedPlace.name + '/settings';
					return _jsx(_FullHeightWrapper2.default, {}, void 0, _jsx(_reactHelmet2.default, {
						title: this.props.selectedPlace.name[0].toUpperCase() + this.props.selectedPlace.name.substr(1)
					}), _jsx(_Header2.default, {}, void 0, _ref2, _jsx('div', {}, void 0, this.props.selectedPlace.name)), _jsx(_SnapshotsNavigator2.default, {
						snapshots: this.props.snapshots,
						place: this.props.selectedPlace
					}));
				}

				// Apparently no valid place was found
				return _jsx(_FullHeightWrapper2.default, {}, void 0, _ref3, _ref4, _jsx('div', {}, void 0, 'The place ', this.props.params.placeName, ' not found'));
			}
		}]);

		return PlacePage;
	}(_react.Component);

	PlacePage.contextTypes = {
		router: _react2.default.PropTypes.object
	};

	// Server side data requirements
	PlacePage.need = need;

	function mapStateToProps(state) {
		return {
			selectedPlace: (0, _PlaceReducer.getSelectedPlace)(state),
			snapshots: (0, _SnapshotReducer.getSnapshots)(state)
		};
	}

	exports.default = (0, _reactRedux.connect)(mapStateToProps)(PlacePage);

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	'use strict';

	Object.defineProperty(exports, "__esModule", {
			value: true
	});
	exports.SelectPlacePage = undefined;

	var _jsx = function () { var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7; return function createRawReactElement(type, props, key, children) { var defaultProps = type && type.defaultProps; var childrenLength = arguments.length - 3; if (!props && childrenLength !== 0) { props = {}; } if (props && defaultProps) { for (var propName in defaultProps) { if (props[propName] === void 0) { props[propName] = defaultProps[propName]; } } } else if (!props) { props = defaultProps || {}; } if (childrenLength === 1) { props.children = children; } else if (childrenLength > 1) { var childArray = Array(childrenLength); for (var i = 0; i < childrenLength; i++) { childArray[i] = arguments[i + 3]; } props.children = childArray; } return { $$typeof: REACT_ELEMENT_TYPE, type: type, key: key === undefined ? null : '' + key, ref: null, props: props, _owner: null }; }; }();

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(0);

	var _react2 = _interopRequireDefault(_react);

	var _reactRedux = __webpack_require__(1);

	var _reactHelmet = __webpack_require__(2);

	var _reactHelmet2 = _interopRequireDefault(_reactHelmet);

	var _reactIntl = __webpack_require__(6);

	var _PlaceActions = __webpack_require__(8);

	var _PlaceReducer = __webpack_require__(5);

	var _Header = __webpack_require__(4);

	var _Header2 = _interopRequireDefault(_Header);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	// Import Style
	//import styles from '../../components/SnapshotListItem/SnapshotListItem.css';
	var _ref = _jsx('div', {}, void 0, _jsx(_reactHelmet2.default, {
			title: 'Velg værhøne'
	}), _jsx(_Header2.default, {}), _jsx('div', {}, void 0, 'Skriv inn navn på værhøne:'));

	var SelectPlacePage = exports.SelectPlacePage = function (_Component) {
			_inherits(SelectPlacePage, _Component);

			function SelectPlacePage() {
					_classCallCheck(this, SelectPlacePage);

					return _possibleConstructorReturn(this, (SelectPlacePage.__proto__ || Object.getPrototypeOf(SelectPlacePage)).apply(this, arguments));
			}

			_createClass(SelectPlacePage, [{
					key: 'componentWillMount',
					value: function componentWillMount() {
							if (this.props.selectedPlace) {
									this.props.dispatch((0, _PlaceActions.unselectPlace)());
							}
					}
			}, {
					key: 'render',
					value: function render() {
							return _ref;
					}
			}]);

			return SelectPlacePage;
	}(_react.Component);

	// Actions required to provide data for this component to render in sever side.
	//SnapshotDetailPage.need = [params => {
	//  return fetchSnapshot(params.cuid);
	//}];

	// Retrieve data from store as props


	function mapStateToProps(state, props) {
			return {
					selectedPlace: (0, _PlaceReducer.getSelectedPlace)(state)
			};
	}

	exports.default = (0, _reactRedux.connect)(mapStateToProps)(SelectPlacePage);

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	'use strict';

	Object.defineProperty(exports, "__esModule", {
			value: true
	});
	exports.SettingsPage = undefined;

	var _jsx = function () { var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7; return function createRawReactElement(type, props, key, children) { var defaultProps = type && type.defaultProps; var childrenLength = arguments.length - 3; if (!props && childrenLength !== 0) { props = {}; } if (props && defaultProps) { for (var propName in defaultProps) { if (props[propName] === void 0) { props[propName] = defaultProps[propName]; } } } else if (!props) { props = defaultProps || {}; } if (childrenLength === 1) { props.children = children; } else if (childrenLength > 1) { var childArray = Array(childrenLength); for (var i = 0; i < childrenLength; i++) { childArray[i] = arguments[i + 3]; } props.children = childArray; } return { $$typeof: REACT_ELEMENT_TYPE, type: type, key: key === undefined ? null : '' + key, ref: null, props: props, _owner: null }; }; }();

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(0);

	var _react2 = _interopRequireDefault(_react);

	var _reactRedux = __webpack_require__(1);

	var _reactIntl = __webpack_require__(6);

	var _reactRouter = __webpack_require__(3);

	var _reactHelmet = __webpack_require__(2);

	var _reactHelmet2 = _interopRequireDefault(_reactHelmet);

	var _IntlActions = __webpack_require__(14);

	var _SettingsPage = {
			"flag-list": "SettingsPage__flag-list__3mmhh",
			"flag-list__item": "SettingsPage__flag-list__item__1McKt"
	};

	var _SettingsPage2 = _interopRequireDefault(_SettingsPage);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var _ref = _jsx(_reactHelmet2.default, {
			title: 'Innstillinger'
	});

	var _ref2 = _jsx(_reactIntl.FormattedMessage, {
			id: 'back'
	});

	var _ref3 = _jsx('h1', {}, void 0, _jsx(_reactIntl.FormattedMessage, {
			id: 'settings'
	}));

	var _ref4 = _jsx(_reactIntl.FormattedMessage, {
			id: 'switchLanguage'
	});

	var SettingsPage = exports.SettingsPage = function (_Component) {
			_inherits(SettingsPage, _Component);

			function SettingsPage() {
					_classCallCheck(this, SettingsPage);

					return _possibleConstructorReturn(this, (SettingsPage.__proto__ || Object.getPrototypeOf(SettingsPage)).apply(this, arguments));
			}

			_createClass(SettingsPage, [{
					key: 'switchLanguage',
					value: function switchLanguage(lang) {
							this.props.dispatch((0, _IntlActions.switchLanguage)(lang));
					}
			}, {
					key: 'render',
					value: function render() {
							var _this2 = this;

							var languageNodes = this.props.intl.enabledLanguages.map(function (lang) {
									return _jsx('li', {
											onClick: function onClick() {
													return _this2.switchLanguage(lang);
											},
											className: _SettingsPage2.default['flag-list__item']
									}, lang, lang);
							});

							var backLink = '/' + this.props.params.placeName;

							return _jsx('div', {}, void 0, _ref, _jsx('div', {}, void 0, _jsx(_reactRouter.Link, {
									to: backLink
							}, void 0, _ref2), _ref3, _ref4, _jsx('ul', {
									className: _SettingsPage2.default['flag-list']
							}, void 0, languageNodes)));
					}
			}]);

			return SettingsPage;
	}(_react.Component);

	SettingsPage.PropTypes = {
			dispatch: _react.PropTypes.func.isRequired,
			intl: _react.PropTypes.object.isRequired
	};

	SettingsPage.contextTypes = {
			router: _react2.default.PropTypes.object
	};

	function mapStateToProps(state) {
			return {
					intl: state.intl
			};
	}

	exports.default = (0, _reactRedux.connect)(mapStateToProps)(SettingsPage);

/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _jsx = function () { var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7; return function createRawReactElement(type, props, key, children) { var defaultProps = type && type.defaultProps; var childrenLength = arguments.length - 3; if (!props && childrenLength !== 0) { props = {}; } if (props && defaultProps) { for (var propName in defaultProps) { if (props[propName] === void 0) { props[propName] = defaultProps[propName]; } } } else if (!props) { props = defaultProps || {}; } if (childrenLength === 1) { props.children = children; } else if (childrenLength > 1) { var childArray = Array(childrenLength); for (var i = 0; i < childrenLength; i++) { childArray[i] = arguments[i + 3]; } props.children = childArray; } return { $$typeof: REACT_ELEMENT_TYPE, type: type, key: key === undefined ? null : '' + key, ref: null, props: props, _owner: null }; }; }();

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(0);

	var _react2 = _interopRequireDefault(_react);

	var _Icon = {
	  "container": "Icon__container__2LcEb",
	  "container--selected": "Icon__container--selected__2pkPZ",
	  "label": "Icon__label__HIzRX"
	};

	var _Icon2 = _interopRequireDefault(_Icon);

	var _Picture = __webpack_require__(56);

	var _Picture2 = _interopRequireDefault(_Picture);

	var _Statistics = __webpack_require__(57);

	var _Statistics2 = _interopRequireDefault(_Statistics);

	var _Thermometer = __webpack_require__(58);

	var _Thermometer2 = _interopRequireDefault(_Thermometer);

	var _Droplets = __webpack_require__(55);

	var _Droplets2 = _interopRequireDefault(_Droplets);

	var _Compass = __webpack_require__(54);

	var _Compass2 = _interopRequireDefault(_Compass);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	// Get the SVG icons


	var Icon = function (_Component) {
	  _inherits(Icon, _Component);

	  function Icon() {
	    _classCallCheck(this, Icon);

	    return _possibleConstructorReturn(this, (Icon.__proto__ || Object.getPrototypeOf(Icon)).apply(this, arguments));
	  }

	  _createClass(Icon, [{
	    key: 'render',
	    value: function render() {

	      var icon = void 0;
	      var fillColor = this.props.selected ? '#00628B' : '#000000';

	      switch (this.props.type) {
	        case 'image':
	          icon = _jsx(_Picture2.default, {
	            fill: fillColor
	          });
	          break;

	        case 'graph':
	          icon = _jsx(_Statistics2.default, {
	            fill: fillColor
	          });
	          break;

	        case 'thermometer':
	          icon = _jsx(_Thermometer2.default, {
	            fill: fillColor
	          });
	          break;

	        case 'droplets':
	          icon = _jsx(_Droplets2.default, {
	            fill: fillColor
	          });
	          break;

	        case 'compass':
	          icon = _jsx(_Compass2.default, {
	            fill: fillColor
	          });
	          break;

	        default:
	          icon = '?';
	      }

	      return _jsx('div', {
	        className: _Icon2.default['container'] + ' ' + (this.props.selected ? _Icon2.default['container--selected'] : ''),
	        onClick: this.props.onClick,
	        'aria-title': this.props.type
	      }, void 0, icon, this.props.label ? _jsx('div', {
	        className: _Icon2.default['label'],
	        style: { color: fillColor }
	      }, void 0, this.props.label) : null);
	    }
	  }]);

	  return Icon;
	}(_react.Component);

	exports.default = Icon;

/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.API_URL = undefined;
	exports.default = callApi;

	var _isomorphicFetch = __webpack_require__(77);

	var _isomorphicFetch2 = _interopRequireDefault(_isomorphicFetch);

	var _config = __webpack_require__(7);

	var _config2 = _interopRequireDefault(_config);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var API_URL = exports.API_URL = typeof window === 'undefined' || process.env.NODE_ENV === 'test' ? process.env.BASE_URL || 'http://localhost:' + (process.env.PORT || _config2.default.port) + '/api' : '/api';

	function callApi(endpoint) {
	  var method = arguments.length <= 1 || arguments[1] === undefined ? 'get' : arguments[1];
	  var body = arguments[2];

	  return (0, _isomorphicFetch2.default)(API_URL + '/' + endpoint, {
	    headers: { 'content-type': 'application/json' },
	    method: method,
	    body: JSON.stringify(body)
	  }).then(function (response) {
	    return response.json().then(function (json) {
	      return { json: json, response: response };
	    });
	  }).then(function (_ref) {
	    var json = _ref.json;
	    var response = _ref.response;

	    if (!response.ok) {
	      return Promise.reject(json);
	    }

	    return json;
	  }).then(function (response) {
	    return response;
	  }, function (error) {
	    return error;
	  });
	}

/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.addPlace = addPlace;
	exports.addPlaceRaw = addPlaceRaw;
	exports.getPlaces = getPlaces;
	exports.getPlace = getPlace;
	exports.deletePlace = deletePlace;

	var _place = __webpack_require__(15);

	var _place2 = _interopRequireDefault(_place);

	var _cuid = __webpack_require__(32);

	var _cuid2 = _interopRequireDefault(_cuid);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/**
	 * Save a place
	 * @param req
	 * @param res
	 * @returns void
	 */
	function addPlace(req, res) {

	  if (!req.body.place.name) {
	    res.status(403).end();
	  }

	  addPlaceRaw(req.body.place).then(function (saved) {
	    return res.json({ place: saved });
	  }).catch(function (err) {
	    return res.status(500).send(err);
	  });
	}

	/**
	 * Save a place
	 * @param place
	 * @returns Promise
	 */
	function addPlaceRaw(place) {
	  return new Promise(function (resolve, reject) {

	    if (!place || !place.name) {
	      return reject('Missing place name');
	    }

	    var newPlace = new _place2.default(place);

	    if (!newPlace.cuid) {
	      newPlace.cuid = (0, _cuid2.default)();
	    }

	    newPlace.save(function (err, savedPlace) {
	      if (err) {
	        return reject(err);
	      }
	      resolve(savedPlace);
	    });
	  });
	}

	/**
	 * Gets all places
	 * @param req
	 * @param res
	 * @returns void
	 */
	function getPlaces(req, res) {

	  _place2.default.find().exec(function (err, places) {
	    if (err) {
	      res.status(500).send(err);
	    }
	    res.json({ places: places });
	  });
	}

	/**
	 * Get a single place
	 * @param req
	 * @param res
	 * @returns void
	 */
	function getPlace(req, res) {

	  if (!req.params.name) {
	    res.status(403).end();
	  }

	  _place2.default.findOne({ name: req.params.name }).exec(function (err, place) {
	    if (err) {
	      res.status(500).send(err);
	    }
	    res.json({ place: place });
	  });
	}

	/**
	 * Delete a place
	 * @param req
	 * @param res
	 * @returns void
	 */
	function deletePlace(req, res) {

	  if (!req.params.name) {
	    res.status(403).end();
	  }

	  _place2.default.findOne({ name: req.params.name }).exec(function (err, place) {
	    if (err) {
	      res.status(500).send(err);
	    }

	    place.remove(function () {
	      res.status(200).end();
	    });
	  });
	}

/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.getSnapshots = getSnapshots;
	exports.addSnapshot = addSnapshot;
	exports.addSnapshotLegacy = addSnapshotLegacy;
	exports.addSnapshotRaw = addSnapshotRaw;
	exports.deleteSnapshot = deleteSnapshot;

	var _snapshot = __webpack_require__(29);

	var _snapshot2 = _interopRequireDefault(_snapshot);

	var _place = __webpack_require__(15);

	var _place2 = _interopRequireDefault(_place);

	var _cuid = __webpack_require__(32);

	var _cuid2 = _interopRequireDefault(_cuid);

	var _fs = __webpack_require__(33);

	var _fs2 = _interopRequireDefault(_fs);

	var _s = __webpack_require__(69);

	var _place3 = __webpack_require__(27);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/**
	 * Get all snapshots
	 * @param req
	 * @param res
	 * @returns void
	 */
	function getSnapshots(req, res) {

	  // Get place by name
	  _place2.default.findOne({ name: req.params.placeName }).exec(function (err, place) {
	    if (err) {
	      return res.status(500).send(err);
	    }

	    if (!place) {
	      return res.status(500).send('Error: place not found');
	    }

	    _snapshot2.default.find({ placeCuid: place.cuid }).sort('dateAdded').exec(function (err, snapshots) {
	      if (err) {
	        return res.status(500).send(err);
	      }

	      var returnSnapshots = snapshots.map(function (item) {
	        item.temperature = Math.round(item.temperature * 10) / 10;
	        return item;
	      });

	      res.json({
	        snapshots: returnSnapshots
	      });
	    });
	  });
	}

	/**
	 * Save a snapshot
	 * @param req
	 * @param res
	 * @returns Promise
	 */
	function addSnapshot(req, res) {
	  return addSnapshotRaw(req.body.snapshot).then(function (snapshot) {

	    // This property indicates the WS app version
	    // req.body.appVersion

	    // This property tells you the key names for the wifi network added by the WS
	    // req.body.wifiNetworks

	    res.json({
	      snapshot: snapshot,
	      success: true, // old API props
	      message: '' // old API props
	    });

	    // The signature for sending back the new app version to the weather station
	    //appUpdate: {
	    //  path: 'http://path-to-new-app.tar.gz',
	    //  version: '99'
	    //}

	    // The signature for adding a new WIFI access point
	    /*wifiUpdate = {
	      // Internal name for the network
	      Id: "some-unique-id",
	      ssid: "the-ssid",
	      psk: "the-password-psk",
	      protocol: "WPA",
	      keyManagement: "WPA-PSK",
	      pairwise: "TKIP",
	      authorization: "OPEN",
	       // If the SSID is hidden or not
	      scan_ssid: false,
	       // Remove the old stored wifi networks?
	      removeOld: false
	    };*/
	  }).catch(function (err) {
	    res.status(err.code).send(err.message);
	  });
	}

	/**
	 * Save a snapshot (legacy entry)
	 * @param req
	 * @param res
	 * @returns Promise
	 */
	function addSnapshotLegacy(req, res) {

	  var OLD_PLACES = [{ placeId: -1, name: 'test' }, { placeId: 1, name: 'veggli' }, { placeId: 2, name: 'buvassbrenna' }, { placeId: 3, name: 'tornes' }];
	  Object.freeze(OLD_PLACES);

	  var oldPlace = OLD_PLACES.find(function (place) {
	    return place.placeId == req.body.placeId;
	  });

	  if (!oldPlace) {
	    return res.status(500).send('Error: place not found');
	  }

	  _place2.default.findOne({ name: oldPlace.name }).exec(function (err, place) {
	    if (err) {
	      return res.status(500).send(err);
	    }

	    if (place) {
	      save({ place: place });
	    }

	    // The place was not found. Lets add it!
	    else {
	        (0, _place3.addPlaceRaw)({ name: oldPlace.name, isPublic: true }).then(function (place) {
	          return save({ place: place });
	        }).catch(function (err) {
	          return res.status(500).send(err);
	        });
	      }
	  });

	  function save(_ref) {
	    var place = _ref.place;

	    var snapshot = {
	      placeCuid: place.cuid,
	      temperature: req.body.outsideTemperature,
	      pressure: req.body.outsidePressure,
	      humidity: req.body.outsideHumidity,
	      image: req.body.image
	    };

	    addSnapshotRaw(snapshot).then(function () {
	      console.log('legacy snapshot saved!');
	      res.json({
	        success: true,
	        message: ''
	      });
	    }).catch(function (_ref2) {
	      var status = _ref2.status;
	      var message = _ref2.message;

	      console.log('legacy snapshot error!', status, message);
	      res.json({
	        success: false,
	        message: message,
	        status: status
	      });
	    });
	  }
	  console.log('receiving legacy snapshot...');

	  var placeCuid = void 0;
	  switch (req.body.placeId) {
	    case -1:
	      placeCuid = 'cikqgkv4q01ck7453ualdn3ha';break; // test
	    case 1:
	      placeCuid = 'veggli';break;
	    case 2:
	      placeCuid = 'buvassbrenna';break;
	    case 3:
	      placeCuid = 'tornes';break;
	    default:
	      placeCuid = false;
	  }

	  if (!placeCuid) {
	    return res.json({
	      success: false,
	      message: 'placeCuid not matched (placeId: ' + req.body.placeId + ')'
	    });
	  }
	}

	/**
	 * Save a snapshot without request or response
	 * @param snapshot
	 * @returns Promise
	 */
	function addSnapshotRaw() {
	  var snapshot = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

	  return new Promise(function (resolve, reject) {

	    if (!snapshot.placeCuid) {
	      return reject({
	        code: 403,
	        message: 'Missing placeCuid'
	      });
	    }

	    // Get place name
	    _place2.default.findOne({ cuid: snapshot.placeCuid }).exec(function (err, place) {
	      if (err) {
	        return reject({
	          code: 500,
	          message: 'Could not find place name from placeCuid'
	        });
	      }

	      var newSnapshot = new _snapshot2.default(snapshot);

	      newSnapshot.cuid = (0, _cuid2.default)();
	      newSnapshot.save(function (err, saved) {
	        if (err) {
	          return reject({
	            code: 500,
	            message: 'Error while saving snapshot'
	          });
	        }

	        newSnapshot.image = snapshot.image;

	        // Store image to AWS S3
	        (0, _s.saveImageFromSnapshot)({
	          place: place,
	          snapshot: newSnapshot
	        }).then(function () {
	          resolve({ snapshot: saved });
	        }).catch(function (error) {
	          reject({
	            code: 500,
	            message: 'Error while storing image to AWS S3 bucket',
	            error: error
	          });
	        });
	      });
	    });
	  });
	}

	/**
	 * Get a single snapshot
	 * @param req
	 * @param res
	 * @returns void
	 */
	//export function getSnapshot (req, res) {
	//  Snapshot.findOne({ cuid: req.params.cuid }).exec((err, snapshot) => {
	//    if (err) {
	//      res.status(500).send(err);
	//    }
	//    res.json({ snapshot });
	//  });
	//}

	/**
	 * Delete a snapshot
	 * @param req
	 * @param res
	 * @returns void
	 */
	function deleteSnapshot(req, res) {
	  _snapshot2.default.findOne({ cuid: req.params.cuid }).exec(function (err, snapshot) {
	    if (err) {
	      res.status(500).send(err);
	    }

	    snapshot.remove(function () {
	      res.status(200).end();
	    });
	  });
	}

/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _mongoose = __webpack_require__(12);

	var _mongoose2 = _interopRequireDefault(_mongoose);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var Schema = _mongoose2.default.Schema;

	var snapshotSchema = new Schema({
	  cuid: { type: 'String', required: true },
	  placeCuid: { type: 'String', required: true },
	  temperature: { type: 'Number', required: true },
	  humidity: { type: 'Number', required: true },
	  pressure: { type: 'Number', required: true },
	  dateAdded: { type: 'Date', default: Date.now, required: true }
	});

	exports.default = _mongoose2.default.model('Snapshot', snapshotSchema);

/***/ },
/* 30 */
/***/ function(module, exports) {

	"use strict";
	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.getRelativePathForImage = getRelativePathForImage;
	/**
	 * Returns the relative path for an image for a snapshot (ex: /test/1/1/cuid.jpg)
	 * @param place
	 * @param snapshot
	 * @returns string
	*/
	function getRelativePathForImage(_ref) {
	  var place = _ref.place;
	  var snapshot = _ref.snapshot;

	  var date = new Date(snapshot.dateAdded);
	  return place.name + "/" + date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + snapshot.cuid + ".jpg";
	}

/***/ },
/* 31 */
/***/ function(module, exports) {

	"use strict";
	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.prettyDate = prettyDate;
	exports.prettyDateTime = prettyDateTime;
	exports.prettyTime = prettyTime;
	function prettyDate(date) {
	  date = ensureDateObject(date);

	  var format = new Intl.DateTimeFormat('no', {
	    weekday: 'long',
	    year: 'numeric',
	    month: 'narrow'
	  });

	  return format.format(date);
	}

	function prettyDateTime(date) {
	  date = ensureDateObject(date);

	  var format = new Intl.DateTimeFormat('no', {
	    weekday: 'long',
	    year: 'numeric',
	    month: 'narrow',
	    day: 'numeric',
	    hour: '2-digit',
	    minute: '2-digit'
	  });

	  return format.format(date);
	}

	function prettyTime(date) {
	  date = ensureDateObject(date);

	  var format = new Intl.DateTimeFormat('no', {
	    hour: '2-digit',
	    minute: '2-digit'
	  });

	  return format.format(date);
	}

	function ensureDateObject(mixed) {
	  if (typeof mixed === 'string' || typeof mixed === 'number') {
	    return new Date(mixed);
	  }

	  if (mixed instanceof Date) {
	    return mixed;
	  }

	  throw new Error('Can not convert to date object', mixed);
	}

/***/ },
/* 32 */
/***/ function(module, exports) {

	module.exports = require("cuid");

/***/ },
/* 33 */
/***/ function(module, exports) {

	module.exports = require("fs");

/***/ },
/* 34 */
/***/ function(module, exports) {

	module.exports = require("hammerjs");

/***/ },
/* 35 */
/***/ function(module, exports) {

	module.exports = require("redux");

/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.IntlWrapper = IntlWrapper;

	var _react = __webpack_require__(0);

	var _react2 = _interopRequireDefault(_react);

	var _reactIntl = __webpack_require__(6);

	var _reactRedux = __webpack_require__(1);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function IntlWrapper(props) {
	  return _react2.default.createElement(
	    _reactIntl.IntlProvider,
	    props.intl,
	    props.children
	  );
	}

	// Retrieve data from store as props
	function mapStateToProps(store) {
	  return {
	    intl: store.intl
	  };
	}

	exports.default = (0, _reactRedux.connect)(mapStateToProps)(IntlWrapper);

/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _jsx = function () { var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7; return function createRawReactElement(type, props, key, children) { var defaultProps = type && type.defaultProps; var childrenLength = arguments.length - 3; if (!props && childrenLength !== 0) { props = {}; } if (props && defaultProps) { for (var propName in defaultProps) { if (props[propName] === void 0) { props[propName] = defaultProps[propName]; } } } else if (!props) { props = defaultProps || {}; } if (childrenLength === 1) { props.children = children; } else if (childrenLength > 1) { var childArray = Array(childrenLength); for (var i = 0; i < childrenLength; i++) { childArray[i] = arguments[i + 3]; } props.children = childArray; } return { $$typeof: REACT_ELEMENT_TYPE, type: type, key: key === undefined ? null : '' + key, ref: null, props: props, _owner: null }; }; }(); /* eslint-disable global-require */


	var _react = __webpack_require__(0);

	var _react2 = _interopRequireDefault(_react);

	var _reactRouter = __webpack_require__(3);

	var _App = __webpack_require__(59);

	var _App2 = _interopRequireDefault(_App);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	// require.ensure polyfill for node
	if (false) {
	  require.ensure = function requireModule(deps, callback) {
	    callback(require);
	  };
	}

	/* Workaround for async react routes to work with react-hot-reloader till
	  https://github.com/reactjs/react-router/issues/2182 and
	  https://github.com/gaearon/react-hot-loader/issues/288 is fixed.
	 */
	if (process.env.NODE_ENV !== 'production') {
	  // Require async routes only in development for react-hot-reloader to work.
	  __webpack_require__(22);
	  __webpack_require__(23);
	  __webpack_require__(24);
	  __webpack_require__(18);
	  __webpack_require__(19);
	}

	// react-router setup with code-splitting
	// More info: http://blog.mxstbr.com/2016/01/react-apps-with-pages/
	exports.default = _jsx(_reactRouter.Route, {
	  path: '/',
	  component: _App2.default
	}, void 0, _jsx(_reactRouter.IndexRoute, {
	  getComponent: function getComponent(nextState, cb) {
	    Promise.resolve().catch(function(err) { __webpack_require__.oe(err); }).then((function (require) {
	      cb(null, __webpack_require__(23).default);
	    }).bind(null, __webpack_require__));
	  }
	}), _jsx(_reactRouter.Route, {
	  path: '/admin',
	  getComponent: function getComponent(nextState, cb) {
	    Promise.resolve().catch(function(err) { __webpack_require__.oe(err); }).then((function (require) {
	      cb(null, __webpack_require__(18).default);
	    }).bind(null, __webpack_require__));
	  }
	}), _jsx(_reactRouter.Route, {
	  path: '/admin/places',
	  getComponent: function getComponent(nextState, cb) {
	    Promise.resolve().catch(function(err) { __webpack_require__.oe(err); }).then((function (require) {
	      cb(null, __webpack_require__(19).default);
	    }).bind(null, __webpack_require__));
	  }
	}), _jsx(_reactRouter.Route, {
	  path: '/:placeName',
	  getComponent: function getComponent(nextState, cb) {
	    Promise.resolve().catch(function(err) { __webpack_require__.oe(err); }).then((function (require) {
	      cb(null, __webpack_require__(22).default);
	    }).bind(null, __webpack_require__));
	  }
	}), _jsx(_reactRouter.Route, {
	  path: '/:placeName/settings',
	  getComponent: function getComponent(nextState, cb) {
	    Promise.resolve().catch(function(err) { __webpack_require__.oe(err); }).then((function (require) {
	      cb(null, __webpack_require__(24).default);
	    }).bind(null, __webpack_require__));
	  }
	}));

/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.configureStore = configureStore;

	var _redux = __webpack_require__(35);

	var _reduxThunk = __webpack_require__(87);

	var _reduxThunk2 = _interopRequireDefault(_reduxThunk);

	var _DevTools = __webpack_require__(21);

	var _DevTools2 = _interopRequireDefault(_DevTools);

	var _reducers = __webpack_require__(68);

	var _reducers2 = _interopRequireDefault(_reducers);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/**
	 * Main store function
	 */
	function configureStore() {
	  var initialState = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

	  // Middleware and store enhancers
	  var enhancers = [(0, _redux.applyMiddleware)(_reduxThunk2.default)];

	  if (process.env.CLIENT && process.env.NODE_ENV === 'development') {
	    // Enable DevTools only when rendering on client and during development.
	    enhancers.push(window.devToolsExtension ? window.devToolsExtension() : _DevTools2.default.instrument());
	  }

	  var store = (0, _redux.createStore)(_reducers2.default, initialState, _redux.compose.apply(undefined, enhancers));

	  // For hot reloading reducers
	  if (false) {
	    // Enable Webpack hot module replacement for reducers
	    module.hot.accept('./reducers', function () {
	      var nextReducer = require('./reducers').default; // eslint-disable-line global-require
	      store.replaceReducer(nextReducer);
	    });
	  }

	  return store;
	}

/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	exports.default = function () {

	  var placeCuid = 'cikqgkv4q01ck7453ualdn3ha';

	  _place2.default.count().exec(function (err, count) {
	    if (count === 0) {
	      (function () {
	        var place = new _place2.default({ cuid: placeCuid, name: 'test' });

	        _place2.default.create([place], function (error) {
	          if (!error) {
	            console.log('Successfully added 1 dummy place: ' + place.name);

	            checkSnapshots();
	          } else {
	            console.log('Failed to add 1 dummy place:', error);
	          }
	        });
	      })();
	    } else {
	      checkSnapshots();
	    }
	  });

	  function checkSnapshots() {
	    _snapshot2.default.count().exec(function (err, count) {

	      if (count > 0) {
	        return;
	      }

	      var snapshotsToAdd = 5;

	      _fs2.default.readFile('./server/dummy-images/snapshot.jpg.base64', 'utf8', function (err, image) {

	        if (err) {
	          return console.log(err);
	        }

	        if (!image) {
	          return console.log('Error: dummy image contents not found');
	        }

	        console.log('Adding ' + snapshotsToAdd + ' dummy snapshots...');

	        var snapshots = [];

	        // Set standard start values
	        var temperature = Math.round(getRandomArbitrary(0, 30) * 10) / 10;
	        var humidity = Math.round(getRandomArbitrary(50, 100) * 10) / 10;
	        var pressure = Math.round(getRandomArbitrary(850, 1100));

	        var date = new Date();
	        date.setHours(date.getHours() - snapshotsToAdd);

	        for (var i = 0; i < snapshotsToAdd; i++) {
	          temperature += Math.round(Math.random() * 10) / 10 * (Math.random() > .5 ? -1 : 1);
	          humidity += Math.round(getRandomArbitrary(0, 2)) * (Math.random() > .5 ? -1 : 1);
	          pressure += Math.round(getRandomArbitrary(0, 2)) * (Math.random() > .5 ? -1 : 1);

	          date.setHours(date.getHours() + 1);

	          snapshots.push((0, _snapshot3.addSnapshotRaw)({
	            placeCuid: placeCuid,
	            image: image,
	            temperature: temperature,
	            humidity: humidity,
	            pressure: pressure,
	            dateAdded: date.getTime()
	          }));
	        }

	        Promise.all(snapshots).then(function (addedSnapshots) {
	          console.log('Successfully added ' + addedSnapshots.length + ' dummy snapshots');
	        }, function (error) {
	          console.log('Failed to add ' + snapshotsToAdd + ' dummy snapshots:', error);
	        });
	      });
	    });
	  }

	  // Returns a random number between min (inclusive) and max (exclusive)
	  function getRandomArbitrary(min, max) {
	    return Math.random() * (max - min) + min;
	  }
	};

	var _snapshot = __webpack_require__(29);

	var _snapshot2 = _interopRequireDefault(_snapshot);

	var _place = __webpack_require__(15);

	var _place2 = _interopRequireDefault(_place);

	var _snapshot3 = __webpack_require__(28);

	var _fs = __webpack_require__(33);

	var _fs2 = _interopRequireDefault(_fs);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _express = __webpack_require__(11);

	var _place = __webpack_require__(27);

	var PlaceController = _interopRequireWildcard(_place);

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

	var router = new _express.Router();

	// Add a new place
	router.route('/places').post(PlaceController.addPlace);

	// Get all places
	router.route('/places').get(PlaceController.getPlaces);

	// Get one place by name
	router.route('/places/:name').get(PlaceController.getPlace);

	// Delete a place by name
	router.route('/places/:name').delete(PlaceController.deletePlace);

	exports.default = router;

/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _express = __webpack_require__(11);

	var _snapshot = __webpack_require__(28);

	var SnapshotController = _interopRequireWildcard(_snapshot);

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

	var router = new _express.Router();

	// Get all snapshots
	router.route('/snapshots/:placeName').get(SnapshotController.getSnapshots);

	// Get one snapshot by cuid
	//router.route('/snapshots/:cuid').get(SnapshotController.getSnapshot);

	// Add a new snapshot
	router.route('/snapshots').post(SnapshotController.addSnapshot);

	// Add a new snapshot (legacy)
	router.route('/snapshots/legacy').post(SnapshotController.addSnapshotLegacy);

	// Delete a snapshot by cuid
	router.route('/snapshots/:cuid').delete(SnapshotController.deleteSnapshot);

	exports.default = router;

/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.fetchComponentData = fetchComponentData;

	var _promiseUtils = __webpack_require__(71);

	function fetchComponentData(store, components, params) {
	  var needs = components.reduce(function (prev, current) {
	    return (current.need || []).concat((current.WrappedComponent && current.WrappedComponent.need !== current.need ? current.WrappedComponent.need : []) || []).concat(prev);
	  }, []);

	  return (0, _promiseUtils.sequence)(needs, function (need) {
	    return store.dispatch(need(params, store.getState()));
	  });
	} /*
	  Utility function to fetch required data for component to render in server side.
	  This was inspired from https://github.com/caljrimmer/isomorphic-redux-app/blob/73e6e7d43ccd41e2eb557a70be79cebc494ee54b/src/common/api/fetchComponentDataBeforeRender.js
	  */

/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	/* WEBPACK VAR INJECTION */(function(__dirname) {'use strict';

	var webpack = __webpack_require__(16);
	var cssnext = __webpack_require__(79);
	var postcssFocus = __webpack_require__(80);
	var postcssReporter = __webpack_require__(81);

	module.exports = {
	  devtool: 'cheap-module-eval-source-map',

	  entry: {
	    app: ['webpack-hot-middleware/client', 'webpack/hot/only-dev-server', 'react-hot-loader/patch', './client/index.js'],
	    vendor: ['react', 'react-dom']
	  },

	  output: {
	    path: __dirname,
	    filename: 'app.js',
	    publicPath: 'http://10.0.0.8:8000/'
	  },

	  resolve: {
	    extensions: ['', '.js', '.jsx'],
	    modules: ['client', 'node_modules']
	  },

	  module: {
	    loaders: [{
	      test: /\.css$/,
	      exclude: /node_modules/,
	      loader: 'style-loader!css-loader?localIdentName=[name]__[local]__[hash:base64:5]&modules&importLoaders=1&sourceMap!postcss-loader'
	    }, {
	      test: /\.css$/,
	      include: /node_modules/,
	      loaders: ['style-loader', 'css-loader']
	    }, {
	      test: /\.jsx*$/,
	      exclude: [/node_modules/, /.+\.config.js/],
	      loader: 'babel'
	    }, {
	      test: /\.(jpe?g|gif|png|svg)$/i,
	      loader: 'url-loader?limit=10000'
	    }, {
	      test: /\.json$/,
	      loader: 'json-loader'
	    }]
	  },

	  plugins: [new webpack.HotModuleReplacementPlugin(), new webpack.optimize.CommonsChunkPlugin({
	    name: 'vendor',
	    minChunks: Infinity,
	    filename: 'vendor.js'
	  }), new webpack.DefinePlugin({
	    'process.env': {
	      CLIENT: JSON.stringify(true),
	      'NODE_ENV': JSON.stringify('development')
	    }
	  })],

	  postcss: function postcss() {
	    return [postcssFocus(), cssnext({
	      browsers: ['last 2 versions', 'IE > 10']
	    }), postcssReporter({
	      clearMessages: true
	    })];
	  }
	};
	/* WEBPACK VAR INJECTION */}.call(exports, ""))

/***/ },
/* 44 */
/***/ function(module, exports) {

	module.exports = require("body-parser");

/***/ },
/* 45 */
/***/ function(module, exports) {

	module.exports = require("compression");

/***/ },
/* 46 */
/***/ function(module, exports) {

	module.exports = require("path");

/***/ },
/* 47 */
/***/ function(module, exports) {

	module.exports = require("react-dom/server");

/***/ },
/* 48 */
/***/ function(module, exports) {

	module.exports = require("webpack-dev-middleware");

/***/ },
/* 49 */
/***/ function(module, exports) {

	module.exports = require("webpack-hot-middleware");

/***/ },
/* 50 */
/***/ function(module, exports) {

	"use strict";
	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = {
	  locale: 'en',
	  messages: {
	    siteTitle: 'Weather hen',
	    addPost: 'Add Post',
	    switchLanguage: 'Switch Language',
	    twitterMessage: 'We are on Twitter',
	    by: 'By',
	    deletePost: 'Delete Post',
	    createNewPost: 'Create new post',
	    authorName: 'Author\'s Name',
	    postTitle: 'Post Title',
	    postContent: 'Post Content',
	    submit: 'Submit',
	    comment: 'user {name} {value, plural,\n    \t  =0 {does not have any comments}\n    \t  =1 {has # comment}\n    \t  other {has # comments}\n    \t}',
	    HTMLComment: 'user <b style=\'font-weight: bold\'>{name} </b> {value, plural,\n    \t  =0 {does not have <i style=\'font-style: italic\'>any</i> comments}\n    \t  =1 {has <i style=\'font-style: italic\'>#</i> comment}\n    \t  other {has <i style=\'font-style: italic\'>#</i> comments}\n    \t}',
	    nestedDateComment: 'user {name} {value, plural,\n    \t  =0 {does not have any comments}\n    \t  =1 {has # comment}\n    \t  other {has # comments}\n    \t} as of {date}',
	    createNewSnapshot: 'Add a snapshot',
	    deleteSnapshot: 'Delete snapshot',
	    addSnapshot: 'Add a snapshot',
	    temperature: 'Temperature',
	    humidity: 'Humidity',
	    pressure: 'Pressure',
	    settings: 'Settings',
	    back: 'Back'
	  }
	};

/***/ },
/* 51 */
/***/ function(module, exports) {

	"use strict";
	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = {
	  locale: 'no',
	  messages: {
	    siteTitle: 'Værhøna',
	    addPost: 'Nytt innlegg',
	    switchLanguage: 'Bytt språk',
	    twitterMessage: 'Vi er på twitter',
	    by: 'Av',
	    deletePost: 'Slett innlegg',
	    createNewPost: 'Nytt innlegg',
	    authorName: 'Forfatter',
	    postTitle: 'Tittel',
	    postContent: 'Innhold',
	    submit: 'Lagre',
	    comment: 'bruker {name} {value, plural,\n    \t  =0 {har ingen kommentarer}\n    \t  =1 {har # kommentar}\n    \t  other {har # kommentarer}\n    \t}',
	    HTMLComment: 'bruker <b style=\'font-weight: bold\'>{name} </b> {value, plural,\n    \t  =0 {har <i style=\'font-style: italic\'>ingen</i> kommentarer}\n    \t  =1 {har <i style=\'font-style: italic\'>#</i> kommentar}\n    \t  other {har <i style=\'font-style: italic\'>#</i> kommentarer}\n    \t}',
	    nestedDateComment: 'bruker {name} {value, plural,\n  \t\t  =0 {har ingen kommentarer}\n  \t\t  =1 {har # kommentar}\n  \t\t  other {har # kommentarer}\n  \t\t} fra {date}',
	    createNewSnapshot: 'Legg til et snapshot',
	    addSnapshot: 'Legg til et snapshot',
	    deleteSnapshot: 'Slett snapshot',
	    temperature: 'Temperatur',
	    humidity: 'Luftfuktighet',
	    pressure: 'Lufttrykk',
	    settings: 'Innstillinger',
	    back: 'Back'
	  }
	};

/***/ },
/* 52 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.getAbsolutePathForImage = getAbsolutePathForImage;

	var _config = __webpack_require__(7);

	var _config2 = _interopRequireDefault(_config);

	var _s = __webpack_require__(30);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/**
	 * Returns the absolute path for an image for a snapshot (ex: http://some-domain/test/1/1/cuid.jpg)
	 * @param place
	 * @param snapshot
	 * @returns string
	*/
	function getAbsolutePathForImage(_ref) {
	  var place = _ref.place;
	  var snapshot = _ref.snapshot;


	  var imageUrlBase = void 0;

	  // Client side config
	  if (typeof __APP_CONFIG__ !== 'undefined') {
	    imageUrlBase = __APP_CONFIG__.imageUrlBase;
	  }
	  // Server side
	  else {
	      imageUrlBase = _config2.default.imageUrlBase;
	    }

	  return imageUrlBase + '/' + (0, _s.getRelativePathForImage)({ place: place, snapshot: snapshot });
	}

/***/ },
/* 53 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _jsx = function () { var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7; return function createRawReactElement(type, props, key, children) { var defaultProps = type && type.defaultProps; var childrenLength = arguments.length - 3; if (!props && childrenLength !== 0) { props = {}; } if (props && defaultProps) { for (var propName in defaultProps) { if (props[propName] === void 0) { props[propName] = defaultProps[propName]; } } } else if (!props) { props = defaultProps || {}; } if (childrenLength === 1) { props.children = children; } else if (childrenLength > 1) { var childArray = Array(childrenLength); for (var i = 0; i < childrenLength; i++) { childArray[i] = arguments[i + 3]; } props.children = childArray; } return { $$typeof: REACT_ELEMENT_TYPE, type: type, key: key === undefined ? null : '' + key, ref: null, props: props, _owner: null }; }; }();

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(0);

	var _react2 = _interopRequireDefault(_react);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var _ref = _jsx('title', {
	  id: 'title'
	}, void 0, 'App icon');

	var Icon = function (_Component) {
	  _inherits(Icon, _Component);

	  function Icon() {
	    _classCallCheck(this, Icon);

	    return _possibleConstructorReturn(this, (Icon.__proto__ || Object.getPrototypeOf(Icon)).apply(this, arguments));
	  }

	  _createClass(Icon, [{
	    key: 'render',
	    value: function render() {
	      var _props = this.props;
	      var width = _props.width;
	      var height = _props.height;
	      var fill = _props.fill;


	      var style = {
	        width: width,
	        height: height
	      };

	      var fillUmbrella = fill || '#81a594';
	      var fillBar = fill || '#c5c5bd';
	      var fillHen = fill || '#00628b';

	      return _jsx('svg', {
	        version: '1.1',
	        viewBox: '0,0,1000,1000',
	        style: style
	      }, void 0, _ref, _jsx('path', {
	        d: 'M504.812+70.1562C383.086+70.1562+285.321+175.736+244.16+292.084C252.666+280.01+286.003+256.484+312.732+262.295C336.966+267.563+356.396+308.135+356.634+308.655C361.467+302.156+391.754+264.051+438.772+272.046C469.501+277.271+492.461+331.34+493.151+332.665C493.75+332.224+531.984+272.896+559.612+272.606C589.408+272.294+636.209+308.543+636.457+308.995C639.838+299.956+644.975+275.35+681.559+265.899C716.716+256.817+761.671+284.048+763.781+285.719C713.697+157.288+616.521+70.1562+504.812+70.1562Z',
	        opacity: '1',
	        fill: fillUmbrella
	      }), _jsx('path', {
	        d: 'M483.332+267.028L507.07+267.028L507.07+691.676L483.332+691.676L483.332+267.028Z',
	        fill: fillBar
	      }), _jsx('path', {
	        d: 'M720.812+335.156C641.07+332.374+630.97+377.055+631.625+404.375C632.172+427.196+630.836+604.12+630.656+604.125C630.505+604.129+351.857+607.914+350.406+605.594C348.517+602.57+348.119+441.409+347.406+406.625C346.69+371.672+107.436+321.897+129.625+531.75C129.73+532.744+210.834+531.986+210.844+532.156C221.994+725.13+299.537+897.886+504.812+897.938C709.296+897.989+784.232+739.563+798.031+546.75C798.134+545.317+881.542+511.064+881.75+498.812C881.85+492.909+800.227+463.336+800.188+462.875C795.466+408.271+805.234+338.102+720.812+335.156ZM732.625+415.906C747.462+415.364+747.111+439.122+733.438+439.312C718.468+439.544+718.889+415.961+732.625+415.906Z',
	        opacity: '1',
	        fill: fillHen
	      }));
	    }
	  }]);

	  return Icon;
	}(_react.Component);

	exports.default = Icon;


	Icon.defaultProps = {
	  width: '30px',
	  height: '30px',
	  fill: null
	};

/***/ },
/* 54 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _jsx = function () { var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7; return function createRawReactElement(type, props, key, children) { var defaultProps = type && type.defaultProps; var childrenLength = arguments.length - 3; if (!props && childrenLength !== 0) { props = {}; } if (props && defaultProps) { for (var propName in defaultProps) { if (props[propName] === void 0) { props[propName] = defaultProps[propName]; } } } else if (!props) { props = defaultProps || {}; } if (childrenLength === 1) { props.children = children; } else if (childrenLength > 1) { var childArray = Array(childrenLength); for (var i = 0; i < childrenLength; i++) { childArray[i] = arguments[i + 3]; } props.children = childArray; } return { $$typeof: REACT_ELEMENT_TYPE, type: type, key: key === undefined ? null : '' + key, ref: null, props: props, _owner: null }; }; }();

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(0);

	var _react2 = _interopRequireDefault(_react);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var Icon = function (_Component) {
	  _inherits(Icon, _Component);

	  function Icon() {
	    _classCallCheck(this, Icon);

	    return _possibleConstructorReturn(this, (Icon.__proto__ || Object.getPrototypeOf(Icon)).apply(this, arguments));
	  }

	  _createClass(Icon, [{
	    key: "render",
	    value: function render() {
	      var _props = this.props;
	      var width = _props.width;
	      var height = _props.height;
	      var fill = _props.fill;


	      var style = {
	        width: width,
	        height: height
	      };

	      return _jsx("svg", {
	        version: "1.1",
	        style: style,
	        viewBox: "0 0 20 20"
	      }, void 0, _jsx("path", {
	        d: "M9.872 0.401c-5.302 0.071-9.542 4.426-9.471 9.727s4.426 9.542 9.728 9.472c5.301-0.072 9.542-4.426 9.471-9.728-0.073-5.302-4.428-9.542-9.728-9.471zM10.101 17.578c-4.185 0.057-7.623-3.291-7.68-7.477-0.055-4.185 3.292-7.623 7.478-7.679 4.185-0.056 7.623 3.291 7.679 7.477s-3.291 7.622-7.477 7.679zM5.453 14.504c0 0 4.569-0.627 6.518-2.576s2.576-6.518 2.576-6.518-4.568 0.628-6.517 2.576c-1.949 1.95-2.577 6.518-2.577 6.518zM9.015 8.972c0.819-0.82 2.385-1.401 3.729-1.762-0.361 1.341-0.945 2.919-1.759 3.732-0.544 0.544-1.426 0.544-1.97 0s-0.545-1.426 0-1.97z",
	        fill: fill
	      }));
	    }
	  }]);

	  return Icon;
	}(_react.Component);

	exports.default = Icon;


	Icon.defaultProps = {
	  width: '20px',
	  height: '20px',
	  fill: '#000000'
	};

/***/ },
/* 55 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _jsx = function () { var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7; return function createRawReactElement(type, props, key, children) { var defaultProps = type && type.defaultProps; var childrenLength = arguments.length - 3; if (!props && childrenLength !== 0) { props = {}; } if (props && defaultProps) { for (var propName in defaultProps) { if (props[propName] === void 0) { props[propName] = defaultProps[propName]; } } } else if (!props) { props = defaultProps || {}; } if (childrenLength === 1) { props.children = children; } else if (childrenLength > 1) { var childArray = Array(childrenLength); for (var i = 0; i < childrenLength; i++) { childArray[i] = arguments[i + 3]; } props.children = childArray; } return { $$typeof: REACT_ELEMENT_TYPE, type: type, key: key === undefined ? null : '' + key, ref: null, props: props, _owner: null }; }; }();

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(0);

	var _react2 = _interopRequireDefault(_react);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var Icon = function (_Component) {
	  _inherits(Icon, _Component);

	  function Icon() {
	    _classCallCheck(this, Icon);

	    return _possibleConstructorReturn(this, (Icon.__proto__ || Object.getPrototypeOf(Icon)).apply(this, arguments));
	  }

	  _createClass(Icon, [{
	    key: "render",
	    value: function render() {
	      var _props = this.props;
	      var width = _props.width;
	      var height = _props.height;
	      var fill = _props.fill;


	      var style = {
	        width: width,
	        height: height
	      };

	      return _jsx("svg", {
	        version: "1.1",
	        style: style,
	        viewBox: "0 0 20 20"
	      }, void 0, _jsx("path", {
	        d: "M3.955 0.093c-0.015-0.124-0.22-0.124-0.234 0-0.511 4.115-3.121 4.963-3.121 7.823 0 1.767 1.482 3.199 3.238 3.199s3.238-1.432 3.238-3.199c0-2.86-2.61-3.708-3.121-7.823zM16.279 0.093c-0.016-0.124-0.219-0.124-0.234 0-0.511 4.115-3.121 4.963-3.121 7.823 0 1.767 1.482 3.199 3.238 3.199s3.238-1.432 3.238-3.199c0-2.86-2.61-3.708-3.121-7.823zM9.883 8.978c-0.511 4.115-3.121 4.962-3.121 7.822 0 1.768 1.482 3.2 3.238 3.2s3.238-1.433 3.238-3.2c0-2.859-2.61-3.707-3.121-7.822-0.015-0.125-0.219-0.125-0.234 0z",
	        fill: fill
	      }));
	    }
	  }]);

	  return Icon;
	}(_react.Component);

	exports.default = Icon;


	Icon.defaultProps = {
	  width: '20px',
	  height: '20px',
	  fill: '#000000'
	};

/***/ },
/* 56 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _jsx = function () { var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7; return function createRawReactElement(type, props, key, children) { var defaultProps = type && type.defaultProps; var childrenLength = arguments.length - 3; if (!props && childrenLength !== 0) { props = {}; } if (props && defaultProps) { for (var propName in defaultProps) { if (props[propName] === void 0) { props[propName] = defaultProps[propName]; } } } else if (!props) { props = defaultProps || {}; } if (childrenLength === 1) { props.children = children; } else if (childrenLength > 1) { var childArray = Array(childrenLength); for (var i = 0; i < childrenLength; i++) { childArray[i] = arguments[i + 3]; } props.children = childArray; } return { $$typeof: REACT_ELEMENT_TYPE, type: type, key: key === undefined ? null : '' + key, ref: null, props: props, _owner: null }; }; }();

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(0);

	var _react2 = _interopRequireDefault(_react);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var Icon = function (_Component) {
	  _inherits(Icon, _Component);

	  function Icon() {
	    _classCallCheck(this, Icon);

	    return _possibleConstructorReturn(this, (Icon.__proto__ || Object.getPrototypeOf(Icon)).apply(this, arguments));
	  }

	  _createClass(Icon, [{
	    key: "render",
	    value: function render() {
	      var _props = this.props;
	      var width = _props.width;
	      var height = _props.height;
	      var fill = _props.fill;


	      var style = {
	        width: width,
	        height: height
	      };

	      return _jsx("svg", {
	        version: "1.1",
	        style: style,
	        viewBox: "0 0 22 22"
	      }, void 0, _jsx("path", {
	        d: "M20 22h-18c-1.104 0-2-0.896-2-2v-18c0-1.104 0.896-2 2-2h18c1.104 0 2 0.896 2 2v18c0 1.104-0.896 2-2 2zM20 2h-18v18h18v-18zM10 15l3-4 5 7h-14l4-5 2 2zM8 9c-1.104 0-2-0.896-2-2s0.896-2 2-2 2 0.896 2 2-0.896 2-2 2z",
	        fill: fill
	      }));
	    }
	  }]);

	  return Icon;
	}(_react.Component);

	exports.default = Icon;


	Icon.defaultProps = {
	  width: '22px',
	  height: '22px',
	  fill: '#000000'
	};

/***/ },
/* 57 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _jsx = function () { var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7; return function createRawReactElement(type, props, key, children) { var defaultProps = type && type.defaultProps; var childrenLength = arguments.length - 3; if (!props && childrenLength !== 0) { props = {}; } if (props && defaultProps) { for (var propName in defaultProps) { if (props[propName] === void 0) { props[propName] = defaultProps[propName]; } } } else if (!props) { props = defaultProps || {}; } if (childrenLength === 1) { props.children = children; } else if (childrenLength > 1) { var childArray = Array(childrenLength); for (var i = 0; i < childrenLength; i++) { childArray[i] = arguments[i + 3]; } props.children = childArray; } return { $$typeof: REACT_ELEMENT_TYPE, type: type, key: key === undefined ? null : '' + key, ref: null, props: props, _owner: null }; }; }();

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(0);

	var _react2 = _interopRequireDefault(_react);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var Icon = function (_Component) {
	  _inherits(Icon, _Component);

	  function Icon() {
	    _classCallCheck(this, Icon);

	    return _possibleConstructorReturn(this, (Icon.__proto__ || Object.getPrototypeOf(Icon)).apply(this, arguments));
	  }

	  _createClass(Icon, [{
	    key: "render",
	    value: function render() {
	      var _props = this.props;
	      var width = _props.width;
	      var height = _props.height;
	      var fill = _props.fill;


	      var style = {
	        width: width,
	        height: height
	      };

	      return _jsx("svg", {
	        version: "1.1",
	        style: style,
	        viewBox: "0 0 22 22"
	      }, void 0, _jsx("path", {
	        d: "M0.69 11.332l1.363 0.338 1.026-1.612-1.95-0.483c-0.488-0.122-0.981 0.174-1.102 0.66-0.121 0.484 0.176 0.976 0.663 1.097zM18.481 11.592l-4.463 4.018-5.248-4.061c-0.1-0.078-0.215-0.133-0.338-0.164l-0.699-0.172-1.026 1.611 1.099 0.271 5.698 4.408c0.165 0.129 0.361 0.191 0.558 0.191 0.219 0 0.438-0.078 0.61-0.234l5.027-4.525c0.373-0.336 0.401-0.908 0.065-1.279s-0.91-0.4-1.283-0.064zM8.684 7.181l4.887 3.129c0.412 0.263 0.96 0.154 1.239-0.247l5.028-7.242c0.285-0.412 0.182-0.975-0.231-1.26s-0.979-0.181-1.265 0.23l-4.528 6.522-4.917-3.148c-0.203-0.13-0.45-0.174-0.687-0.122s-0.442 0.195-0.571 0.399l-7.497 11.769c-0.27 0.422-0.144 0.98 0.28 1.248 0.151 0.096 0.32 0.141 0.487 0.141 0.301 0 0.595-0.148 0.768-0.42l7.007-10.999z",
	        fill: fill
	      }));
	    }
	  }]);

	  return Icon;
	}(_react.Component);

	exports.default = Icon;


	Icon.defaultProps = {
	  width: '22px',
	  height: '22px',
	  fill: '#000000'
	};

/***/ },
/* 58 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _jsx = function () { var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7; return function createRawReactElement(type, props, key, children) { var defaultProps = type && type.defaultProps; var childrenLength = arguments.length - 3; if (!props && childrenLength !== 0) { props = {}; } if (props && defaultProps) { for (var propName in defaultProps) { if (props[propName] === void 0) { props[propName] = defaultProps[propName]; } } } else if (!props) { props = defaultProps || {}; } if (childrenLength === 1) { props.children = children; } else if (childrenLength > 1) { var childArray = Array(childrenLength); for (var i = 0; i < childrenLength; i++) { childArray[i] = arguments[i + 3]; } props.children = childArray; } return { $$typeof: REACT_ELEMENT_TYPE, type: type, key: key === undefined ? null : '' + key, ref: null, props: props, _owner: null }; }; }();

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(0);

	var _react2 = _interopRequireDefault(_react);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var Icon = function (_Component) {
	  _inherits(Icon, _Component);

	  function Icon() {
	    _classCallCheck(this, Icon);

	    return _possibleConstructorReturn(this, (Icon.__proto__ || Object.getPrototypeOf(Icon)).apply(this, arguments));
	  }

	  _createClass(Icon, [{
	    key: "render",
	    value: function render() {
	      var _props = this.props;
	      var width = _props.width;
	      var height = _props.height;
	      var fill = _props.fill;


	      var style = {
	        width: width,
	        height: height
	      };

	      return _jsx("svg", {
	        version: "1.1",
	        style: style,
	        viewBox: "0 0 20 20"
	      }, void 0, _jsx("path", {
	        d: "M12.601 9.867v-8.867c0-0.552-0.448-1-1-1h-3.401c-0.553 0-0.8 0.448-0.8 1v8.867c-1.669 0.919-2.8 2.694-2.8 4.733 0 2.982 2.418 5.4 5.4 5.4s5.4-2.418 5.4-5.4c0-2.039-1.131-3.814-2.799-4.733zM10 18c-1.878 0-3.4-1.522-3.4-3.4 0-1.554 1.044-2.86 2.468-3.267v-7.333h2v7.373c1.354 0.448 2.333 1.723 2.333 3.227-0.001 1.878-1.523 3.4-3.401 3.4z",
	        fill: fill
	      }));
	    }
	  }]);

	  return Icon;
	}(_react.Component);

	exports.default = Icon;


	Icon.defaultProps = {
	  width: '20px',
	  height: '20px',
	  fill: '#000000'
	};

/***/ },
/* 59 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.App = undefined;

	var _jsx = function () { var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7; return function createRawReactElement(type, props, key, children) { var defaultProps = type && type.defaultProps; var childrenLength = arguments.length - 3; if (!props && childrenLength !== 0) { props = {}; } if (props && defaultProps) { for (var propName in defaultProps) { if (props[propName] === void 0) { props[propName] = defaultProps[propName]; } } } else if (!props) { props = defaultProps || {}; } if (childrenLength === 1) { props.children = children; } else if (childrenLength > 1) { var childArray = Array(childrenLength); for (var i = 0; i < childrenLength; i++) { childArray[i] = arguments[i + 3]; } props.children = childArray; } return { $$typeof: REACT_ELEMENT_TYPE, type: type, key: key === undefined ? null : '' + key, ref: null, props: props, _owner: null }; }; }();

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(0);

	var _react2 = _interopRequireDefault(_react);

	var _reactRedux = __webpack_require__(1);

	var _App = {
	  "container": "App__container__4uEyK"
	};

	var _App2 = _interopRequireDefault(_App);

	var _reactHelmet = __webpack_require__(2);

	var _reactHelmet2 = _interopRequireDefault(_reactHelmet);

	var _DevTools = __webpack_require__(21);

	var _DevTools2 = _interopRequireDefault(_DevTools);

	var _Header = __webpack_require__(4);

	var _Header2 = _interopRequireDefault(_Header);

	var _IntlActions = __webpack_require__(14);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	// Import Style


	// Import Components


	// Import Actions


	var _ref = _jsx(_DevTools2.default, {});

	var App = exports.App = function (_Component) {
	  _inherits(App, _Component);

	  function App(props) {
	    _classCallCheck(this, App);

	    var _this = _possibleConstructorReturn(this, (App.__proto__ || Object.getPrototypeOf(App)).call(this, props));

	    _this.state = { isMounted: false };
	    return _this;
	  }

	  _createClass(App, [{
	    key: 'componentDidMount',
	    value: function componentDidMount() {
	      this.setState({ isMounted: true }); // eslint-disable-line
	    }
	  }, {
	    key: 'getChildContext',
	    value: function getChildContext() {

	      // Enable children components to access the params
	      return {
	        params: this.props.params
	      };
	    }
	  }, {
	    key: 'render',
	    value: function render() {
	      return _jsx('div', {}, void 0, this.state.isMounted && !window.devToolsExtension && window.location.host.includes('localhost') && process.env.NODE_ENV === 'development' && _ref, _jsx('div', {
	        className: _App2.default.container
	      }, void 0, _jsx(_reactHelmet2.default, {
	        title: 'Værhøna',
	        titleTemplate: '%s - Værhøna',
	        meta: [{ charset: 'utf-8' }, {
	          'http-equiv': 'X-UA-Compatible',
	          content: 'IE=edge'
	        }, {
	          name: 'viewport',
	          content: 'width=device-width, initial-scale=1'
	        }]
	      }), _jsx('div', {}, void 0, this.props.children)));
	    }
	  }]);

	  return App;
	}(_react.Component);

	// Enable children components to access the params
	App.childContextTypes = {
	  params: _react2.default.PropTypes.object
	};

	// Retrieve data from state as props
	function mapStateToProps(state) {
	  return {
	    intl: state.intl
	  };
	}

	exports.default = (0, _reactRedux.connect)(mapStateToProps)(App);

/***/ },
/* 60 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _jsx = function () { var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7; return function createRawReactElement(type, props, key, children) { var defaultProps = type && type.defaultProps; var childrenLength = arguments.length - 3; if (!props && childrenLength !== 0) { props = {}; } if (props && defaultProps) { for (var propName in defaultProps) { if (props[propName] === void 0) { props[propName] = defaultProps[propName]; } } } else if (!props) { props = defaultProps || {}; } if (childrenLength === 1) { props.children = children; } else if (childrenLength > 1) { var childArray = Array(childrenLength); for (var i = 0; i < childrenLength; i++) { childArray[i] = arguments[i + 3]; } props.children = childArray; } return { $$typeof: REACT_ELEMENT_TYPE, type: type, key: key === undefined ? null : '' + key, ref: null, props: props, _owner: null }; }; }();

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(0);

	var _react2 = _interopRequireDefault(_react);

	var _FullHeightWrapper = {
	  "container": "FullHeightWrapper__container__2F5Zy"
	};

	var _FullHeightWrapper2 = _interopRequireDefault(_FullHeightWrapper);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var FullHeightWrapper = function (_Component) {
	  _inherits(FullHeightWrapper, _Component);

	  function FullHeightWrapper() {
	    _classCallCheck(this, FullHeightWrapper);

	    return _possibleConstructorReturn(this, (FullHeightWrapper.__proto__ || Object.getPrototypeOf(FullHeightWrapper)).apply(this, arguments));
	  }

	  _createClass(FullHeightWrapper, [{
	    key: 'render',
	    value: function render() {
	      return _jsx('div', {
	        className: _FullHeightWrapper2.default.container
	      }, void 0, this.props.children);
	    }
	  }]);

	  return FullHeightWrapper;
	}(_react.Component);

	exports.default = FullHeightWrapper;

/***/ },
/* 61 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	var _setup = __webpack_require__(17);

	var _IntlActions = __webpack_require__(14);

	function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

	var initLocale = global.navigator && global.navigator.language || 'no';

	var initialState = _extends({
	  locale: initLocale,
	  enabledLanguages: _setup.enabledLanguages
	}, _setup.localizationData[initLocale] || {});

	var IntlReducer = function IntlReducer() {
	  var state = arguments.length <= 0 || arguments[0] === undefined ? initialState : arguments[0];
	  var action = arguments[1];

	  switch (action.type) {
	    case _IntlActions.SWITCH_LANGUAGE:
	      {
	        var type = action.type;

	        var actionWithoutType = _objectWithoutProperties(action, ['type']); // eslint-disable-line


	        return _extends({}, state, actionWithoutType);
	      }

	    default:
	      return state;
	  }
	};

	exports.default = IntlReducer;

/***/ },
/* 62 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _jsx = function () { var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7; return function createRawReactElement(type, props, key, children) { var defaultProps = type && type.defaultProps; var childrenLength = arguments.length - 3; if (!props && childrenLength !== 0) { props = {}; } if (props && defaultProps) { for (var propName in defaultProps) { if (props[propName] === void 0) { props[propName] = defaultProps[propName]; } } } else if (!props) { props = defaultProps || {}; } if (childrenLength === 1) { props.children = children; } else if (childrenLength > 1) { var childArray = Array(childrenLength); for (var i = 0; i < childrenLength; i++) { childArray[i] = arguments[i + 3]; } props.children = childArray; } return { $$typeof: REACT_ELEMENT_TYPE, type: type, key: key === undefined ? null : '' + key, ref: null, props: props, _owner: null }; }; }();

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(0);

	var _react2 = _interopRequireDefault(_react);

	var _hammerjs = __webpack_require__(34);

	var _hammerjs2 = _interopRequireDefault(_hammerjs);

	var _RangeSlider = {
	  "range-slider": "RangeSlider__range-slider__3J3uT",
	  "range-slider__inner": "RangeSlider__range-slider__inner__2nO9Q",
	  "range-slider__line": "RangeSlider__range-slider__line__3CnRc",
	  "range-slider__indicator": "RangeSlider__range-slider__indicator__2vYVz"
	};

	var _RangeSlider2 = _interopRequireDefault(_RangeSlider);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	// Fix for server side Hammer
	if (typeof window === 'undefined') {
	  var window = {};
	}

	var RangeSlider = function (_Component) {
	  _inherits(RangeSlider, _Component);

	  function RangeSlider() {
	    _classCallCheck(this, RangeSlider);

	    return _possibleConstructorReturn(this, (RangeSlider.__proto__ || Object.getPrototypeOf(RangeSlider)).apply(this, arguments));
	  }

	  _createClass(RangeSlider, [{
	    key: 'componentDidMount',
	    value: function componentDidMount() {
	      var _this2 = this;

	      if (typeof document !== 'undefined' && !this.eventsBinded) {
	        this.eventsBinded = true;

	        this.hammerMc = new _hammerjs2.default.Manager(this.refs.outer);
	        //this.hammerMc.add(new Hammer.Pan());
	        //this.hammerMc.get('pan').set({ threshold: 0 });
	        //this.hammerMc.on('pan', this.onPan);
	        this.hammerMc.on('hammer.input', function (event) {
	          return _this2.onPan(event);
	        });
	      }
	    }
	  }, {
	    key: 'componentWillUnmount',
	    value: function componentWillUnmount() {
	      if (this.eventsBinded && this.hammerMc) {
	        this.hammerMc.destroy();
	      }
	    }
	  }, {
	    key: 'onPan',
	    value: function onPan(event) {

	      // Ensure that we can not select other elements on the page while dragging
	      event.preventDefault();

	      // Store dimensions for range
	      if (event.isFirst) {
	        var children = this.refs.outer.childNodes;
	        if (children.length !== 1) {
	          throw new Error('The child count for the range slider outer is not 1 as assumed');
	        }

	        var child = children[0];

	        this._tmpDimensions = {
	          width: child.clientWidth,
	          offsetLeft: child.offsetLeft,
	          outerWidth: this.refs.outer.clientWidth
	        };
	      }

	      if (event.isFinal) {
	        delete this._tmpDimensions;
	      } else {
	        var adj = this._tmpDimensions.offsetLeft;

	        var pct = (event.center.x - adj) / this._tmpDimensions.width * 100;

	        if (pct > 100) {
	          pct = 100;
	        } else if (pct < 0) {
	          pct = 0;
	        }

	        // Determine the closest index for this percentage
	        var closestIndex = void 0;
	        var closestPct = -1;
	        for (var i = 0; i < this.props.values.length; i++) {
	          var indexPct = i === 0 ? 0 : i / (this.props.values.length - 1) * 100;
	          var indexDistance = Math.abs(indexPct - pct);

	          if (closestPct === -1 || indexDistance < closestPct) {
	            closestIndex = i;
	            closestPct = indexDistance;
	          }
	        }

	        if (this.props.onChange) {
	          this.props.onChange({
	            index: closestIndex
	          });
	        }
	      }
	    }
	  }, {
	    key: 'getSelectedIndex',
	    value: function getSelectedIndex() {
	      var _this3 = this;

	      if (typeof this.props.value === 'undefined') {
	        return 0;
	      }

	      return this.props.values.findIndex(function (value) {
	        return value.cuid === _this3.props.value.cuid;
	      });
	    }

	    // Returns the percentage position for a given index

	  }, {
	    key: 'getIndicatorPercentage',
	    value: function getIndicatorPercentage() {
	      var index = arguments.length <= 0 || arguments[0] === undefined ? this.getSelectedIndex() : arguments[0];

	      return index / (this.props.values.length - 1) * 100;
	    }
	  }, {
	    key: 'render',
	    value: function render() {
	      return _react2.default.createElement(
	        'div',
	        { className: _RangeSlider2.default['range-slider'], ref: 'outer' },
	        _jsx('div', {
	          className: _RangeSlider2.default['range-slider__inner']
	        }, void 0, _jsx('div', {
	          className: _RangeSlider2.default['range-slider__line']
	        }), this.props.values.length > 0 ? _jsx('div', {
	          className: _RangeSlider2.default['range-slider__indicator'],
	          style: { left: this.getIndicatorPercentage() + '%' }
	        }) : null)
	      );
	    }
	  }]);

	  return RangeSlider;
	}(_react.Component);

	exports.default = RangeSlider;

/***/ },
/* 63 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _jsx = function () { var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7; return function createRawReactElement(type, props, key, children) { var defaultProps = type && type.defaultProps; var childrenLength = arguments.length - 3; if (!props && childrenLength !== 0) { props = {}; } if (props && defaultProps) { for (var propName in defaultProps) { if (props[propName] === void 0) { props[propName] = defaultProps[propName]; } } } else if (!props) { props = defaultProps || {}; } if (childrenLength === 1) { props.children = children; } else if (childrenLength > 1) { var childArray = Array(childrenLength); for (var i = 0; i < childrenLength; i++) { childArray[i] = arguments[i + 3]; } props.children = childArray; } return { $$typeof: REACT_ELEMENT_TYPE, type: type, key: key === undefined ? null : '' + key, ref: null, props: props, _owner: null }; }; }();

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(0);

	var _react2 = _interopRequireDefault(_react);

	var _reactRedux = __webpack_require__(1);

	var _Icon = __webpack_require__(25);

	var _Icon2 = _interopRequireDefault(_Icon);

	var _SnapshotGraph = {
	  "outer": "SnapshotGraph__outer__3_pap",
	  "inner": "SnapshotGraph__inner__398Cy",
	  "prop-chooser": "SnapshotGraph__prop-chooser__3P5dg"
	};

	var _SnapshotGraph2 = _interopRequireDefault(_SnapshotGraph);

	var _date = __webpack_require__(31);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	//import c3 from 'c3';
	//import 'c3/c3.css';

	//import ChartJS from 'chart.js';

	var snapshotProperties = [{
	  type: 'temperature',
	  icon: 'thermometer',
	  label: 'Temperatur',
	  valueType: 'C'
	}, {
	  type: 'humidity',
	  icon: 'droplets',
	  label: 'Luftfuktighet',
	  valueType: '%'
	}, {
	  type: 'pressure',
	  icon: 'compass',
	  label: 'Trykk',
	  valueType: 'hPa'
	}];

	var SnapshotGraph = function (_Component) {
	  _inherits(SnapshotGraph, _Component);

	  function SnapshotGraph(props) {
	    _classCallCheck(this, SnapshotGraph);

	    var _this = _possibleConstructorReturn(this, (SnapshotGraph.__proto__ || Object.getPrototypeOf(SnapshotGraph)).call(this, props));

	    _this.state = {
	      selectedProperty: snapshotProperties[0]
	    };

	    // Fix since the import 'c3/c3.css' does not work atm.
	    /*if (typeof document !== 'undefined') {
	      if (!window.__vaerhona__c3added) {
	        window.__vaerhona__c3added = true;
	        let styleNode = document.createElement('style');
	        styleNode.innerText = `.c3 svg{font:10px sans-serif;-webkit-tap-highlight-color:transparent}.c3 line,.c3 path{fill:none;stroke:#000}.c3 text{-webkit-user-select:none;-moz-user-select:none;user-select:none}.c3-bars path,.c3-event-rect,.c3-legend-item-tile,.c3-xgrid-focus,.c3-ygrid{shape-rendering:crispEdges}.c3-chart-arc path{stroke:#fff}.c3-chart-arc text{fill:#fff;font-size:13px}.c3-grid line{stroke:#aaa}.c3-grid text{fill:#aaa}.c3-xgrid,.c3-ygrid{stroke-dasharray:3 3}.c3-text.c3-empty{fill:gray;font-size:2em}.c3-line{stroke-width:1px}.c3-circle._expanded_{stroke-width:1px;stroke:#fff}.c3-selected-circle{fill:#fff;stroke-width:2px}.c3-bar{stroke-width:0}.c3-bar._expanded_{fill-opacity:.75}.c3-target.c3-focused{opacity:1}.c3-target.c3-focused path.c3-line,.c3-target.c3-focused path.c3-step{stroke-width:2px}.c3-target.c3-defocused{opacity:.3!important}.c3-region{fill:#4682b4;fill-opacity:.1}.c3-brush .extent{fill-opacity:.1}.c3-legend-item{font-size:12px}.c3-legend-item-hidden{opacity:.15}.c3-legend-background{opacity:.75;fill:#fff;stroke:#d3d3d3;stroke-width:1}.c3-title{font:14px sans-serif}.c3-tooltip-container{z-index:10}.c3-tooltip{border-collapse:collapse;border-spacing:0;background-color:#fff;empty-cells:show;-webkit-box-shadow:7px 7px 12px -9px #777;-moz-box-shadow:7px 7px 12px -9px #777;box-shadow:7px 7px 12px -9px #777;opacity:.9}.c3-tooltip tr{border:1px solid #CCC}.c3-tooltip th{background-color:#aaa;font-size:14px;padding:2px 5px;text-align:left;color:#FFF}.c3-tooltip td{font-size:13px;padding:3px 6px;background-color:#fff;border-left:1px dotted #999}.c3-tooltip td>span{display:inline-block;width:10px;height:10px;margin-right:6px}.c3-tooltip td.value{text-align:right}.c3-area{stroke-width:0;opacity:.2}.c3-chart-arcs-title{dominant-baseline:middle;font-size:1.3em}.c3-chart-arcs .c3-chart-arcs-background{fill:#e0e0e0;stroke:none}.c3-chart-arcs .c3-chart-arcs-gauge-unit{fill:#000;font-size:16px}.c3-chart-arcs .c3-chart-arcs-gauge-max,.c3-chart-arcs .c3-chart-arcs-gauge-min{fill:#777}.c3-chart-arc .c3-gauge-value{fill:#000}`;
	        document.head.appendChild(styleNode);
	      }
	    }*/
	    return _this;
	  }

	  _createClass(SnapshotGraph, [{
	    key: 'getColumnData',
	    value: function getColumnData() {
	      var _this2 = this;

	      return this.props.snapshots.map(function (snapshot) {
	        return snapshot[_this2.state.selectedProperty.type];
	      });
	    }
	  }, {
	    key: 'getColumnDates',
	    value: function getColumnDates() {
	      return this.props.snapshots.map(function (snapshot) {
	        return (0, _date.prettyDate)(new Date(snapshot.dateAdded));
	      });
	    }
	  }, {
	    key: 'componentDidMount',
	    value: function componentDidMount() {
	      this.loadChart();
	    }
	  }, {
	    key: 'componentDidUpdate',
	    value: function componentDidUpdate() {
	      this.loadChart();
	    }
	  }, {
	    key: 'loadChart',
	    value: function loadChart() {

	      // Client side only
	      if (typeof document !== 'undefined') {

	        if (this.myLineChart) {
	          this.myLineChart.data.labels = this.getColumnDates();
	          this.myLineChart.data.datasets[0].label = this.state.selectedProperty;
	          this.myLineChart.data.datasets[0].data = this.getColumnData();
	          this.myLineChart.update();
	        } else {
	          this.myLineChart = new Chart(this.refs.canvas, {
	            type: 'line',
	            data: {
	              labels: this.getColumnDates(),
	              datasets: [{
	                label: this.state.selectedProperty,
	                data: this.getColumnData(),
	                fill: false,
	                borderColor: 'rgba(72, 120, 220, .5)'
	              }]
	            },
	            options: {
	              maintainAspectRatio: false,
	              title: {
	                display: false,
	                position: 'bottom'
	              },
	              legend: {
	                display: false,
	                position: 'bottom'
	              }
	            }
	          });
	        }
	      }
	    }
	  }, {
	    key: 'loadChartC3',
	    value: function loadChartC3() {
	      if (typeof document !== 'undefined') {

	        var columns = [['x'].concat(_toConsumableArray(this.getColumnDates())), ['data'].concat(_toConsumableArray(this.getColumnData()))];

	        if (!this.chart) {
	          this.chart = c3.generate({
	            bindto: this.refs.inner,
	            data: {
	              x: 'x',
	              columns: columns
	            },
	            axis: {
	              x: {
	                type: 'timeseries',
	                tick: {
	                  format: '%Y-%m-%d',
	                  count: 2
	                }
	              }
	            },
	            legend: {
	              show: false
	            }
	          });
	        } else {
	          this.chart.load({ columns: columns });
	        }
	      }
	    }
	  }, {
	    key: 'setTooltip',
	    value: function setTooltip() {
	      //tooltip: {
	      //  format: {
	      //    title: x => this.props.snapshots[x].dateAdded,
	      //    name: () => '',
	      //    value: (name, ratio, id, index) => (Math.round(data[index] * 10) / 10)
	      //  }
	      //}
	    }
	  }, {
	    key: 'changeSelectedProperty',
	    value: function changeSelectedProperty(newProperty) {
	      this.setState({
	        selectedProperty: newProperty
	      });
	    }
	  }, {
	    key: 'render',
	    value: function render() {
	      var _this3 = this;

	      return _jsx('div', {
	        className: _SnapshotGraph2.default['outer']
	      }, void 0, _react2.default.createElement(
	        'div',
	        { className: _SnapshotGraph2.default['inner'], ref: 'inner' },
	        _react2.default.createElement('canvas', { ref: 'canvas' })
	      ), _jsx('div', {
	        className: _SnapshotGraph2.default['prop-chooser']
	      }, void 0, snapshotProperties.map(function (prop) {
	        return _jsx(_Icon2.default, {
	          selected: _this3.state.selectedProperty.type === prop.type,
	          type: prop.icon,
	          label: prop.label,
	          onClick: _this3.changeSelectedProperty.bind(_this3, prop)
	        }, prop.type);
	      })));
	    }
	  }]);

	  return SnapshotGraph;
	}(_react.Component);

	function mapStateToProps(state) {
	  return {};
	}

	exports.default = (0, _reactRedux.connect)(mapStateToProps)(SnapshotGraph);

/***/ },
/* 64 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _jsx = function () { var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7; return function createRawReactElement(type, props, key, children) { var defaultProps = type && type.defaultProps; var childrenLength = arguments.length - 3; if (!props && childrenLength !== 0) { props = {}; } if (props && defaultProps) { for (var propName in defaultProps) { if (props[propName] === void 0) { props[propName] = defaultProps[propName]; } } } else if (!props) { props = defaultProps || {}; } if (childrenLength === 1) { props.children = children; } else if (childrenLength > 1) { var childArray = Array(childrenLength); for (var i = 0; i < childrenLength; i++) { childArray[i] = arguments[i + 3]; } props.children = childArray; } return { $$typeof: REACT_ELEMENT_TYPE, type: type, key: key === undefined ? null : '' + key, ref: null, props: props, _owner: null }; }; }();

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(0);

	var _react2 = _interopRequireDefault(_react);

	var _reactRedux = __webpack_require__(1);

	var _keycode = __webpack_require__(78);

	var _keycode2 = _interopRequireDefault(_keycode);

	var _PlaceReducer = __webpack_require__(5);

	var _SnapshotReducer = __webpack_require__(10);

	var _SnapshotActions = __webpack_require__(9);

	var _s = __webpack_require__(52);

	var _RangeSlider = __webpack_require__(62);

	var _RangeSlider2 = _interopRequireDefault(_RangeSlider);

	var _SnapshotImage = {
	  "snapshot-image": "SnapshotImage__snapshot-image__3TFCr",
	  "snapshot-image__inner": "SnapshotImage__snapshot-image__inner__DqJX5",
	  "snapshot-image__date": "SnapshotImage__snapshot-image__date__1mgWc",
	  "snapshot-image__time-of-day": "SnapshotImage__snapshot-image__time-of-day__29gnQ",
	  "snapshot-image__values": "SnapshotImage__snapshot-image__values__15vLD",
	  "snapshot-image__img": "SnapshotImage__snapshot-image__img__3jyIH"
	};

	var _SnapshotImage2 = _interopRequireDefault(_SnapshotImage);

	var _KeyHandler = __webpack_require__(65);

	var _KeyHandler2 = _interopRequireDefault(_KeyHandler);

	var _PointerHandler = __webpack_require__(66);

	var _PointerHandler2 = _interopRequireDefault(_PointerHandler);

	var _date = __webpack_require__(31);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var SnapshotImage = function (_Component) {
	  _inherits(SnapshotImage, _Component);

	  function SnapshotImage() {
	    _classCallCheck(this, SnapshotImage);

	    return _possibleConstructorReturn(this, (SnapshotImage.__proto__ || Object.getPrototypeOf(SnapshotImage)).apply(this, arguments));
	  }

	  _createClass(SnapshotImage, [{
	    key: 'componentDidMount',
	    value: function componentDidMount() {
	      if (typeof document !== 'undefined') {

	        this.keyHandler = new _KeyHandler2.default({
	          onKeyPressAndRepeat: this.navigateFromKeyDown.bind(this)
	        });

	        this.pointerHandler = new _PointerHandler2.default({
	          element: this.refs.image,
	          onPointerDownAndRepeat: this.onImageClick.bind(this)
	        });
	      }
	    }
	  }, {
	    key: 'componentWillUnmount',
	    value: function componentWillUnmount() {
	      if (this.keyHandler) {
	        this.keyHandler.unBind();
	      }
	      if (this.pointerHandler) {
	        this.pointerHandler.unBind();
	      }
	    }
	  }, {
	    key: 'navigateFromKeyDown',
	    value: function navigateFromKeyDown(event) {
	      if ((0, _keycode2.default)(event) === 'left') {
	        this.navigate({ direction: 'prev' });
	      } else if ((0, _keycode2.default)(event) === 'right') {
	        this.navigate({ direction: 'next' });
	      }
	    }
	  }, {
	    key: 'navigate',
	    value: function navigate(_ref) {
	      var direction = _ref.direction;

	      if (direction) {
	        if (direction === 'prev') {
	          return this.props.dispatch((0, _SnapshotActions.showPrevSnapshot)());
	        } else if (direction === 'next') {
	          return this.props.dispatch((0, _SnapshotActions.showNextSnapshot)());
	        }
	      }
	    }
	  }, {
	    key: 'onRangeSliderChange',
	    value: function onRangeSliderChange(data) {
	      this.props.dispatch((0, _SnapshotActions.showSnapshotFromIndex)(data.index));
	    }
	  }, {
	    key: 'onImageClick',
	    value: function onImageClick(event) {

	      // Determine position
	      var clientX = event.center.x;
	      var imageWidth = this.refs.image.offsetWidth;
	      var position = clientX / imageWidth * 100;

	      if (position > 50) {
	        return this.navigate({ direction: 'next' });
	      } else {
	        return this.navigate({ direction: 'prev' });
	      }
	    }
	  }, {
	    key: 'render',
	    value: function render() {

	      var imageStyle = {
	        backgroundImage: 'url("' + (0, _s.getAbsolutePathForImage)({
	          place: this.props.place,
	          snapshot: this.props.selectedSnapshot
	        }) + '")'
	      };

	      return _jsx('div', {
	        className: _SnapshotImage2.default['snapshot-image']
	      }, void 0, _jsx('div', {
	        className: _SnapshotImage2.default['snapshot-image__inner']
	      }, void 0, _jsx('div', {
	        className: _SnapshotImage2.default['snapshot-image__date']
	      }, void 0, (0, _date.prettyDate)(this.props.selectedSnapshot.dateAdded)), _jsx('div', {
	        className: _SnapshotImage2.default['snapshot-image__time-of-day']
	      }, void 0, (0, _date.prettyTime)(this.props.selectedSnapshot.dateAdded)), _jsx('div', {
	        className: _SnapshotImage2.default['snapshot-image__values']
	      }, void 0, _jsx('span', {}, void 0, this.props.selectedSnapshot.temperature, '℃'), _jsx('span', {}, void 0, this.props.selectedSnapshot.humidity, '%'), _jsx('span', {}, void 0, this.props.selectedSnapshot.pressure, 'hPa')), _react2.default.createElement('div', { className: _SnapshotImage2.default['snapshot-image__img'],
	        style: imageStyle,
	        ref: 'image'
	      })), _jsx(_RangeSlider2.default, {
	        value: this.props.selectedSnapshot,
	        values: this.props.snapshots,
	        onChange: this.onRangeSliderChange.bind(this)
	      }));
	    }
	  }]);

	  return SnapshotImage;
	}(_react.Component);

	function mapStateToProps(state) {
	  return {
	    selectedPlace: (0, _PlaceReducer.getSelectedPlace)(state),
	    selectedSnapshot: (0, _SnapshotReducer.getSelectedSnapshot)(state),
	    snapshots: (0, _SnapshotReducer.getSnapshots)(state)
	  };
	}

	exports.default = (0, _reactRedux.connect)(mapStateToProps)(SnapshotImage);

/***/ },
/* 65 */
/***/ function(module, exports) {

	"use strict";
	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var KeyHandler = function () {
	  function KeyHandler(_ref) {
	    var onKeyPressAndRepeat = _ref.onKeyPressAndRepeat;

	    _classCallCheck(this, KeyHandler);

	    if (typeof document !== 'undefined') {
	      this.bind();

	      this.onKeyPressAndRepeat = onKeyPressAndRepeat;
	    }
	  }

	  _createClass(KeyHandler, [{
	    key: 'bind',
	    value: function bind() {
	      var _this = this;

	      // Register the listener function
	      this.onKeyPressListener = function (event) {
	        return _this.onKeyPress(event);
	      };

	      document.addEventListener('keydown', this.onKeyPressListener, false);
	    }
	  }, {
	    key: 'unBind',
	    value: function unBind() {
	      if (typeof document !== 'undefined') {
	        document.removeEventListener('keydown', this.onKeyPressListener);
	      }
	    }
	  }, {
	    key: 'onKeyPress',
	    value: function onKeyPress(event) {
	      this.onKeyPressAndRepeat(event);
	    }
	  }]);

	  return KeyHandler;
	}();

	exports.default = KeyHandler;

/***/ },
/* 66 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _hammerjs = __webpack_require__(34);

	var _hammerjs2 = _interopRequireDefault(_hammerjs);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var PointerHandler = function () {
	  function PointerHandler(_ref) {
	    var element = _ref.element;
	    var onPointerDownAndRepeat = _ref.onPointerDownAndRepeat;

	    _classCallCheck(this, PointerHandler);

	    if (!element && typeof document !== 'undefined') {
	      element = document;
	    }

	    this.element = element;
	    this.onPointerDownAndRepeat = onPointerDownAndRepeat;

	    this.intervalAndTimeoutIds = [];

	    this.bind();
	  }

	  _createClass(PointerHandler, [{
	    key: 'bind',
	    value: function bind() {
	      var _this = this;

	      this.hammerMc = new _hammerjs2.default(this.element);

	      this.hammerMc.get('press').set({
	        time: 150
	      });

	      this.hammerMc.on('press', function (event) {
	        return _this.startInterval(event);
	      });
	      this.hammerMc.on('pressup', function (event) {
	        return _this.stopInterval();
	      });
	      this.hammerMc.on('hammer.input', function (event) {
	        if (event.isFirst && event.pointers.length === 1) {
	          _this.onPointerDownAndRepeat(event);
	          _this.lastRecordedEvent = event;
	        }
	      });
	    }
	  }, {
	    key: 'unBind',
	    value: function unBind() {
	      if (this.hammerMc) {
	        this.hammerMc.destroy();
	      }

	      this.stopInterval();
	    }
	  }, {
	    key: 'startInterval',
	    value: function startInterval(event) {
	      var _this2 = this;

	      this.lastRecordedEvent = event;

	      this.stopInterval();

	      this.intervalTick();

	      // Initially, the intervals are 100ms apart
	      this.intervalAndTimeoutIds.push(setTimeout(function () {
	        _this2.intervalAndTimeoutIds.push(setInterval(_this2.intervalTick.bind(_this2), 75));

	        // Then, after 500ms, the intervals are 25ms apart
	        _this2.intervalAndTimeoutIds.push(setTimeout(function () {
	          _this2.stopInterval();
	          _this2.intervalAndTimeoutIds.push(setInterval(_this2.intervalTick.bind(_this2), 35));
	        }, 500));
	      }, 75));
	    }
	  }, {
	    key: 'stopInterval',
	    value: function stopInterval() {
	      if (this.intervalAndTimeoutIds && this.intervalAndTimeoutIds.length > 0) {
	        this.intervalAndTimeoutIds.forEach(function (id) {
	          return clearTimeout(id);
	        });
	        this.intervalAndTimeoutIds.length = 0;
	      }
	    }
	  }, {
	    key: 'intervalTick',
	    value: function intervalTick() {
	      if (this.lastRecordedEvent) {
	        this.onPointerDownAndRepeat(this.lastRecordedEvent);
	      }
	    }
	  }]);

	  return PointerHandler;
	}();

	exports.default = PointerHandler;

/***/ },
/* 67 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _jsx = function () { var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7; return function createRawReactElement(type, props, key, children) { var defaultProps = type && type.defaultProps; var childrenLength = arguments.length - 3; if (!props && childrenLength !== 0) { props = {}; } if (props && defaultProps) { for (var propName in defaultProps) { if (props[propName] === void 0) { props[propName] = defaultProps[propName]; } } } else if (!props) { props = defaultProps || {}; } if (childrenLength === 1) { props.children = children; } else if (childrenLength > 1) { var childArray = Array(childrenLength); for (var i = 0; i < childrenLength; i++) { childArray[i] = arguments[i + 3]; } props.children = childArray; } return { $$typeof: REACT_ELEMENT_TYPE, type: type, key: key === undefined ? null : '' + key, ref: null, props: props, _owner: null }; }; }();

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(0);

	var _react2 = _interopRequireDefault(_react);

	var _reactRedux = __webpack_require__(1);

	var _Icon = __webpack_require__(25);

	var _Icon2 = _interopRequireDefault(_Icon);

	var _SnapshotImage = __webpack_require__(64);

	var _SnapshotImage2 = _interopRequireDefault(_SnapshotImage);

	var _SnapshotGraph = __webpack_require__(63);

	var _SnapshotGraph2 = _interopRequireDefault(_SnapshotGraph);

	var _SnapshotActions = __webpack_require__(9);

	var _AppActions = __webpack_require__(13);

	var _AppReducer = __webpack_require__(20);

	var _SnapshotReducer = __webpack_require__(10);

	var _SnapshotsNavigator = {
	  "outer": "SnapshotsNavigator__outer__2Tsiu",
	  "inner": "SnapshotsNavigator__inner__1vzhk",
	  "icon-menu": "SnapshotsNavigator__icon-menu__qkv9T"
	};

	var _SnapshotsNavigator2 = _interopRequireDefault(_SnapshotsNavigator);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	// Import Components


	// Import Actions


	// Import Selectors


	// Import styles


	var SnapshotsNavigator = function (_Component) {
	  _inherits(SnapshotsNavigator, _Component);

	  function SnapshotsNavigator() {
	    var _ref;

	    var _temp, _this, _ret;

	    _classCallCheck(this, SnapshotsNavigator);

	    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	      args[_key] = arguments[_key];
	    }

	    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = SnapshotsNavigator.__proto__ || Object.getPrototypeOf(SnapshotsNavigator)).call.apply(_ref, [this].concat(args))), _this), _this.handleDeleteSnapshot = function (snapshot) {
	      if (confirm('Do you want to delete this snapshot')) {
	        // eslint-disable-line
	        _this.props.dispatch((0, _SnapshotActions.deleteSnapshotRequest)(snapshot));
	      }
	    }, _this.handleAddSnapshot = function (snapshot) {
	      _this.props.dispatch((0, _AppActions.toggleAddSnapshot)());
	      _this.props.dispatch((0, _SnapshotActions.addSnapshotRequest)(snapshot));
	    }, _temp), _possibleConstructorReturn(_this, _ret);
	  }

	  _createClass(SnapshotsNavigator, [{
	    key: 'changeSelectedNavigationItem',
	    value: function changeSelectedNavigationItem(itemName) {
	      this.props.dispatch((0, _AppActions.changeMainNavigation)(itemName));
	    }
	  }, {
	    key: 'render',
	    value: function render() {
	      var _this2 = this;

	      var IconMenu = _jsx('div', {
	        className: _SnapshotsNavigator2.default['icon-menu']
	      }, void 0, _AppActions.MAIN_NAVIGATION_ITEMS.map(function (itemName) {
	        return _jsx(_Icon2.default, {
	          selected: _this2.props.selectedMainNavigation === itemName,
	          type: itemName,
	          onClick: _this2.changeSelectedNavigationItem.bind(_this2, itemName)
	        }, itemName);
	      }));

	      var child = void 0;

	      switch (this.props.selectedMainNavigation) {
	        case 'image':
	          child = _jsx(_SnapshotImage2.default, {
	            snapshots: this.props.snapshots,
	            place: this.props.place
	          }, 'image');
	          break;

	        case 'graph':
	          child = _jsx(_SnapshotGraph2.default, {
	            snapshots: this.props.snapshots,
	            place: this.props.place
	          }, 'graph');
	          break;

	        default:
	          child = '404';
	      }

	      return _jsx('div', {
	        className: _SnapshotsNavigator2.default['outer']
	      }, void 0, _jsx('div', {
	        className: _SnapshotsNavigator2.default['inner']
	      }, void 0, child), IconMenu);
	    }
	  }]);

	  return SnapshotsNavigator;
	}(_react.Component);

	// Retrieve data from store as props


	function mapStateToProps(state) {
	  return {
	    showAddSnapshot: (0, _AppReducer.getShowAddSnapshot)(state),
	    selectedMainNavigation: (0, _AppReducer.getSelectedMainNavigation)(state)
	  };
	}

	SnapshotsNavigator.contextTypes = {
	  router: _react2.default.PropTypes.object
	};

	exports.default = (0, _reactRedux.connect)(mapStateToProps)(SnapshotsNavigator);

/***/ },
/* 68 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _redux = __webpack_require__(35);

	var _AppReducer = __webpack_require__(20);

	var _AppReducer2 = _interopRequireDefault(_AppReducer);

	var _SnapshotReducer = __webpack_require__(10);

	var _SnapshotReducer2 = _interopRequireDefault(_SnapshotReducer);

	var _PlaceReducer = __webpack_require__(5);

	var _PlaceReducer2 = _interopRequireDefault(_PlaceReducer);

	var _IntlReducer = __webpack_require__(61);

	var _IntlReducer2 = _interopRequireDefault(_IntlReducer);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	// Combine all reducers into one root reducer


	// Import Reducers
	exports.default = (0, _redux.combineReducers)({
	  app: _AppReducer2.default,
	  snapshots: _SnapshotReducer2.default,
	  places: _PlaceReducer2.default,
	  intl: _IntlReducer2.default
	}); /**
	     * Root Reducer
	     */

/***/ },
/* 69 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.saveImageFromSnapshot = saveImageFromSnapshot;

	var _awsSdk = __webpack_require__(72);

	var _awsSdk2 = _interopRequireDefault(_awsSdk);

	var _config = __webpack_require__(7);

	var _config2 = _interopRequireDefault(_config);

	var _s = __webpack_require__(30);

	var _isWebp = __webpack_require__(76);

	var _isWebp2 = _interopRequireDefault(_isWebp);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	_awsSdk2.default.config.loadFromPath('../__config/vaerhona/aws.config.json');

	/**
	 * Takes a base64 image string and stores the required images to a S3 bucket
	 * @param snapshot
	 * @param place
	 * @returns Promise
	 */
	function saveImageFromSnapshot(_ref) {
	  var snapshot = _ref.snapshot;
	  var place = _ref.place;

	  return new Promise(function (resolve, reject) {

	    if (!snapshot.image) {
	      return reject({
	        message: 'snapshot.image is undefined',
	        snapshot: snapshot
	      });
	    }

	    // Create buffer
	    var imageBuffer = new Buffer.from(snapshot.image, 'base64');

	    if ((0, _isWebp2.default)(imageBuffer)) {
	      // Convert
	      console.log('todo: convert to webp');
	    }

	    var jpgHandler = uploadSingleImage({ place: place, snapshot: snapshot, imageBuffer: imageBuffer, fileType: 'jpg' });

	    Promise.all([jpgHandler]).then(function (success) {
	      resolve(success);
	    }, function (error) {
	      reject(err);
	    });
	  });
	}

	/**
	 * Stores a single image buffer to a S3 bucket
	 * @param snapshot
	 * @param place
	 * @param imageBuffer
	 * @param fileType
	 * @returns Promise
	 */
	function uploadSingleImage(_ref2) {
	  var place = _ref2.place;
	  var snapshot = _ref2.snapshot;
	  var imageBuffer = _ref2.imageBuffer;
	  var fileType = _ref2.fileType;

	  return new Promise(function (resolve, reject) {
	    new _awsSdk2.default.S3({
	      params: {
	        Bucket: _config2.default.aws.s3BucketName,
	        Key: (0, _s.getRelativePathForImage)({ place: place, snapshot: snapshot, fileType: fileType })
	      }
	    }).upload({
	      Body: imageBuffer
	    }).send(function (err, data) {
	      if (err) {
	        reject(err);
	      } else {
	        resolve(data);
	      }
	    });
	  });
	}

/***/ },
/* 70 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	/* WEBPACK VAR INJECTION */(function(__dirname) {'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _jsx = function () { var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7; return function createRawReactElement(type, props, key, children) { var defaultProps = type && type.defaultProps; var childrenLength = arguments.length - 3; if (!props && childrenLength !== 0) { props = {}; } if (props && defaultProps) { for (var propName in defaultProps) { if (props[propName] === void 0) { props[propName] = defaultProps[propName]; } } } else if (!props) { props = defaultProps || {}; } if (childrenLength === 1) { props.children = children; } else if (childrenLength > 1) { var childArray = Array(childrenLength); for (var i = 0; i < childrenLength; i++) { childArray[i] = arguments[i + 3]; } props.children = childArray; } return { $$typeof: REACT_ELEMENT_TYPE, type: type, key: key === undefined ? null : '' + key, ref: null, props: props, _owner: null }; }; }();

	// Webpack Requirements


	var _express = __webpack_require__(11);

	var _express2 = _interopRequireDefault(_express);

	var _compression = __webpack_require__(45);

	var _compression2 = _interopRequireDefault(_compression);

	var _mongoose = __webpack_require__(12);

	var _mongoose2 = _interopRequireDefault(_mongoose);

	var _bodyParser = __webpack_require__(44);

	var _bodyParser2 = _interopRequireDefault(_bodyParser);

	var _path = __webpack_require__(46);

	var _path2 = _interopRequireDefault(_path);

	var _IntlWrapper = __webpack_require__(36);

	var _IntlWrapper2 = _interopRequireDefault(_IntlWrapper);

	var _webpack = __webpack_require__(16);

	var _webpack2 = _interopRequireDefault(_webpack);

	var _webpackConfig = __webpack_require__(43);

	var _webpackConfig2 = _interopRequireDefault(_webpackConfig);

	var _webpackDevMiddleware = __webpack_require__(48);

	var _webpackDevMiddleware2 = _interopRequireDefault(_webpackDevMiddleware);

	var _webpackHotMiddleware = __webpack_require__(49);

	var _webpackHotMiddleware2 = _interopRequireDefault(_webpackHotMiddleware);

	var _store = __webpack_require__(38);

	var _reactRedux = __webpack_require__(1);

	var _react = __webpack_require__(0);

	var _react2 = _interopRequireDefault(_react);

	var _server = __webpack_require__(47);

	var _reactRouter = __webpack_require__(3);

	var _reactHelmet = __webpack_require__(2);

	var _reactHelmet2 = _interopRequireDefault(_reactHelmet);

	var _routes = __webpack_require__(37);

	var _routes2 = _interopRequireDefault(_routes);

	var _fetchData = __webpack_require__(42);

	var _snapshot = __webpack_require__(41);

	var _snapshot2 = _interopRequireDefault(_snapshot);

	var _place = __webpack_require__(40);

	var _place2 = _interopRequireDefault(_place);

	var _dummyData = __webpack_require__(39);

	var _dummyData2 = _interopRequireDefault(_dummyData);

	var _config = __webpack_require__(7);

	var _config2 = _interopRequireDefault(_config);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	// Initialize the Express App
	var app = new _express2.default();

	// Run Webpack dev server in development mode
	if (process.env.NODE_ENV === 'development') {
	  var compiler = (0, _webpack2.default)(_webpackConfig2.default);
	  app.use((0, _webpackDevMiddleware2.default)(compiler, { noInfo: true, publicPath: _webpackConfig2.default.output.publicPath }));
	  app.use((0, _webpackHotMiddleware2.default)(compiler));
	}

	// React And Redux Setup


	// Import required modules


	// Define the app specific config
	var APP_CONFIG = {};
	APP_CONFIG.imageUrlBase = _config2.default.imageUrlBase;

	// MongoDB Connection
	_mongoose2.default.connect(_config2.default.mongoURL, function (error) {
	  if (error) {
	    console.error('Please make sure Mongodb is installed and running!'); // eslint-disable-line no-console
	    throw error;
	  }

	  // feed some dummy data in DB.
	  //if (process.env.NODE_ENV === 'development') {
	  //  dummyData();
	  //}
	});

	// Apply body Parser and server public assets and routes
	app.use((0, _compression2.default)());
	app.use(_bodyParser2.default.json({ limit: '20mb' }));
	app.use(_bodyParser2.default.urlencoded({ limit: '20mb', extended: false }));

	app.use(_express2.default.static(_path2.default.resolve(__dirname, '../dist')));
	app.use(_express2.default.static(_path2.default.resolve(__dirname, '../static')));

	app.use('/api', _snapshot2.default);
	app.use('/api', _place2.default);

	// Render Initial HTML
	var renderFullPage = function renderFullPage(html, initialState) {
	  var head = _reactHelmet2.default.rewind();

	  // Import Manifests
	  var assetsManifest = process.env.webpackAssets && JSON.parse(process.env.webpackAssets);
	  var chunkManifest = process.env.webpackChunkAssets && JSON.parse(process.env.webpackChunkAssets);

	  return '\n    <!doctype html>\n    <html>\n      <head>\n        ' + head.base.toString() + '\n        ' + head.title.toString() + '\n        ' + head.meta.toString() + '\n        ' + head.link.toString() + '\n        ' + head.script.toString() + '\n\n        <script>window.__APP_CONFIG__ = ' + JSON.stringify(APP_CONFIG) + '</script>\n\n        ' + (process.env.NODE_ENV === 'production' ? '<link rel=\'stylesheet\' href=\'' + assetsManifest['/app.css'] + '\' />' : '') + '\n\n        <link rel="apple-touch-icon" sizes="180x180" href="/favicons/apple-touch-icon.png?v=5A5637bzNY">\n        <link rel="icon" type="image/png" href="/favicons/favicon-32x32.png?v=5A5637bzNY" sizes="32x32">\n        <link rel="icon" type="image/png" href="/favicons/favicon-16x16.png?v=5A5637bzNY" sizes="16x16">\n        <link rel="manifest" href="/favicons/manifest.json?v=5A5637bzNY">\n        <link rel="mask-icon" href="/favicons/safari-pinned-tab.svg?v=5A5637bzNY" color="#00628b">\n        <link rel="shortcut icon" href="/favicons/favicon.ico?v=5A5637bzNY">\n        <meta name="msapplication-TileColor" content="#00628b">\n        <meta name="msapplication-TileImage" content="/favicons/mstile-144x144.png?v=5A5637bzNY">\n        <meta name="msapplication-config" content="/favicons/browserconfig.xml?v=5A5637bzNY">\n        <meta name="theme-color" content="#ffffff">\n      </head>\n      <body>\n        <div id="root">' + (process.env.NODE_ENV === 'production' ? html : '<div>' + html + '</div>') + '</div>\n        <script>\n          window.__INITIAL_STATE__ = ' + JSON.stringify(initialState) + ';\n          ' + (process.env.NODE_ENV === 'production' ? '//<![CDATA[\n          window.webpackManifest = ' + JSON.stringify(chunkManifest) + ';\n          //]]>' : '') + '\n        </script>\n        <script src=\'' + (process.env.NODE_ENV === 'production' ? assetsManifest['/vendor.js'] : '/vendor.js') + '\'></script>\n        <script src=\'' + (process.env.NODE_ENV === 'production' ? assetsManifest['/app.js'] : '/app.js') + '\'></script>\n        <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.2.2/Chart.min.js" integrity="sha256-fQOizuxGMT1DCcF0rU6EK8zQM6TwsSWGTHjL5UpxLlU=" crossorigin="anonymous"></script>\n      </body>\n    </html>\n  ';
	};

	var renderError = function renderError(err) {
	  var softTab = '&#32;&#32;&#32;&#32;';
	  var errTrace = process.env.NODE_ENV !== 'production' ? ':<br><br><pre style="color:red">' + softTab + err.stack.replace(/\n/g, '<br>' + softTab) + '</pre>' : '';
	  return renderFullPage('Server Error' + errTrace, {});
	};

	// Server Side Rendering based on routes matched by React-router.
	app.use(function (req, res, next) {
	  (0, _reactRouter.match)({ routes: _routes2.default, location: req.url }, function (err, redirectLocation, renderProps) {
	    if (err) {
	      return res.status(500).end(renderError(err));
	    }

	    if (redirectLocation) {
	      return res.redirect(302, redirectLocation.pathname + redirectLocation.search);
	    }

	    if (!renderProps) {
	      return next();
	    }

	    var store = (0, _store.configureStore)();

	    return (0, _fetchData.fetchComponentData)(store, renderProps.components, renderProps.params).then(function () {
	      var initialView = (0, _server.renderToString)(_jsx(_reactRedux.Provider, {
	        store: store
	      }, void 0, _jsx(_IntlWrapper2.default, {}, void 0, _react2.default.createElement(_reactRouter.RouterContext, renderProps))));
	      var finalState = store.getState();

	      res.set('Content-Type', 'text/html').status(200).end(renderFullPage(initialView, finalState));
	    }).catch(function (error) {
	      return next(error);
	    });
	  });
	});

	// start app
	app.listen(_config2.default.port, function (error) {
	  if (!error) {
	    console.log('Værhøna is running on port: ' + _config2.default.port + '!'); // eslint-disable-line
	  }
	});

	exports.default = app;
	/* WEBPACK VAR INJECTION */}.call(exports, "server"))

/***/ },
/* 71 */
/***/ function(module, exports) {

	"use strict";
	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.sequence = sequence;
	/**
	 * Throw an array to it and a function which can generate promises
	 * and it will call them sequentially, one after another
	 */
	function sequence(items, consumer) {
	  var results = [];
	  var runner = function runner() {
	    var item = items.shift();
	    if (item) {
	      return consumer(item).then(function (result) {
	        results.push(result);
	      }).then(runner);
	    }

	    return Promise.resolve(results);
	  };

	  return runner();
	}

/***/ },
/* 72 */
/***/ function(module, exports) {

	module.exports = require("aws-sdk");

/***/ },
/* 73 */
/***/ function(module, exports) {

	module.exports = require("intl");

/***/ },
/* 74 */
/***/ function(module, exports) {

	module.exports = require("intl/locale-data/jsonp/en");

/***/ },
/* 75 */
/***/ function(module, exports) {

	module.exports = require("intl/locale-data/jsonp/nb-NO");

/***/ },
/* 76 */
/***/ function(module, exports) {

	module.exports = require("is-webp");

/***/ },
/* 77 */
/***/ function(module, exports) {

	module.exports = require("isomorphic-fetch");

/***/ },
/* 78 */
/***/ function(module, exports) {

	module.exports = require("keycode");

/***/ },
/* 79 */
/***/ function(module, exports) {

	module.exports = require("postcss-cssnext");

/***/ },
/* 80 */
/***/ function(module, exports) {

	module.exports = require("postcss-focus");

/***/ },
/* 81 */
/***/ function(module, exports) {

	module.exports = require("postcss-reporter");

/***/ },
/* 82 */
/***/ function(module, exports) {

	module.exports = require("react-intl/locale-data/en");

/***/ },
/* 83 */
/***/ function(module, exports) {

	module.exports = require("react-intl/locale-data/no");

/***/ },
/* 84 */
/***/ function(module, exports) {

	module.exports = require("redux-devtools");

/***/ },
/* 85 */
/***/ function(module, exports) {

	module.exports = require("redux-devtools-dock-monitor");

/***/ },
/* 86 */
/***/ function(module, exports) {

	module.exports = require("redux-devtools-log-monitor");

/***/ },
/* 87 */
/***/ function(module, exports) {

	module.exports = require("redux-thunk");

/***/ }
/******/ ]);