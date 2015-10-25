(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var data = require('./data.js');

var types = {
	tempOutside: {
		dataID: "temperature-outside",
		name: "Temperatur",
		valueSuffix: "°C"
	},
	pressure: {
		dataID: "pressure",
		name: "Lufttrykk",
		valueSuffix: "hPa"
	},
	humidity: {
		dataID: "humidity",
		name: "Luftfuktighet",
		valueSuffix: "%"
	}
};

setChartTheme();

// Load temperature chart
function load() {

	var callback = function callback() {};
	var type = false;

	var arg_len = arguments.length;
	if (arg_len > 0) {

		if ($.isFunction(arguments[0])) {
			callback = arguments[0];
		} else {
			type = arguments[0];
		}

		if (arg_len > 1) {
			callback = arguments[1];
		}
	}

	var items = data.getCurrent();

	// Default chart
	var typeDef = types.tempOutside;
	weather.chartTypeDef = typeDef.dataID;

	// Get dates
	var items_date = GetOnlyData(items, "date");

	// Set tickInterval
	var tickInterval = Math.floor(items_date.length / 10);
	if (window.innerWidth <= 500) {
		tickInterval = Math.floor(items_date.length / 2);
	}

	// Already initiated. Just update
	if (weather.highchart) {

		if (type) {
			typeDef = types[type];
		}

		var weatherData;

		if (typeDef) {
			weatherData = GetOnlyData(items, typeDef.dataID);

			weather.chartTypeDef = typeDef;
		} else {
			weatherData = GetOnlyData(items, weather.chartTypeDef);
		}

		weather.highchart.series[0].setData(weatherData);

		// Update
		weather.highchart.xAxis[0].setCategories(GetOnlyData(items, "date"));

		weather.highchart.xAxis[0].update({
			tickInterval: tickInterval,
			categories: items_date
		});
	}

	// Init highchart using outside temperature
	else {

			// Get temperature outside
			var items_default = GetOnlyData(items, weather.chartTypeDef);

			var $chartEl = $('#chart-canvas');

			// Go!
			$chartEl.highcharts({
				title: false,
				subtitle: false,
				legend: false,
				xAxis: {
					tickInterval: tickInterval,
					categories: items_date
				},
				series: [{
					data: items_default
				}],
				yAxis: {
					title: false,
					plotLines: [{
						value: 0,
						width: 1,
						color: '#808080'
					}]
				}
			});

			weather.highchart = $chartEl.highcharts();
		}

	// Set serie values
	var serie = weather.highchart.series[0];
	if (serie && typeDef) {
		serie.name = typeDef.name;
		serie.tooltipOptions.pointFormat = "<b>{point.y}</b> " + typeDef.valueSuffix;
	}

	if (callback) {
		setTimeout(callback, 500);
	}

	// Extract relevant data
	function GetOnlyData(arr, dataType) {
		var returnItems = [];

		arr.map(function (item) {
			if (!item.motion) {
				switch (dataType) {
					case "temperature-outside":
						returnItems.push(item.tmp_o);
						break;
					case "temperature-inside":
						returnItems.push(item.tmp_i);
						break;
					case "pressure":
						returnItems.push(item.prs_o);
						break;
					case "humidity":
						returnItems.push(item.hum_o);
						break;
					case "date":
						returnItems.push(weather.shortDateTime(new Date(item.t)));
						break;
				}
			}
		});

		return returnItems;
	}
}

function setChartTheme() {

	/**
  * Gray theme for Highcharts JS
  * @author Torstein Honsi
  */
	Highcharts.theme = {
		colors: ["#e0e0e0"],
		chart: {
			backgroundColor: "transparent",
			borderWidth: 0,
			borderRadius: 0,
			plotBackgroundColor: null,
			plotShadow: false,
			plotBorderWidth: 0
		},
		title: {
			style: {
				color: '#FFF',
				font: '16px Lucida Grande, Lucida Sans Unicode, Verdana, Arial, Helvetica, sans-serif'
			}
		},
		subtitle: {
			style: {
				color: '#DDD',
				font: '12px Lucida Grande, Lucida Sans Unicode, Verdana, Arial, Helvetica, sans-serif'
			}
		},
		xAxis: {
			gridLineWidth: 0,
			lineColor: '#999',
			tickColor: '#999',
			labels: {
				style: {
					color: '#999',
					fontWeight: 'bold'
				}
			},
			title: {
				style: {
					color: '#AAA',
					font: 'bold 12px Lucida Grande, Lucida Sans Unicode, Verdana, Arial, Helvetica, sans-serif'
				}
			}
		},
		yAxis: {
			alternateGridColor: null,
			minorTickInterval: null,
			gridLineColor: 'rgba(255, 255, 255, .1)',
			minorGridLineColor: 'rgba(255,255,255,0.07)',
			lineWidth: 0,
			tickWidth: 0,
			labels: {
				style: {
					color: '#999',
					fontWeight: 'bold'
				}
			},
			title: {
				style: {
					color: '#AAA',
					font: 'bold 12px Lucida Grande, Lucida Sans Unicode, Verdana, Arial, Helvetica, sans-serif'
				}
			}
		},
		labels: {
			style: {
				color: '#CCC'
			}
		},
		tooltip: {
			backgroundColor: "rgba(50, 50, 50, .8)",
			borderWidth: 0,
			style: {
				color: '#ccc'
			},
			pointFormat: "<b>{point.y}</b> °C"
		},

		plotOptions: {
			line: {
				marker: {
					enabled: false
				}
			}
		},

		toolbar: {
			itemStyle: {
				color: '#CCC'
			}
		},

		navigator: {
			handles: {
				backgroundColor: '#666',
				borderColor: '#AAA'
			},
			outlineColor: '#CCC',
			maskFill: 'rgba(16, 16, 16, 0.5)',
			series: {
				color: '#7798BF',
				lineColor: '#A6C7ED'
			}
		},

		// special colors for some of the demo examples
		legendBackgroundColor: 'rgba(48, 48, 48, 0.8)',
		background2: 'rgb(70, 70, 70)',
		dataLabelsColor: '#444',
		textColor: '#E0E0E0',
		maskColor: 'rgba(255,255,255,0.3)'
	};

	// Apply the theme
	Highcharts.setOptions(Highcharts.theme);
}

module.exports = {
	load: load
};

},{"./data.js":2}],2:[function(require,module,exports){
'use strict';

var settings = require('./settings.js'),
    image = require('./image.js'),
    imagesLoaded = require('imagesloaded');

var items_current = [];
var items_all = [];

// Get data from localStorage or API
function Get(options) {

	var data_loader = $.Deferred(),
	    dates = [],
	    api_date_from,
	    api_date_to,
	    datetime_from,
	    datetime_to;

	// Show loading indication
	weather.loading();
	data_loader.always(function () {
		weather.loading(false);
	});

	// Schedule the last image to be stored in localstorage after completness
	data_loader.then(StoreLastImage);

	datetime_from = options.from.getTime();
	datetime_to = options.to.getTime();

	// Dates to ask from API
	api_date_from = new Date(datetime_from);
	api_date_to = new Date(datetime_to);

	var forceGetFromApi = options.forceGetFromApi;

	// Check where the data is avalible
	items_current = DataAvailbleAtClient();

	if (items_current.length === 0 || forceGetFromApi) {

		// Get from API
		GetDataFromAPI(api_date_from, api_date_to, function (items) {

			// Merge the new data with the existing cache (items_all)
			MergeWithCache(items);

			// Save everything
			Save();

			// Get the selection again
			items_current = DataAvailbleAtClient(true);

			// Resolve promise
			data_loader.resolve(items_current);
		});
	}
	// Its all good. Just resolve without asking the API for data =)
	else {
			data_loader.resolve(items_current);
		}

	return data_loader;

	// Check if we can use only the data from the client
	function DataAvailbleAtClient(forceGetFromClient) {
		var items = GetDataFromClient(),
		    len = items.length;

		// If there is any data from the client
		if (len > 0) {

			// Compile list of all dates
			for (var i = 0; i < len; i++) {
				dates.push(items[i].t);
			}

			// See if all the hours between from and to are availble
			while (!FromDateIsLargerThanTo() && dates.indexOf(api_date_from.getTime()) !== -1) {
				api_date_from.setHours(api_date_from.getHours() + 1);
			}
			while (!FromDateIsLargerThanTo() && dates.indexOf(api_date_to.getTime()) !== -1) {
				api_date_to.setHours(api_date_to.getHours() - 1);
			}

			// We have all data on the client. Continue withouth asking API for data
			if (forceGetFromClient || FromDateIsLargerThanTo()) {
				return filterItemsForCurrentDate();
			}
			//else if (forceGetFromClient) {
			//	return filterItemsForCurrentDate();
			//}
		}

		// Compile list of items use
		function filterItemsForCurrentDate() {
			var returnItems = [];

			for (var x = 0; x < len; x++) {
				var item = items[x];

				if (item.t >= datetime_from && item.t <= datetime_to) {
					returnItems.push(item);
				}
			}

			return returnItems;
		}

		return [];
	}

	function FromDateIsLargerThanTo() {
		return api_date_from.getTime() > api_date_to.getTime();
	}
}

function GetDataFromAPI(from, to, callback) {

	var date_from = new Date(from.getTime());
	var date_to = new Date(to.getTime());

	$.ajax({
		url: "http://www.vhsys.no/api/",
		dataType: "jsonp",
		cache: false,
		data: {
			from: CreateDateKeyDb(date_from),
			to: CreateDateKeyDb(date_to),
			place: settings.place,
			testdata: kw.testapi
		}
	}).then(function (response) {
		if (response && response.success) {

			var items_from_api = ParseAPIdata(response.data);

			if (response.firstSnapshotTime) {
				weather.setMinimumDate(new Date(response.firstSnapshotTime * 1000));
			}

			if (callback) {
				callback(items_from_api);
			}
		} else {
			onRequestFail();
		}
	}).fail(onRequestFail);

	function onRequestFail() {
		if (callback) {
			callback([]);
		}
	}

	// Parse data API response
	function ParseAPIdata(rawArray) {

		var items_to_return = [],
		    len = rawArray.length;

		for (var i = 0; i < len; i++) {

			var item = rawArray[i];
			var date = new Date(item.time * 1000);

			var parsedItem = {
				date: date,
				t: Number(date),
				motion: parseInt(item.motion_event),
				tmp_o: Round(parseFloat(item.outside_temperature), 1),
				tmp_i: Round(parseFloat(item.inside_temperature), 1),
				prs_o: parseInt(item.outside_pressure),
				hum_o: parseFloat(item.outside_humidity),
				img: item.image
			};

			CreateImageUrl(parsedItem);

			items_to_return.push(parsedItem);
		}

		return items_to_return;
	}
}

// Retrieves data from cache or client storage
function GetDataFromClient() {

	var items_string, raw_data;

	// If already got
	if (items_all.length > 0) {
		return items_all;
	}

	// Attempt to get from local storage
	try {
		items_string = localStorage.getItem(GetLocalStorageKey());
	} catch (e) {
		console.error("Could not get data from localStorage", e);
	}

	if (items_string != null) {
		raw_data = JSON.parse(items_string);
		items_all = ParseLocalStorageData(raw_data.items);
	}

	// Enriching data from localStorage storage
	function ParseLocalStorageData(items) {

		// Add date property
		items.map(function (item) {
			item.date = new Date(item.t);
			CreateImageUrl(item);
		});

		return items;
	}

	return items_all;
}

function CreateImageUrl(item) {
	var year = item.date.getFullYear();
	var month = weather.ensureDigits(item.date.getMonth() + 1, 2);
	var date = weather.ensureDigits(item.date.getDate(), 2);

	item.img_url = settings.place + "/" + year + "/" + month + "/" + date + "/" + item.img;
}

// Save items to localStorage
function Save() {
	var items = [],
	    len = items_all.length;

	// Create clone of all objects
	for (var i = 0; i < len; i++) {
		items.push($.extend({}, items_all[i]));
	}

	// Remove date property before saving
	items.map(function (item) {
		delete item.date;
		delete item.img_url;
	});

	var saveObj = {
		place: settings.place,
		time: Number(new Date()),
		items: items
	};

	// Store
	return SaveToLocalStorage(GetLocalStorageKey(), JSON.stringify(saveObj));
}

function SaveToLocalStorage(key, data) {
	try {
		localStorage.setItem(key, data);
		return true;
	} catch (e) {
		console.log(e);
	}

	return false;
}

// Merge new array with client array
function MergeWithCache(newItems) {

	var keys = [],
	    len = items_all.length,
	    len_new = newItems.length,
	    item;

	// Create array of keys of the existing array
	for (var i = 0; i < len; i++) {
		keys.push(items_all[i].t);
	}

	// Add the entries that does not exist in items_all
	for (var x = 0; x < len_new; x++) {
		item = newItems[x];
		if (keys.indexOf(item.t) === -1) {
			items_all.push(item);
		}
	}

	// Sort by date asc
	items_all.sort(function (a, b) {
		return Number(a.date) - Number(b.date);
	});

	return items_all;
}

// Round helper
function Round(number, decimals) {
	var pow = Math.pow(10, decimals);
	return parseInt(number * pow) / pow;
}

// The local storage key
function GetLocalStorageKey() {
	return settings.localStorageKey + "_" + settings.place;
}

//function CreateDateKey (date) {
//	return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
//}

function CreateDateKeyDb(date) {
	return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
}

function GetCurrent() {
	return items_current;
}

function GetCurrentLength() {
	return items_current.length;
}

function GetAll() {
	return items_all;
}

function StoreLastImage() {

	var lastSnapshot = items_all[items_all.length - 1];

	// Dont do this atm. The canvas width will be wider than the window width and will cause horizontal scrollbar
	if (!lastSnapshot || true) {
		return;
	}

	if (!weather.$.imageCanvas) {
		weather.$.imageCanvas = $("<canvas class='image-binary' />");
		weather.$.imageCanvas.appendTo(weather.$.app);
	}

	var ctx = weather.$.imageCanvas[0].getContext("2d");
	var $img = $("<img crossorigin='anonymous' class='image-binary-helper' src='" + image.resolve(lastSnapshot.img_url, false) + "' />").appendTo(weather.$.app);

	imagesLoaded($img[0], function () {

		weather.$.imageCanvas[0].width = weather.imageWidth;
		weather.$.imageCanvas[0].height = weather.imageHeight;

		ctx.drawImage($img[0], 0, 0);

		// The image must be from same origin if attempting to call toDataURL
		try {
			var imageData = weather.$.imageCanvas[0].toDataURL("image/jpeg");

			var lastImage = {
				img: lastSnapshot.img_url,
				data: imageData
			};

			SaveToLocalStorage(GetLocalStorageKey() + "_image", JSON.stringify(lastImage));
		} catch (e) {
			console.log(e);
		}

		setTimeout(function () {
			$img.remove();
		}, 100);
	});
}

function GetStoredImage() {
	var last = {};

	try {
		var item = localStorage.getItem(GetLocalStorageKey() + "_image");
		if (item) {
			last = JSON.parse(item);
		}
	} catch (e) {
		console.log(e);
	}

	return last;
}

module.exports = {
	get: Get,
	getCurrent: GetCurrent,
	getCurrentLength: GetCurrentLength,
	getAll: GetAll,
	getFromAPI: GetDataFromAPI,
	getFromClient: GetDataFromClient,
	getStoredImage: GetStoredImage
};

},{"./image.js":3,"./settings.js":7,"imagesloaded":8}],3:[function(require,module,exports){
"use strict";

var data;

var current = {
	index: 0,
	item: null,
	transform: []
};

function PageLoad() {

	// Not sure why I cannot require the data at the top. Need to figure this out.
	data = require('./data.js');
}

// Show last image in list and pre load close images
function Load(options) {

	options = options || {};

	var items = data.getCurrent(),
	    lastIndex = items.length - 1,
	    indexToShow;

	if (lastIndex < 0) {
		lastIndex = 0;
	}

	// Index by options
	if (typeof options.indexToShow !== "undefined") {
		indexToShow = options.indexToShow;
	}
	// Index by current item
	else if (current.item != null) {
			var time = current.item.date.getTime();

			// New range starts after the last index
			if (items[0] && items[0].date.getTime() > time) {
				indexToShow = 0;
			} else {
				items.map(function (itm, index) {
					if (itm.date.getTime() === time) {
						indexToShow = index;
					}
				});
			}
		}

	// Not set, just show last
	if (indexToShow == null) {
		indexToShow = lastIndex;
	}

	// Initiate kw range
	weather.$.rangeKw.kwRange({
		max: lastIndex,
		value: indexToShow,
		markIntervals: createMotionIntervals(items),
		onChange: function onChange(index) {
			LoadImage(index);
		}
	});

	// Show the specified image
	LoadImage(indexToShow, items);
}

// Create motion intervals
function createMotionIntervals(items) {

	var motionIntervals = [];
	var motionCurrentInterval = [];
	var pctMultiplier = 100 / items.length;

	items.forEach(function (item, index) {
		if (item.motion) {
			motionCurrentInterval.push(index);
		} else if (motionCurrentInterval.length > 0) {
			endInterval();
		}
	});

	endInterval();

	function endInterval() {
		if (motionCurrentInterval.length > 0) {
			var interval = {
				cls: "motion",
				start: motionCurrentInterval[0],
				end: motionCurrentInterval[motionCurrentInterval.length - 1]
			};
			interval.startPct = interval.start * pctMultiplier;
			interval.endPct = interval.end * pctMultiplier + pctMultiplier;
			interval.widthPct = interval.endPct - interval.startPct;

			motionIntervals.push(interval);

			motionCurrentInterval.length = 0;
		}
	}

	return motionIntervals;
}

// Show image in list and pre load 10 closest
function LoadImage(index, items) {

	items = items || data.getCurrent();

	var len = items.length;

	// Determine index input type
	if (typeof index === "object") {
		if (index.pct) {
			index = Math.floor(len * index.pct);
		}
	} else if (typeof index === "string") {
		if (index === "first") {
			index = 0;
		} else if (index === "last") {
			index = len - 1;
		}

		// Ca. one day up/down
		else if (index === "+1d" || index === "-1d") {

				var checkIndex = current.index,
				    found = false,
				    timeOneDay = 1000 * 60 * 60 * 24,
				    increment = 1,
				    checkItem;

				if (index === "-1d") {
					increment = -1;
				}

				do {
					checkIndex = checkIndex + increment;
					checkItem = items[checkIndex];

					if (checkItem) {

						if (Math.abs(checkItem.t - current.item.t) >= timeOneDay) {
							found = true;
						}
					}
				} while (checkIndex < items.length && checkIndex >= 0 && !found);

				index = checkIndex;
			}
	}

	index = parseInt(index);

	var item = items[index];
	if (item) {

		current.index = index;
		current.item = item;

		displayImage(items);

		var longDate = "<span class='long-date'>" + weather.prettyDate(item.date) + "</span>";
		var mediumDate = "<span class='medium-date'>" + weather.prettyDate(item.date, "short") + "</span>";
		var shortDate = "<span class='short-date'>" + weather.shortDateTime(item.date) + "</span>";

		weather.$.imgDate.html(longDate + mediumDate + shortDate);
		weather.$.imgWeather.html("<span>" + item.tmp_o + "&#8451;</span><span>" + item.hum_o + "%</span><span>" + parseInt(item.prs_o) + "hPa</span>");

		// Update isLast flag
		current.indexIsLast = current.index === len - 1;

		weather.$.rangeKw.kwRange("setValue", {
			value: index,
			text: weather.time(item.date, true),
			cls: item.motion ? "motion" : ""
		});
	}

	return index;
}

// Handles the display of the current item and preloads the other closest items
var displayImage = (function () {
	var loadedUrls = [],
	    $img;

	return function (items) {

		if (!$img) {
			$img = $("<div class='selected'/>");
			weather.$.imgWrap.append($img);
		}
		$img.css({
			backgroundImage: "url(" + ResolveImg(current.item.img_url) + ")"
		});
		return;

		var $imgs = weather.$.imgWrap.children(),
		    newUrls = [],
		    imgsInsert = [];

		// Load this and 5 before and after
		handleItem(current.item);
		handleItem(items[current.index + 1]);
		handleItem(items[current.index + 2]);
		handleItem(items[current.index + 3]);
		handleItem(items[current.index + 4]);
		handleItem(items[current.index + 5]);
		handleItem(items[current.index - 1]);
		handleItem(items[current.index - 2]);
		handleItem(items[current.index - 3]);
		handleItem(items[current.index - 4]);
		handleItem(items[current.index - 5]);

		// Insert new
		if (imgsInsert.length > 0) {
			weather.$.imgWrap.append(imgsInsert.join(""));
		}

		// Remove old
		var removes = [];
		for (var i = 0; i < loadedUrls.length; i++) {
			var url = loadedUrls[i];
			if (newUrls.indexOf(url) === -1) {
				$imgs.filter("[data-url='" + url + "']").remove();
				removes.push(i);
			}
		}

		// Store new
		loadedUrls = newUrls;

		// Mark selected
		weather.$.imgWrap.children().removeClass("selected").filter("[data-url='" + current.item.img_url + "']").addClass("selected");

		function handleItem(item) {
			if (item) {
				newUrls.push(item.img_url);

				// Not loaded
				if (loadedUrls.indexOf(item.img_url) === -1) {
					imgsInsert.push("<div data-url='" + item.img_url + "' style='background-image: url(" + ResolveImg(item.img_url) + ")' />");
				}
			}
		}
	};
})();

var scale = 1; // scale of the image
var scaleLast = 1;
var xLast = 0; // last x location on the screen
var yLast = 0; // last y location on the screen
var xImage = 0; // last x location on the image
var yImage = 0; // last y location on the image
//var pinchType = "slide-images";

function pinchStart() {
	scale = scaleLast;
}

function pinchEnd(e) {
	scale = e.scale;
	console.log(e);
}

function pinch(e) {

	var xScreen = e.center.x - 0;
	var yScreen = e.center.y - 40;

	// find current location on the image at the current scale
	xImage = xImage + (xScreen - xLast) / scaleLast;
	yImage = yImage + (yScreen - yLast) / scaleLast;

	scaleLast = scale * e.scale;

	if (scaleLast < 1) {
		scaleLast = 1;
	} else if (scaleLast > 25) {
		scaleLast = 25;
	}

	// determine the location on the screen at the new scale
	/*var xNew = (xScreen - xImage) / scaleLast;
 var yNew = (yScreen - yImage) / scaleLast;
  if (scaleLast === 1) {
 	xNew = 0;
 	yNew = 0;
 }*/

	// save the current screen location
	xLast = xScreen;
	yLast = yScreen;

	//$img.css({
	//	transform: 'scale(' + scaleLast + ')'
	//});

	//$img.css({
	//	transform: 'scale(' + scaleLast + ') ' + 'translate3d(' + xNew + 'px, ' + yNew + 'px' + ', 0)',
	//	transformOrigin: xImage + 'px ' + yImage + 'px'
	//});

	// http://stackoverflow.com/questions/2916081/zoom-in-on-a-point-using-scale-and-translate
	// http://doctype.com/javascript-image-zoom-css3-transforms-calculate-origin-example
}

function ResolveImg(src, checkStoredImage) {

	if (typeof checkStoredImage === "undefined") {
		checkStoredImage = true;
	}

	// Not online. Use the image in the local storage if not online
	if (!navigator.onLine && checkStoredImage) {
		var lastStored = data.getStoredImage();
		if (lastStored && lastStored.img === src) {
			return lastStored.data;
		} else {
			return "/gfx/no-image.jpg";
		}
	}

	return "http://www.vhsys.no/images/" + src;
}

function GetCurrentIndex() {
	return current.index;
}

function GetMaxIndex() {
	return data.getCurrentLength() - 1;
}

function AtEnd() {
	return current.index === data.getCurrentLength() - 1;
}

module.exports = {
	pageLoad: PageLoad,
	load: Load,
	resolve: ResolveImg,
	pinch: pinch,
	pinchStart: pinchStart,
	pinchEnd: pinchEnd,
	loadSingle: LoadImage,
	getCurrentIndex: GetCurrentIndex,
	getMaxIndex: GetMaxIndex,
	atEnd: AtEnd
};

},{"./data.js":2}],4:[function(require,module,exports){
'use strict';

var image = require('./image.js'),
    chart = require('./chart.js'),
    layout = require('./layout.js'),
    data = require('./data.js');

var current_index;
//var changingImageWithTouch = false;

function init() {
	$(function () {

		// Change section
		weather.onClick(weather.$.header.find("button"), HeaderButtonClick);

		// Change chart types
		weather.onClick(weather.$.chart.find(".types li"), ChangeChartType);

		weather.$.w.resize(function () {
			layout.resized();
			chart.load();
		});

		// Listen for change dates in a bit
		setTimeout(function () {
			weather.$.dateFrom.add(weather.$.dateTo).change(function () {
				weather.setDates({
					from: weather.$.dateFrom.mobiscroll("getDate"),
					to: weather.$.dateTo.mobiscroll("getDate"),
					setDateInputs: false
				});
			});
		}, 1000);
	});

	hammerEvents();
}

function hammerEvents() {

	if (!image) {
		setTimeout(hammerEvents, 25);
		return;
	}

	// Enable hammer on document.body
	//weather.hammerTimeBody = new Hammer(document.body);

	var hammertimeImage = new Hammer.Manager(weather.$.image[0]);

	hammertimeImage.add(new Hammer.Pan({ threshold: 0, pointers: 0 }));
	hammertimeImage.add(new Hammer.Swipe()).recognizeWith(hammertimeImage.get('pan'));
	//hammertimeImage.add(new Hammer.Pinch({ threshold: 0 })).recognizeWith([mc.get('pan'), mc.get('rotate')]);

	hammertimeImage.on("hammer.input", function (e) {
		e.preventDefault();
		clearTimeout(weather.slideOutTimeout);
	});

	// Change snapshot
	weather.lastx = -1;

	hammertimeImage.on("panstart", function (e) {
		if (!ChangeImageIndexFromRangeSlider(e)) {
			current_index = image.getCurrentIndex();
			//changingImageWithTouch = true;
		}
	});

	hammertimeImage.on("pan", function (e) {
		if (!ChangeImageIndexFromRangeSlider(e)) {

			var x = e.pointers[0].pageX;
			if (e.pointers.length === 2) {
				x = e.center.x;
			}

			if (weather.lastx === -1) {
				weather.lastx = x;
			}

			var diff = x - weather.lastx;

			if (Math.abs(diff) >= 5) {

				current_index = image.getCurrentIndex();

				//changing = true;

				if (diff > 0) {
					if (!image.atEnd()) {
						pushImageToDisplay(function () {
							// Move 1 day up
							if (e.pointers.length === 2) {
								image.loadSingle("+1d");
							} else {
								image.loadSingle(current_index + 1);
							}
						});
					}
				} else {
					pushImageToDisplay(function () {

						// Move 1 day down
						if (e.pointers.length === 2) {
							image.loadSingle("-1d");
						} else {
							image.loadSingle(current_index - 1);
						}
					});
				}

				weather.lastx = -1;
			}
		}
	});

	var pushImageToDisplay = (function () {
		var timeout;

		return function (fn) {
			clearTimeout(timeout);
			timeout = setTimeout(fn, 0);
		};
	})();

	hammertimeImage.on("panend", function (e) {
		weather.lastx = -1;

		var duration = 1000,
		    startIndex = image.getCurrentIndex(),
		    changeInIndex = 25 * e.velocityX * -1,
		    decreasing = changeInIndex < 0,
		    timeStart = +new Date();

		if (Math.abs(changeInIndex) > 3) {
			slideNewImage();
		}

		function slideNewImage() {
			var now = +new Date();
			var time = now - timeStart;
			var newIndex = Math.easeOutExpo(time, startIndex, changeInIndex, duration);

			newIndex = decreasing ? Math.floor(newIndex) : Math.ceil(newIndex);

			image.loadSingle(newIndex);

			if (time < duration) {
				weather.slideOutTimeout = setTimeout(slideNewImage, 25);
			}
		}
	});

	// Zoom
	//hammertimeImage.on("pinchstart", image.pinchStart);
	//hammertimeImage.on("pinch", image.pinch);
	//hammertimeImage.on("pinchEnd", image.pinchEnd);
}

// Switch active section
function HeaderButtonClick() {
	var $btn = $(this);
	if (!$btn.hasClass("selected")) {

		switch ($btn.data("action")) {
			case "camera":
				weather.$.sections.removeClass("show-chart");
				$btn.addClass("selected").siblings().removeClass("selected");
				break;
			case "charts":
				weather.$.sections.addClass("show-chart");
				$btn.addClass("selected").siblings().removeClass("selected");
				break;
			case "refresh":
				weather.refresh({
					forceGetFromApi: true
				});
				break;
		}
	}
}

function ChangeImageIndexFromRangeSlider(e) {
	var $target = $(e.target);
	var x = Math.floor(e.pointers[0].pageX);

	if ($target.closest(weather.$.rangeWrap).length > 0) {

		var rangeWidth = weather.vw - 32.5 * 2;
		var rangeMargin = Math.ceil((weather.vw - rangeWidth) / 2);

		var pctX = (x - rangeMargin) / rangeWidth;
		if (pctX < 0) {
			pctX = 0;
		}
		if (pctX > 100) {
			pctX = 100;
		}

		var length = data.getCurrentLength();
		var index = length * pctX;

		image.loadSingle(index);

		return true;
	}

	return false;
}

// Switch active chart
function ChangeChartType() {
	var $btn = $(this);
	$btn.addClass("selected").siblings().removeClass("selected");
	setTimeout(function () {
		chart.load($btn.data("type"));
	}, 25);
}

module.exports = {
	init: init
};

},{"./chart.js":1,"./data.js":2,"./image.js":3,"./layout.js":5}],5:[function(require,module,exports){
"use strict";

function resize() {
	window.scrollTo(0, 0);

	weather.vw = weather.$.w.width();
	weather.vh = window.innerHeight || weather.$.w.innerHeight();

	if (window.navigator.standalone) {
		weather.vh -= 20;
	}

	var heightImageHeader = 51;
	var heightImageRange = 45;
	var heightChartButtons = 70;
	var contentHeight = weather.vh - 50;

	// Set heights
	if (window.navigator.standalone) {
		weather.$.app.height(weather.vh + 20);
	} else {
		weather.$.app.height(weather.vh);
	}
	weather.$.sections.height(contentHeight);

	// Set height for image section
	weather.$.image.height(contentHeight);
	weather.$.imgWrap.height(contentHeight - heightImageHeader - heightImageRange);

	weather.$.chart.height(contentHeight);
	weather.$.chartContainer.height(contentHeight - heightChartButtons);

	if (!weather.firstResize) {
		weather.firstResize = weather.now();
	}
}

module.exports = {
	resized: function resized() {
		clearTimeout(weather.resizeTimeout);
		weather.resizeTimeout = setTimeout(resize, 50);
	}
};

},{}],6:[function(require,module,exports){
'use strict';

var data = require('./data.js'),
    image = require('./image.js'),
    chart = require('./chart.js'),
    layout = require('./layout.js'),
    settings = require('./settings.js'),
    interactions = require('./interactions.js');

// Default to not online if not set
if (typeof navigator.onLine === 'undefined') {
	navigator.onLine = false;
}

window.weather = (function () {

	// Make sure there is a place set
	var hrefParts = location.href.split("/");
	var hrefPartLast = hrefParts[hrefParts.length - 1];
	if (hrefPartLast.length === 0 && hrefPartLast !== "dev.html") {
		var div = document.createElement("div");
		div.className = "no-place-set";
		div.innerHTML = "<div class='logo'></div><h1>værhøna.no/[din-værhøne]</h1><div class='sub'>Skriv inn navnet på værhøna i adressefeltet</div>";
		document.body.appendChild(div);
		return;
	}

	// Stores current items
	var current = {
		items: [],
		items_index: 0
	};

	if (window.navigator.standalone) {
		$("html").addClass("standalone");
	}

	// Handle cache
	//StartCacheControl();

	var blockingMessage = (function () {

		var $blockMsgImage = undefined,
		    $blockMsgChart = undefined;

		function show(message) {
			if (!$blockMsgImage) {
				var template = '<div class=\'section-block-message\'>' + message + '</div>';
				$blockMsgImage = $(template);
				$blockMsgChart = $(template);
				weather.$.image.append($blockMsgImage);
				weather.$.chart.append($blockMsgChart);
			} else {
				$blockMsgImage.html(message);
				$blockMsgChart.html(message);
			}

			weather.$.image.toggleClass("section-blocked", true);
			weather.$.chart.toggleClass("section-blocked", true);
		}

		function hide() {
			weather.$.image.find(".section-block").remove();
			weather.$.chart.find(".section-block").remove();

			weather.$.image.toggleClass("section-blocked", false);
			weather.$.chart.toggleClass("section-blocked", false);
		}

		return {
			show: show,
			hide: hide
		};
	})();

	// Init
	function startApp() {
		if (window.weather && layout) {

			setTitle(settings.place);

			CacheObjects();

			layout.resized();

			interactions.init();

			image.pageLoad();

			SetDates({
				from: Now(-3),
				to: Now()
			});

			// Remove loader
			var $loader = $("#app-loader");
			$loader.css({ opacity: 0 });

			setTimeout(function () {
				$loader.remove();
			}, 500);
		} else {
			setTimeout(startApp, 50);
		}
	}

	function setTitle(title) {
		title = firstUpper(title);

		var $head = $("head"),
		    $appTitle;

		$head.find("title").html(title);

		$appTitle = $head.find("[name='apple-mobile-web-app-title']");
		if ($appTitle.length > 0) {
			$appTitle[0].content = title;
		}
	}

	startApp();

	/*function StartCacheControl () {
 	var appCache = window.applicationCache;
 		// Bind listener
 	appCache.addEventListener('updateready', CheckStatus, false);
 		CheckStatus();
 		function CheckStatus () {
 		if (appCache.status === appCache.UPDATEREADY) {
 		  // Don't prompt user. Maybe do like Chrome does and indicate the new version in a settings page?
 	      if (confirm('En ny versjon av værstasjonen er klar. Vil du hente den nå?')) {
 	        window.location.reload();
 	      }
 	    }
 	}
 }*/

	function CacheObjects() {

		weather.$ = weather.$ || {};

		$.extend(weather.$, {
			w: $(window),
			app: $("#app"),
			header: $("#site-header"),
			dateFrom: $("#date-from"),
			dateTo: $("#date-to"),
			rangeWrap: $("#range-wrap"),
			rangeKw: $("#range-kw"),
			range: $("#range"),
			chartTemperature: $("#chart-temperature"),
			chartHumidity: $("#chart-humidity"),
			chartPressure: $("#chart-pressure"),
			sections: $("#sections"),
			image: $("#image"),
			imgWrap: $("#img-wrap"),
			imgDate: $("#img-date"),
			imgWeather: $("#img-weather"),
			chart: $("#chart"),
			chartContainer: $("#chart-canvas-container")
		});
	}

	function BindMobiScroll(opt) {

		weather.$.dateFrom.mobiscroll("destroy");
		weather.$.dateFrom.mobiscroll().date({
			lang: "no",
			dateFormat: "d/m/y",
			dateOrder: "D ddMMyy",
			maxDate: opt.to,
			minDate: opt.fromMin
		});

		weather.$.dateTo.mobiscroll("destroy");
		weather.$.dateTo.mobiscroll().date({
			lang: "no",
			dateFormat: "d/m/y",
			dateOrder: "D ddMMyy",
			minDate: opt.from
		});
	}

	function SetMinimumDate(date) {
		BindMobiScroll({
			from: weather.$.dateFrom.mobiscroll("getDate"),
			to: weather.$.dateTo.mobiscroll("getDate"),
			fromMin: date
		});
	}

	// Check if given date is the todays date
	function isToday(date) {
		var now = Now();

		return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate();
	}

	function needsUpdate() {

		if (!weather.onToday) {
			return false;
		}

		var now = Now();
		var now_raw = new Date();

		now.setHours(now_raw.getHours());

		return now > weather.to;
	}

	// Date helper
	function Now(addDays) {
		var now = new Date();
		now.setHours(0);
		now.setMinutes(0);
		now.setSeconds(0);
		now.setMilliseconds(0);

		if (addDays) {
			now.setDate(now.getDate() + addDays);
		}

		return now;
	}

	function GetCurrent() {
		return current;
	}

	// Set the from and to date and update data
	function SetDates(options) {

		if (typeof options.setDateInputs === "undefined") {
			options.setDateInputs = true;
		}

		BindMobiScroll({
			from: options.from,
			to: options.to
		});

		var deferred = $.Deferred();

		if (options.setDateInputs) {
			weather.$.dateFrom.mobiscroll("setDate", options.from, true);
			weather.$.dateTo.mobiscroll("setDate", options.to, true);
		}

		// Check if the to date is today
		weather.onToday = isToday(options.to);

		if (weather.onToday) {
			var now = new Date();
			options.to.setHours(now.getHours());
			options.to.setMinutes(now.getMinutes());
		}

		// Store current
		weather.from = options.from;
		weather.to = options.to;

		var getOptions = {
			from: options.from,
			to: options.to,
			forceGetFromApi: options.forceGetFromApi
		};

		// Get data and update image and chart
		data.get(getOptions).then(function (snapshots) {

			if (snapshots.length === 0) {
				blockingMessage.show("Ingen værdata registrert i perioden <span class='dates'>" + PrettyDate(options.from, "no-time") + " til " + PrettyDate(options.to, "no-time") + "</span>");
			} else {
				blockingMessage.hide();

				image.load();

				// Wait some before loading charts
				setTimeout(chart.load, 500);

				if (options.moveToEnd) {
					var index = image.getMaxIndex();
					image.loadSingle(index);
				}
			}

			deferred.resolve();

			trackPageView();
		});

		return deferred;
	}

	function refresh(options) {

		options = options || {};

		// Show loading indication
		weather.loading();

		// Wait for a bit before actually getting new data.
		// It is important to show some loading indication to the user
		setTimeout(function () {
			var from = weather.$.dateFrom.mobiscroll("getDate"),
			    to = weather.$.dateTo.mobiscroll("getDate");

			if (weather.onToday && !isToday(to)) {
				SetDates({
					from: from,
					to: Now(),
					setDateInputs: true,
					moveToEnd: image.atEnd(),
					forceGetFromApi: options.forceGetFromApi
				});
				return;
			}

			SetDates({
				from: from,
				to: to,
				setDateInputs: false,
				moveToEnd: image.atEnd(),
				forceGetFromApi: options.forceGetFromApi
			});
		}, 500);
	}

	// Handle document focus
	(function () {
		var hasFocus = document.hasFocus();

		setInterval(checkDocumentFocus, 500);

		function checkDocumentFocus() {
			var focus = document.hasFocus();

			// Refresh if regaining focus
			if (!hasFocus && focus) {

				// Last refresh must be more than 1 minute old
				if (needsUpdate()) {
					refresh();
				}
			}

			hasFocus = focus;
		}

		return {
			checkDocumentFocus: checkDocumentFocus
		};
	})();

	// Pads number with given digits
	function EnsureDigits(num, digits) {
		num = num.toString();
		var incr = digits - num.length;
		for (var i = 0; i < incr; i++) {
			num = "0" + num;
		}
		return num;
	}

	// Returns a pretty date string from date
	function PrettyDate(date, format) {

		var weekDays = ["Søndag", "Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag"];
		var weekDays_short = ["Sø.", "Ma.", "Ti.", "On.", "To.", "Fr.", "Lø."];
		var months = ["Januar", "Februar", "Mars", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Desember"];
		var months_short = ["Jan.", "Feb.", "Mar.", "Apr.", "Mai", "Juni", "Juli", "Aug.", "Sep.", "Okt.", "Nov.", "Des."];

		format = format || "full";

		if (format === "short") {
			weekDays = weekDays_short;
			months = months_short;
		}

		var day = weekDays[date.getDay()] + " " + date.getDate() + ". " + months[date.getMonth()].toLowerCase() + " " + date.getFullYear();
		var time = Time(date);

		if (format === "no-time") {
			return day;
		}

		return day + " <span>" + time + "</span>";
	}

	// Returns a short date string from date
	function ShortDate(dt) {
		var year = dt.getFullYear().toString();
		return dt.getDate() + "/" + (dt.getMonth() + 1) + "/" + year[2].toString() + year[3].toString();
	}

	function ShortDateTime(date) {
		return ShortDate(date) + " <span>" + Time(date) + "</span>";
	}

	function Time(date, seconds) {
		var timePart = EnsureDigits(date.getHours(), 2) + ":" + EnsureDigits(date.getMinutes(), 2);

		if (seconds) {
			return timePart + ":" + EnsureDigits(date.getSeconds(), 2);
		}

		return timePart;
	}

	// Shorthand for better click
	function OnClick($el, fn) {
		$el.each(function () {
			var $this = $(this);
			var hm = new Hammer(this);

			hm.get("press").set({
				time: 1,
				threshold: 100
			});

			hm.on("press", function (e) {
				fn.call($this[0], e);
			});

			$this.click(prevDef);
		});
	}

	function prevDef(e) {
		e.preventDefault();
	}

	function loading(hide) {
		var $btn = weather.$.header.find(".ico[data-action='refresh']");

		if (hide === false) {
			$btn.removeClass("spin");
		} else {
			$btn.addClass("spin");
		}
	}

	function firstUpper(str) {
		if (!str || str.length < 1) {
			return str;
		}

		var first = str[0].toUpperCase();

		return first + str.substr(1);
	}

	// Track page view
	function trackPageView() {

		if (!weather.addedGA) {
			weather.addedGA = +new Date();

			insertGA();

			ga('create', 'UA-61711833-1', 'auto');
		}

		ga('send', 'pageview');
	}

	return {
		now: Now,
		onClick: OnClick,
		setDates: SetDates,
		shortDate: ShortDate,
		shortDateTime: ShortDateTime,
		prettyDate: PrettyDate,
		setMinimumDate: SetMinimumDate,
		time: Time,
		ensureDigits: EnsureDigits,
		getCurrent: GetCurrent,
		loading: loading,
		needsUpdate: needsUpdate,
		$: {},
		imageWidth: 640,
		imageHeight: 480,
		refresh: refresh
	};
})();

},{"./chart.js":1,"./data.js":2,"./image.js":3,"./interactions.js":4,"./layout.js":5,"./settings.js":7}],7:[function(require,module,exports){
"use strict";

module.exports = (function () {

	// App settings
	var settings_default = {
		localStorageKey: "vhsys",
		place: false,
		appVersion: 2
	};

	// Todo: get from localstorage
	var settings = settings_default;
	//if (!settings.appVersion) {
	//	localStorage.clear();
	//}

	// Get place name
	var locationParts = window.location.href.split("/");
	if (locationParts.length > 1) {
		settings.place = locationParts[locationParts.length - 1];
	}

	if (settings.place.indexOf("dev.html") !== -1) {
		settings.place = "buvassbrenna";
	}

	// Set to false if it is empty
	settings.place = settings.place.length > 0 ? settings.place : false;

	return settings;
})();

},{}],8:[function(require,module,exports){
/*!
 * imagesLoaded v3.1.8
 * JavaScript is all like "You images are done yet or what?"
 * MIT License
 */

( function( window, factory ) { 'use strict';
  // universal module definition

  /*global define: false, module: false, require: false */

  if ( typeof define === 'function' && define.amd ) {
    // AMD
    define( [
      'eventEmitter/EventEmitter',
      'eventie/eventie'
    ], function( EventEmitter, eventie ) {
      return factory( window, EventEmitter, eventie );
    });
  } else if ( typeof exports === 'object' ) {
    // CommonJS
    module.exports = factory(
      window,
      require('wolfy87-eventemitter'),
      require('eventie')
    );
  } else {
    // browser global
    window.imagesLoaded = factory(
      window,
      window.EventEmitter,
      window.eventie
    );
  }

})( window,

// --------------------------  factory -------------------------- //

function factory( window, EventEmitter, eventie ) {

'use strict';

var $ = window.jQuery;
var console = window.console;
var hasConsole = typeof console !== 'undefined';

// -------------------------- helpers -------------------------- //

// extend objects
function extend( a, b ) {
  for ( var prop in b ) {
    a[ prop ] = b[ prop ];
  }
  return a;
}

var objToString = Object.prototype.toString;
function isArray( obj ) {
  return objToString.call( obj ) === '[object Array]';
}

// turn element or nodeList into an array
function makeArray( obj ) {
  var ary = [];
  if ( isArray( obj ) ) {
    // use object if already an array
    ary = obj;
  } else if ( typeof obj.length === 'number' ) {
    // convert nodeList to array
    for ( var i=0, len = obj.length; i < len; i++ ) {
      ary.push( obj[i] );
    }
  } else {
    // array of single index
    ary.push( obj );
  }
  return ary;
}

  // -------------------------- imagesLoaded -------------------------- //

  /**
   * @param {Array, Element, NodeList, String} elem
   * @param {Object or Function} options - if function, use as callback
   * @param {Function} onAlways - callback function
   */
  function ImagesLoaded( elem, options, onAlways ) {
    // coerce ImagesLoaded() without new, to be new ImagesLoaded()
    if ( !( this instanceof ImagesLoaded ) ) {
      return new ImagesLoaded( elem, options );
    }
    // use elem as selector string
    if ( typeof elem === 'string' ) {
      elem = document.querySelectorAll( elem );
    }

    this.elements = makeArray( elem );
    this.options = extend( {}, this.options );

    if ( typeof options === 'function' ) {
      onAlways = options;
    } else {
      extend( this.options, options );
    }

    if ( onAlways ) {
      this.on( 'always', onAlways );
    }

    this.getImages();

    if ( $ ) {
      // add jQuery Deferred object
      this.jqDeferred = new $.Deferred();
    }

    // HACK check async to allow time to bind listeners
    var _this = this;
    setTimeout( function() {
      _this.check();
    });
  }

  ImagesLoaded.prototype = new EventEmitter();

  ImagesLoaded.prototype.options = {};

  ImagesLoaded.prototype.getImages = function() {
    this.images = [];

    // filter & find items if we have an item selector
    for ( var i=0, len = this.elements.length; i < len; i++ ) {
      var elem = this.elements[i];
      // filter siblings
      if ( elem.nodeName === 'IMG' ) {
        this.addImage( elem );
      }
      // find children
      // no non-element nodes, #143
      var nodeType = elem.nodeType;
      if ( !nodeType || !( nodeType === 1 || nodeType === 9 || nodeType === 11 ) ) {
        continue;
      }
      var childElems = elem.querySelectorAll('img');
      // concat childElems to filterFound array
      for ( var j=0, jLen = childElems.length; j < jLen; j++ ) {
        var img = childElems[j];
        this.addImage( img );
      }
    }
  };

  /**
   * @param {Image} img
   */
  ImagesLoaded.prototype.addImage = function( img ) {
    var loadingImage = new LoadingImage( img );
    this.images.push( loadingImage );
  };

  ImagesLoaded.prototype.check = function() {
    var _this = this;
    var checkedCount = 0;
    var length = this.images.length;
    this.hasAnyBroken = false;
    // complete if no images
    if ( !length ) {
      this.complete();
      return;
    }

    function onConfirm( image, message ) {
      if ( _this.options.debug && hasConsole ) {
        console.log( 'confirm', image, message );
      }

      _this.progress( image );
      checkedCount++;
      if ( checkedCount === length ) {
        _this.complete();
      }
      return true; // bind once
    }

    for ( var i=0; i < length; i++ ) {
      var loadingImage = this.images[i];
      loadingImage.on( 'confirm', onConfirm );
      loadingImage.check();
    }
  };

  ImagesLoaded.prototype.progress = function( image ) {
    this.hasAnyBroken = this.hasAnyBroken || !image.isLoaded;
    // HACK - Chrome triggers event before object properties have changed. #83
    var _this = this;
    setTimeout( function() {
      _this.emit( 'progress', _this, image );
      if ( _this.jqDeferred && _this.jqDeferred.notify ) {
        _this.jqDeferred.notify( _this, image );
      }
    });
  };

  ImagesLoaded.prototype.complete = function() {
    var eventName = this.hasAnyBroken ? 'fail' : 'done';
    this.isComplete = true;
    var _this = this;
    // HACK - another setTimeout so that confirm happens after progress
    setTimeout( function() {
      _this.emit( eventName, _this );
      _this.emit( 'always', _this );
      if ( _this.jqDeferred ) {
        var jqMethod = _this.hasAnyBroken ? 'reject' : 'resolve';
        _this.jqDeferred[ jqMethod ]( _this );
      }
    });
  };

  // -------------------------- jquery -------------------------- //

  if ( $ ) {
    $.fn.imagesLoaded = function( options, callback ) {
      var instance = new ImagesLoaded( this, options, callback );
      return instance.jqDeferred.promise( $(this) );
    };
  }


  // --------------------------  -------------------------- //

  function LoadingImage( img ) {
    this.img = img;
  }

  LoadingImage.prototype = new EventEmitter();

  LoadingImage.prototype.check = function() {
    // first check cached any previous images that have same src
    var resource = cache[ this.img.src ] || new Resource( this.img.src );
    if ( resource.isConfirmed ) {
      this.confirm( resource.isLoaded, 'cached was confirmed' );
      return;
    }

    // If complete is true and browser supports natural sizes,
    // try to check for image status manually.
    if ( this.img.complete && this.img.naturalWidth !== undefined ) {
      // report based on naturalWidth
      this.confirm( this.img.naturalWidth !== 0, 'naturalWidth' );
      return;
    }

    // If none of the checks above matched, simulate loading on detached element.
    var _this = this;
    resource.on( 'confirm', function( resrc, message ) {
      _this.confirm( resrc.isLoaded, message );
      return true;
    });

    resource.check();
  };

  LoadingImage.prototype.confirm = function( isLoaded, message ) {
    this.isLoaded = isLoaded;
    this.emit( 'confirm', this, message );
  };

  // -------------------------- Resource -------------------------- //

  // Resource checks each src, only once
  // separate class from LoadingImage to prevent memory leaks. See #115

  var cache = {};

  function Resource( src ) {
    this.src = src;
    // add to cache
    cache[ src ] = this;
  }

  Resource.prototype = new EventEmitter();

  Resource.prototype.check = function() {
    // only trigger checking once
    if ( this.isChecked ) {
      return;
    }
    // simulate loading on detached element
    var proxyImage = new Image();
    eventie.bind( proxyImage, 'load', this );
    eventie.bind( proxyImage, 'error', this );
    proxyImage.src = this.src;
    // set flag
    this.isChecked = true;
  };

  // ----- events ----- //

  // trigger specified handler for event type
  Resource.prototype.handleEvent = function( event ) {
    var method = 'on' + event.type;
    if ( this[ method ] ) {
      this[ method ]( event );
    }
  };

  Resource.prototype.onload = function( event ) {
    this.confirm( true, 'onload' );
    this.unbindProxyEvents( event );
  };

  Resource.prototype.onerror = function( event ) {
    this.confirm( false, 'onerror' );
    this.unbindProxyEvents( event );
  };

  // ----- confirm ----- //

  Resource.prototype.confirm = function( isLoaded, message ) {
    this.isConfirmed = true;
    this.isLoaded = isLoaded;
    this.emit( 'confirm', this, message );
  };

  Resource.prototype.unbindProxyEvents = function( event ) {
    eventie.unbind( event.target, 'load', this );
    eventie.unbind( event.target, 'error', this );
  };

  // -----  ----- //

  return ImagesLoaded;

});

},{"eventie":9,"wolfy87-eventemitter":10}],9:[function(require,module,exports){
/*!
 * eventie v1.0.6
 * event binding helper
 *   eventie.bind( elem, 'click', myFn )
 *   eventie.unbind( elem, 'click', myFn )
 * MIT license
 */

/*jshint browser: true, undef: true, unused: true */
/*global define: false, module: false */

( function( window ) {

'use strict';

var docElem = document.documentElement;

var bind = function() {};

function getIEEvent( obj ) {
  var event = window.event;
  // add event.target
  event.target = event.target || event.srcElement || obj;
  return event;
}

if ( docElem.addEventListener ) {
  bind = function( obj, type, fn ) {
    obj.addEventListener( type, fn, false );
  };
} else if ( docElem.attachEvent ) {
  bind = function( obj, type, fn ) {
    obj[ type + fn ] = fn.handleEvent ?
      function() {
        var event = getIEEvent( obj );
        fn.handleEvent.call( fn, event );
      } :
      function() {
        var event = getIEEvent( obj );
        fn.call( obj, event );
      };
    obj.attachEvent( "on" + type, obj[ type + fn ] );
  };
}

var unbind = function() {};

if ( docElem.removeEventListener ) {
  unbind = function( obj, type, fn ) {
    obj.removeEventListener( type, fn, false );
  };
} else if ( docElem.detachEvent ) {
  unbind = function( obj, type, fn ) {
    obj.detachEvent( "on" + type, obj[ type + fn ] );
    try {
      delete obj[ type + fn ];
    } catch ( err ) {
      // can't delete window object properties
      obj[ type + fn ] = undefined;
    }
  };
}

var eventie = {
  bind: bind,
  unbind: unbind
};

// ----- module definition ----- //

if ( typeof define === 'function' && define.amd ) {
  // AMD
  define( eventie );
} else if ( typeof exports === 'object' ) {
  // CommonJS
  module.exports = eventie;
} else {
  // browser global
  window.eventie = eventie;
}

})( window );

},{}],10:[function(require,module,exports){
/*!
 * EventEmitter v4.2.11 - git.io/ee
 * Unlicense - http://unlicense.org/
 * Oliver Caldwell - http://oli.me.uk/
 * @preserve
 */

;(function () {
    'use strict';

    /**
     * Class for managing events.
     * Can be extended to provide event functionality in other classes.
     *
     * @class EventEmitter Manages event registering and emitting.
     */
    function EventEmitter() {}

    // Shortcuts to improve speed and size
    var proto = EventEmitter.prototype;
    var exports = this;
    var originalGlobalValue = exports.EventEmitter;

    /**
     * Finds the index of the listener for the event in its storage array.
     *
     * @param {Function[]} listeners Array of listeners to search through.
     * @param {Function} listener Method to look for.
     * @return {Number} Index of the specified listener, -1 if not found
     * @api private
     */
    function indexOfListener(listeners, listener) {
        var i = listeners.length;
        while (i--) {
            if (listeners[i].listener === listener) {
                return i;
            }
        }

        return -1;
    }

    /**
     * Alias a method while keeping the context correct, to allow for overwriting of target method.
     *
     * @param {String} name The name of the target method.
     * @return {Function} The aliased method
     * @api private
     */
    function alias(name) {
        return function aliasClosure() {
            return this[name].apply(this, arguments);
        };
    }

    /**
     * Returns the listener array for the specified event.
     * Will initialise the event object and listener arrays if required.
     * Will return an object if you use a regex search. The object contains keys for each matched event. So /ba[rz]/ might return an object containing bar and baz. But only if you have either defined them with defineEvent or added some listeners to them.
     * Each property in the object response is an array of listener functions.
     *
     * @param {String|RegExp} evt Name of the event to return the listeners from.
     * @return {Function[]|Object} All listener functions for the event.
     */
    proto.getListeners = function getListeners(evt) {
        var events = this._getEvents();
        var response;
        var key;

        // Return a concatenated array of all matching events if
        // the selector is a regular expression.
        if (evt instanceof RegExp) {
            response = {};
            for (key in events) {
                if (events.hasOwnProperty(key) && evt.test(key)) {
                    response[key] = events[key];
                }
            }
        }
        else {
            response = events[evt] || (events[evt] = []);
        }

        return response;
    };

    /**
     * Takes a list of listener objects and flattens it into a list of listener functions.
     *
     * @param {Object[]} listeners Raw listener objects.
     * @return {Function[]} Just the listener functions.
     */
    proto.flattenListeners = function flattenListeners(listeners) {
        var flatListeners = [];
        var i;

        for (i = 0; i < listeners.length; i += 1) {
            flatListeners.push(listeners[i].listener);
        }

        return flatListeners;
    };

    /**
     * Fetches the requested listeners via getListeners but will always return the results inside an object. This is mainly for internal use but others may find it useful.
     *
     * @param {String|RegExp} evt Name of the event to return the listeners from.
     * @return {Object} All listener functions for an event in an object.
     */
    proto.getListenersAsObject = function getListenersAsObject(evt) {
        var listeners = this.getListeners(evt);
        var response;

        if (listeners instanceof Array) {
            response = {};
            response[evt] = listeners;
        }

        return response || listeners;
    };

    /**
     * Adds a listener function to the specified event.
     * The listener will not be added if it is a duplicate.
     * If the listener returns true then it will be removed after it is called.
     * If you pass a regular expression as the event name then the listener will be added to all events that match it.
     *
     * @param {String|RegExp} evt Name of the event to attach the listener to.
     * @param {Function} listener Method to be called when the event is emitted. If the function returns true then it will be removed after calling.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.addListener = function addListener(evt, listener) {
        var listeners = this.getListenersAsObject(evt);
        var listenerIsWrapped = typeof listener === 'object';
        var key;

        for (key in listeners) {
            if (listeners.hasOwnProperty(key) && indexOfListener(listeners[key], listener) === -1) {
                listeners[key].push(listenerIsWrapped ? listener : {
                    listener: listener,
                    once: false
                });
            }
        }

        return this;
    };

    /**
     * Alias of addListener
     */
    proto.on = alias('addListener');

    /**
     * Semi-alias of addListener. It will add a listener that will be
     * automatically removed after its first execution.
     *
     * @param {String|RegExp} evt Name of the event to attach the listener to.
     * @param {Function} listener Method to be called when the event is emitted. If the function returns true then it will be removed after calling.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.addOnceListener = function addOnceListener(evt, listener) {
        return this.addListener(evt, {
            listener: listener,
            once: true
        });
    };

    /**
     * Alias of addOnceListener.
     */
    proto.once = alias('addOnceListener');

    /**
     * Defines an event name. This is required if you want to use a regex to add a listener to multiple events at once. If you don't do this then how do you expect it to know what event to add to? Should it just add to every possible match for a regex? No. That is scary and bad.
     * You need to tell it what event names should be matched by a regex.
     *
     * @param {String} evt Name of the event to create.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.defineEvent = function defineEvent(evt) {
        this.getListeners(evt);
        return this;
    };

    /**
     * Uses defineEvent to define multiple events.
     *
     * @param {String[]} evts An array of event names to define.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.defineEvents = function defineEvents(evts) {
        for (var i = 0; i < evts.length; i += 1) {
            this.defineEvent(evts[i]);
        }
        return this;
    };

    /**
     * Removes a listener function from the specified event.
     * When passed a regular expression as the event name, it will remove the listener from all events that match it.
     *
     * @param {String|RegExp} evt Name of the event to remove the listener from.
     * @param {Function} listener Method to remove from the event.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.removeListener = function removeListener(evt, listener) {
        var listeners = this.getListenersAsObject(evt);
        var index;
        var key;

        for (key in listeners) {
            if (listeners.hasOwnProperty(key)) {
                index = indexOfListener(listeners[key], listener);

                if (index !== -1) {
                    listeners[key].splice(index, 1);
                }
            }
        }

        return this;
    };

    /**
     * Alias of removeListener
     */
    proto.off = alias('removeListener');

    /**
     * Adds listeners in bulk using the manipulateListeners method.
     * If you pass an object as the second argument you can add to multiple events at once. The object should contain key value pairs of events and listeners or listener arrays. You can also pass it an event name and an array of listeners to be added.
     * You can also pass it a regular expression to add the array of listeners to all events that match it.
     * Yeah, this function does quite a bit. That's probably a bad thing.
     *
     * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to add to multiple events at once.
     * @param {Function[]} [listeners] An optional array of listener functions to add.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.addListeners = function addListeners(evt, listeners) {
        // Pass through to manipulateListeners
        return this.manipulateListeners(false, evt, listeners);
    };

    /**
     * Removes listeners in bulk using the manipulateListeners method.
     * If you pass an object as the second argument you can remove from multiple events at once. The object should contain key value pairs of events and listeners or listener arrays.
     * You can also pass it an event name and an array of listeners to be removed.
     * You can also pass it a regular expression to remove the listeners from all events that match it.
     *
     * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to remove from multiple events at once.
     * @param {Function[]} [listeners] An optional array of listener functions to remove.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.removeListeners = function removeListeners(evt, listeners) {
        // Pass through to manipulateListeners
        return this.manipulateListeners(true, evt, listeners);
    };

    /**
     * Edits listeners in bulk. The addListeners and removeListeners methods both use this to do their job. You should really use those instead, this is a little lower level.
     * The first argument will determine if the listeners are removed (true) or added (false).
     * If you pass an object as the second argument you can add/remove from multiple events at once. The object should contain key value pairs of events and listeners or listener arrays.
     * You can also pass it an event name and an array of listeners to be added/removed.
     * You can also pass it a regular expression to manipulate the listeners of all events that match it.
     *
     * @param {Boolean} remove True if you want to remove listeners, false if you want to add.
     * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to add/remove from multiple events at once.
     * @param {Function[]} [listeners] An optional array of listener functions to add/remove.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.manipulateListeners = function manipulateListeners(remove, evt, listeners) {
        var i;
        var value;
        var single = remove ? this.removeListener : this.addListener;
        var multiple = remove ? this.removeListeners : this.addListeners;

        // If evt is an object then pass each of its properties to this method
        if (typeof evt === 'object' && !(evt instanceof RegExp)) {
            for (i in evt) {
                if (evt.hasOwnProperty(i) && (value = evt[i])) {
                    // Pass the single listener straight through to the singular method
                    if (typeof value === 'function') {
                        single.call(this, i, value);
                    }
                    else {
                        // Otherwise pass back to the multiple function
                        multiple.call(this, i, value);
                    }
                }
            }
        }
        else {
            // So evt must be a string
            // And listeners must be an array of listeners
            // Loop over it and pass each one to the multiple method
            i = listeners.length;
            while (i--) {
                single.call(this, evt, listeners[i]);
            }
        }

        return this;
    };

    /**
     * Removes all listeners from a specified event.
     * If you do not specify an event then all listeners will be removed.
     * That means every event will be emptied.
     * You can also pass a regex to remove all events that match it.
     *
     * @param {String|RegExp} [evt] Optional name of the event to remove all listeners for. Will remove from every event if not passed.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.removeEvent = function removeEvent(evt) {
        var type = typeof evt;
        var events = this._getEvents();
        var key;

        // Remove different things depending on the state of evt
        if (type === 'string') {
            // Remove all listeners for the specified event
            delete events[evt];
        }
        else if (evt instanceof RegExp) {
            // Remove all events matching the regex.
            for (key in events) {
                if (events.hasOwnProperty(key) && evt.test(key)) {
                    delete events[key];
                }
            }
        }
        else {
            // Remove all listeners in all events
            delete this._events;
        }

        return this;
    };

    /**
     * Alias of removeEvent.
     *
     * Added to mirror the node API.
     */
    proto.removeAllListeners = alias('removeEvent');

    /**
     * Emits an event of your choice.
     * When emitted, every listener attached to that event will be executed.
     * If you pass the optional argument array then those arguments will be passed to every listener upon execution.
     * Because it uses `apply`, your array of arguments will be passed as if you wrote them out separately.
     * So they will not arrive within the array on the other side, they will be separate.
     * You can also pass a regular expression to emit to all events that match it.
     *
     * @param {String|RegExp} evt Name of the event to emit and execute listeners for.
     * @param {Array} [args] Optional array of arguments to be passed to each listener.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.emitEvent = function emitEvent(evt, args) {
        var listeners = this.getListenersAsObject(evt);
        var listener;
        var i;
        var key;
        var response;

        for (key in listeners) {
            if (listeners.hasOwnProperty(key)) {
                i = listeners[key].length;

                while (i--) {
                    // If the listener returns true then it shall be removed from the event
                    // The function is executed either with a basic call or an apply if there is an args array
                    listener = listeners[key][i];

                    if (listener.once === true) {
                        this.removeListener(evt, listener.listener);
                    }

                    response = listener.listener.apply(this, args || []);

                    if (response === this._getOnceReturnValue()) {
                        this.removeListener(evt, listener.listener);
                    }
                }
            }
        }

        return this;
    };

    /**
     * Alias of emitEvent
     */
    proto.trigger = alias('emitEvent');

    /**
     * Subtly different from emitEvent in that it will pass its arguments on to the listeners, as opposed to taking a single array of arguments to pass on.
     * As with emitEvent, you can pass a regex in place of the event name to emit to all events that match it.
     *
     * @param {String|RegExp} evt Name of the event to emit and execute listeners for.
     * @param {...*} Optional additional arguments to be passed to each listener.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.emit = function emit(evt) {
        var args = Array.prototype.slice.call(arguments, 1);
        return this.emitEvent(evt, args);
    };

    /**
     * Sets the current value to check against when executing listeners. If a
     * listeners return value matches the one set here then it will be removed
     * after execution. This value defaults to true.
     *
     * @param {*} value The new value to check for when executing listeners.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.setOnceReturnValue = function setOnceReturnValue(value) {
        this._onceReturnValue = value;
        return this;
    };

    /**
     * Fetches the current value to check against when executing listeners. If
     * the listeners return value matches this one then it should be removed
     * automatically. It will return true by default.
     *
     * @return {*|Boolean} The current value to check for or the default, true.
     * @api private
     */
    proto._getOnceReturnValue = function _getOnceReturnValue() {
        if (this.hasOwnProperty('_onceReturnValue')) {
            return this._onceReturnValue;
        }
        else {
            return true;
        }
    };

    /**
     * Fetches the events object and creates one if required.
     *
     * @return {Object} The events storage object.
     * @api private
     */
    proto._getEvents = function _getEvents() {
        return this._events || (this._events = {});
    };

    /**
     * Reverts the global {@link EventEmitter} to its previous value and returns a reference to this version.
     *
     * @return {Function} Non conflicting EventEmitter class.
     */
    EventEmitter.noConflict = function noConflict() {
        exports.EventEmitter = originalGlobalValue;
        return EventEmitter;
    };

    // Expose the class either via AMD, CommonJS or the global object
    if (typeof define === 'function' && define.amd) {
        define(function () {
            return EventEmitter;
        });
    }
    else if (typeof module === 'object' && module.exports){
        module.exports = EventEmitter;
    }
    else {
        exports.EventEmitter = EventEmitter;
    }
}.call(this));

},{}]},{},[6])


//# sourceMappingURL=app.browserify.js.map
