(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
function LoadChart () {
	
	var callback = function () {};
	var type = false;

	var arg_len = arguments.length;
	if (arg_len > 0) {
		
		if ($.isFunction(arguments[0])) {
			callback = arguments[0];
		}
		else {
			type = arguments[0];
		}

		if (arg_len > 1) {
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
		}
		else {
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


	function AddHeader (arr, header) {
		arr.reverse();
		arr.push(header);
		arr.reverse();
	}

    // Extract relevant data
	function GetOnlyData (arr, type) {
		var items = [];

		arr.map(function (item) {
			if (!item.motion) {
				switch (type) {
					case "temperature-outside":
						items.push(item.tmp_o);
						break;
					case "temperature-inside":
						items.push(item.tmp_i);
						break;
					case "pressure":
						items.push(item.prs_o);
						break;
					case "humidity":
						items.push(item.hum_o);
						break;
					case "date":
						items.push(weather.shortDateTime(new Date(item.t)));
						break;
				}
			}
		});
		
		return items;
	}
}

function setChartTheme () {

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
	var highchartsOptions = Highcharts.setOptions(Highcharts.theme);
}

module.exports = {
	load: LoadChart
};
},{"./data.js":2}],2:[function(require,module,exports){
var settings = require('./settings.js'),
	image = require('./image.js');

var items_current = [];
var items_all = [];

// Get data from localStorage or API
function Get (options) {
	
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

	if (items_current.length === 0 || forceGetFromApi) {

		// Get from API
		GetDataFromAPI(api_date_from, api_date_to, function (items) {

			// Merge the new data with the existing cache (items_all)
			MergeWithCache(items);

			// Save everything
			Save();

			// Get the selection again
			items_current = DataAvailbleAtClient(true);

			// Resolve promise
			data_loader.resolve();
		});
	}
	// Its all good. Just resolve without asking the API for data =)
	else {
		data_loader.resolve();
	}

	return data_loader;

	// Check if we can use only the data from the client
	function DataAvailbleAtClient (forceGetFromClient) {
		var items = GetDataFromClient(),
			items_to_return = [],
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
		function filterItemsForCurrentDate () {
			var items_to_return = [];

			for (var i = 0; i < len; i++) {
				var item = items[i];
				
				if (item.t >= datetime_from && item.t <= datetime_to) {
					items_to_return.push(item);
				}
			}

			return items_to_return;
		}

		return [];
	}

	function FromDateIsLargerThanTo () {
		return api_date_from.getTime() > api_date_to.getTime();
	}
}

function GetDataFromAPI (from, to, callback) {
	
	var date_from = new Date(from.getTime());
	var date_to = new Date(to.getTime());

	var deferred = $.ajax({
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

			if (callback) {
				callback(items_from_api);
			}
		}
		else {
			alert(response.message);
		}
	}).fail(function (response) {
		if (callback) {
			callback([]);
		}
	});

	// Parse data API response
	function ParseAPIdata (rawArray) {
		
		var items_to_return = [],
			len = rawArray.length;

		for (var i = 0; i < len; i++) {
			
			var item = rawArray[i];
			var date = new Date(item.time * 1000);

			var _item = {
				date: date,
				t: Number(date),
				motion: parseInt(item.motion_event),
				tmp_o: Round(parseFloat(item.outside_temperature), 1),
				tmp_i: Round(parseFloat(item.inside_temperature), 1),
				prs_o: parseInt(item.outside_pressure),
				hum_o: parseFloat(item.outside_humidity),
				img: item.image
			};

			CreateImageUrl(_item);

			items_to_return.push(_item);
		}

		return items_to_return;
	}
}

// Retrieves data from cache or client storage
function GetDataFromClient () {

	var items_string,
		raw_data;

	// If already got 
	if (items_all.length > 0) {
		return items_all;
	}

	// Attempt to get from local storage
	try {
		items_string = localStorage.getItem(GetLocalStorageKey());
	}
	catch (e) {
		console.error("Could not get data from localStorage", e);
	}

	if (items_string != null) {
		raw_data = JSON.parse(items_string);
		
		items_all = ParseLocalStorageData(raw_data.items);
	}

	// Enriching data from localStorage storage
	function ParseLocalStorageData (items) {

		// Add date property
		items.map(function (item) {
			item.date = new Date(item.t);
			CreateImageUrl(item);
		});

		return items;
	}

	return items_all;
}

function CreateImageUrl (item) {
	var year = item.date.getFullYear();
	var month = weather.ensureDigits(item.date.getMonth() + 1, 2);
	var date = weather.ensureDigits(item.date.getDate(), 2);
	
	item.img_url = settings.place + "/" + year + "/" + month + "/" + date + "/" + item.img;
}

// Save items to localStorage
function Save () {
	var items = [];
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

function SaveToLocalStorage (key, data) {
	try {
		localStorage.setItem(key, data);
		return true;
	}
	catch (e) {}

	return false;
}

// Merge new array with client array
function MergeWithCache (newItems) {

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
function Round (number, decimals) {
	var pow = Math.pow(10, decimals);
	return parseInt(number * pow) / pow;
}

// The local storage key
function GetLocalStorageKey () {
	return settings.localStorageKey + "_" + settings.place;
}

function CreateDateKey (date) {
	return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
}

function CreateDateKeyDb (date) {
	return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
}

function GetCurrent () {
	return items_current;
}

function GetCurrentLength () {
	return items_current.length;
}

function GetAll () {
	return items_all;
}

function StoreLastImage () {

	var lastSnapshot = items_all[items_all.length - 1];

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
		}
		catch (e) {}

		setTimeout(function () {
			$img.remove();
		}, 100);
	});
}

function GetStoredImage () {
	var last = {};

	try {
		var item = localStorage.getItem(GetLocalStorageKey() + "_image");
		if (item) {
			last = JSON.parse(item);
		}
	}
	catch (e) {}

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
},{"./image.js":3,"./settings.js":6}],3:[function(require,module,exports){
var data;

var current = {
		index: 0,
		item: null,
		transform: []
	},
	$range,
	$rangeKw,
	$img_date,
	$img_weather,
	$img;

function PageLoad () {

	// Not sure why I cannot require the data at the top. Need to figure this out.
	data = require('./data.js');

	$range = $("#range");
	$rangeKw = $("#range-kw");
	$img_date = $("#img-date");
	$img_weather = $("#img-weather");
	$img = $("#img-wrap");
}

// Show last image in list and pre load close images
function Load (options) {

	options = options || {};

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
		}
		else {
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
	$rangeKw.kwRange({
		max: lastIndex,
		value: indexToShow,
		markIntervals: createMotionIntervals(items),
		onChange: function (index) {
			LoadImage(index);
		}
	});

	// Show the specified image
	LoadImage(indexToShow, items);
}

// Create motion intervals
function createMotionIntervals (items) {

	var motionIntervals = [];
	var motionCurrentInterval = [];
	var pctMultiplier = 100 / items.length;

	items.forEach(function (item, index) {
		if (item.motion) {
			motionCurrentInterval.push(index);
		}
		else if (motionCurrentInterval.length > 0) {
			endInterval();
		}
	});

	endInterval();

	function endInterval () {
		if (motionCurrentInterval.length > 0) {
			var interval = {
				cls: "motion",
				start: motionCurrentInterval[0],
				end: motionCurrentInterval[motionCurrentInterval.length - 1]
			};
			interval.startPct = interval.start * pctMultiplier;
			interval.endPct = (interval.end * pctMultiplier) + pctMultiplier;
			interval.widthPct = interval.endPct - interval.startPct;
			
			motionIntervals.push(interval);

			motionCurrentInterval.length = 0;
		}
	}

	return motionIntervals;
}

// Show image in list and pre load 10 closest
function LoadImage (index, items) {

	items = items || data.getCurrent();

	var len = items.length;

	// Determine index input type
	if (typeof index === "object") {
		if (index.pct) {
			index = Math.floor(len * index.pct);
		}
	}
	else if (typeof index === "string") {
		if (index === "first") {
			index = 0;
		}
		else if (index === "last") {
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
					
					if (Math.abs(checkItem.t - current.item.t) >= timeOneDay) {
						found = true;
					}
				}
			}
			while (checkIndex < items.length && checkIndex >= 0 && !found);
			
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

		$img_date.html(longDate + mediumDate + shortDate);
		$img_weather.html("<span>" + item.tmp_o + "&#8451;</span><span>" + item.hum_o + "%</span><span>" + parseInt(item.prs_o) + "hPa</span>");

		// Update isLast flag
		current.indexIsLast = current.index === len - 1;

		$rangeKw.kwRange("setValue", {
			value: index,
			text: weather.time(item.date, true),
			cls: item.motion ? "motion" : ""
		});
	}

	return index;
}

// Handles the display of the current item and preloads the other closest items
var displayImage = (function () {
	var loadedUrls = [];

	return function (items) {

		var $imgs = $img.children(),
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
			$img.append(imgsInsert.join(""));
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
		$img.children().removeClass("selected").filter("[data-url='" + current.item.img_url + "']").addClass("selected");

		function handleItem (item, selected) {
			if (item) {
				newUrls.push(item.img_url);

				// Not loaded
				if (loadedUrls.indexOf(item.img_url) === -1) {
					imgsInsert.push("<div data-url='" + item.img_url + "' style='background-image: url(" + ResolveImg(item.img_url) + ")' />");
				}
			}
		}
	};
}());

var scale = 1;  // scale of the image
var scaleLast = 1;
var xLast = 0;  // last x location on the screen
var yLast = 0;  // last y location on the screen
var xImage = 0; // last x location on the image
var yImage = 0; // last y location on the image
var pinchType = "slide-images";

function pinchStart (e) {
	scale = scaleLast;
}

function pinchEnd (e) {
	scale = e.scale;
	console.log(e);
}

function pinch (e) {
	
	var xScreen = e.center.x - 0;
    var yScreen = e.center.y - 40;

    // find current location on the image at the current scale
    xImage = xImage + ((xScreen - xLast) / scaleLast);
    yImage = yImage + ((yScreen - yLast) / scaleLast);

	scaleLast = (scale * e.scale);

	if (scaleLast < 1) {
		scaleLast = 1;
	}
	else if (scaleLast > 25) {
		scaleLast = 25;
	}

	// determine the location on the screen at the new scale
    var xNew = (xScreen - xImage) / scaleLast;
    var yNew = (yScreen - yImage) / scaleLast;

    if (scaleLast === 1) {
    	xNew = 0;
    	yNew = 0;
    }

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

function ResolveImg (src, checkStoredImage) {
	
	if (typeof checkStoredImage === "undefined") {
		checkStoredImage = true;
	}

	// Use the image in the local storage if not online
	if (checkStoredImage && !navigator.onLine) {
		var lastStored = data.getStoredImage();
		if (lastStored && lastStored.img === src) {
			return lastStored.data;
		}
	}

	return "http://www.vhsys.no/images/" + src;
}

function GetCurrentIndex () {
	return current.index;
}

function GetMaxIndex () {
	return data.getCurrentLength() - 1;
}

function AtEnd () {
	return current.index === (data.getCurrentLength() - 1);
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
module.exports = {
	resized: function () {
		clearTimeout(weather.resizeTimeout);
		weather.resizeTimeout = setTimeout(function () {
			window.scrollTo(0, 0);

			weather.vw = weather.$.w.width();
			weather.vh = window.innerHeight || weather.$.w.innerHeight();

			if (window.navigator.standalone) {
				weather.vh -= 20;
			}

			var heightHeader = 50;
			var heightImageHeader = 51;
			var heightImageRange = 45;
			var heightChartButtons = 70;
			var contentHeight = weather.vh - 50;

			// Set heights
			if (window.navigator.standalone) {
				weather.$.app.height(weather.vh + 20);
			}
			else {
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
			else {

				// Redo charts when the window changes dimensions
				weather.chart.load();
			}
		}, 50);
	}
};
},{}],5:[function(require,module,exports){
var data = require('./data.js'),
	image = require('./image.js'),
	chart = require('./chart.js'),
	layout = require('./layout.js');
	settings = require('./settings.js');

// Default to not online if not set
if (typeof navigator.onLine === 'undefined') {
	navigator.onLine = false;
}

window.weather = (function () {

    // Stores current items
    var current = {
    	items: [],
    	items_index: 0
    };

    var $html,
    	$app,
    	$header,
    	$sections,
    	$rangeWrap,
    	$image,
    	$img,
    	$imgWrap,
    	$chart,
    	$chartTemperature,
		$chartHumidity,
		$chartPressure,
    	$date_from,
    	$date_to,
    	$w,
    	changingImageWithTouch = false;

	$html = $("html");

	if (window.navigator.standalone) {
		$html.addClass("standalone");
	}

	// Handle cache
    StartCacheControl();

    // Init
    function startApp () {

    	if (window.weather && layout) {

    		setTitle(settings.place);

    		CacheObjects();
    		layout.resized();
    		BindEvents();

    		image.pageLoad();

    		weather.setDates({
    			from: Now(-3),
    			to: Now()
    		});

    		// Test mode
    		if (location.href.indexOf("test") !== -1) {
    			document.body.classList.add("testing");
    		}
		}
		else {
			setTimeout(startApp, 50);
		}
	}

	function setTitle (title) {
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

	function StartCacheControl () {
		var appCache = window.applicationCache;

		// Bind listener
		appCache.addEventListener('updateready', CheckStatus, false);

		CheckStatus();

		function CheckStatus () {
			if (appCache.status == appCache.UPDATEREADY) {
		      if (confirm('En ny versjon av værstasjonen er klar. Vil du hente den nå?')) {
		        window.location.reload();
		      }
		    }
		}
	}

	function CacheObjects () {
		$w = $(window);

		$app = $("#app");
		$sections = $("#sections");
		
		$header = $("#site-header");
		$date_from = $("#date-from");
		$date_to = $("#date-to");

		$image = $("#image");
		$imgWrap = $("#img-wrap");
		$range = $("#range");
		$rangeWrap = $("#range-wrap");
		$rangeKw = $("#range-kw");
		
		$chart = $("#chart");
		$chartTemperature = $("#chart-temperature");
		$chartHumidity = $("#chart-humidity");
		$chartPressure = $("#chart-pressure");

		// New shared caching
		weather.$.w = $w;
		weather.$.app = $app;
		weather.$.sections = $sections;
		weather.$.image = $image;
		weather.$.imgWrap = $imgWrap;
		weather.$.chart = $chart;
		weather.$.chartContainer = $("#chart-canvas-container");
	}

	function BindEvents () {
		$(function () {
			
			// Change section
			OnClick($header.find("button"), HeaderButtonClick);

			// Change chart types
			OnClick($chart.find(".types li"), ChangeChartType);

			$w.resize(layout.resized);

			// Listen for change dates in a bit
			setTimeout(function (argument) {
				$date_from.add($date_to).change(function () {
					SetDates({
						from: $date_from.mobiscroll("getDate"),
						to: $date_to.mobiscroll("getDate"),
						setDateInputs: false
					});
				});
			}, 1000);
		});

		HammerTime();
	}

	function BindMobiScroll (from, to) {
		$date_from.mobiscroll("destroy");
		$date_from.mobiscroll().date({
			lang: "no",
			dateFormat: "d/m/y",
			dateOrder: "ddMMyy",
			maxDate: to
		});

		$date_to.mobiscroll("destroy");
		$date_to.mobiscroll().date({
			lang: "no",
			dateFormat: "d/m/y",
			dateOrder: "D ddMMyy",
			minDate: from
		});
	}

	// Switch active section
	function HeaderButtonClick () {
		var $btn = $(this);
		if (!$btn.hasClass("selected")) {
			
			switch ($btn.data("action")) {
				case "camera":
					$sections.removeClass("show-chart");
					$btn.addClass("selected").siblings().removeClass("selected");
					break;
				case "charts":
					$sections.addClass("show-chart");
					$btn.addClass("selected").siblings().removeClass("selected");
					break;
				case "refresh":
					refresh({
						forceGetFromApi: true
					});
					break;
			}
		}
	}

	// Switch active chart
	function ChangeChartType () {
		var $btn = $(this);
		$btn.addClass("selected").siblings().removeClass("selected");
		setTimeout(function () {
			chart.load($btn.data("type"));
		}, 25);
	}

	// Check if given date is the todays date
	function isToday (date) {
		var now = Now();

		return date.getFullYear() === now.getFullYear() &&
			   date.getMonth() === now.getMonth() &&
			   date.getDate() === now.getDate();
	}

	function needsUpdate () {
		
		if (!weather.onToday) {
			return false;
		}

		var now = Now();
		var now_raw = new Date();

		now.setHours(now_raw.getHours());

		return now > weather.to;
	}

	// Date helper
	function Now (addDays) {
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

	function GetCurrent () {
		return current;
	}

	// Set the from and to date and update data
	function SetDates (options) {
		
		if (typeof options.setDateInputs === "undefined") {
			options.setDateInputs = true;
		}

		BindMobiScroll(options.from, options.to);

		var deferred = $.Deferred();

		if (options.setDateInputs) {
			$date_from.mobiscroll("setDate", options.from, true);
			$date_to.mobiscroll("setDate", options.to, true);
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
			 to: options.to ,
			 forceGetFromApi: options.forceGetFromApi
		};

		// Get data and update image and chart
		data.get(getOptions).then(function () {
			image.load();
			
			// Wait some before loading charts
			setTimeout(chart.load, 500);
			
			deferred.resolve();

			if (options.moveToEnd) {
				var index = image.getMaxIndex();
				image.loadSingle(index);
			}

			// Notify to other components that loading is done
			weather.firstLoadComplete = true;

			trackPageView();
		});
		
		return deferred;
	}

	// Refresh data
	function refresh (options) {

		options = options || {};

		// Show loading indication
		weather.loading();

		// Wait for a bit before actually getting new data.
		// It is important to show some loading indication to the user
		setTimeout(function () {
			var from = $date_from.mobiscroll("getDate"),
				to = $date_to.mobiscroll("getDate");
			
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

	// Init hammer for app
	function HammerTime () {

		if (!image) {
			setTimeout(HammerTime, 25);
			return;
		}
		var hammertimeImage = new Hammer($image[0]);

	    // Fast press
		hammertimeImage.get("press").set({
			enable: true,
			time: 1
		});

		// Pan
		hammertimeImage.get("pan").set({
			enable: true,
			threshold: 0,
			direction: Hammer.DIRECTION_HORIZONTAL,
			pointers: 0 // all
		});

		hammertimeImage.get("pinch").set({
			enable: false
		});

		hammertimeImage.on("hammer.input", function () {
			clearTimeout(weather.slideOutTimeout);
		});

	    hammertimeImage.on("press", function (e) {
    		if (!ChangeImageIndexFromRangeSlider(e)) {
		    	current_index = image.getCurrentIndex();
		    	changingImageWithTouch = true;
		    }
	    });
	    hammertimeImage.on("pressup", function (e) {
	    	changingImageWithTouch = false;
	    });
	    var changing = false;

	    // Change snapshot
	    weather.lastx = -1;

	    hammertimeImage.on("pan", function (e) {
	    	if (!ChangeImageIndexFromRangeSlider(e)) {
		    	if (!changing) {
		    		
		    		var x = e.pointers[0].pageX;
		    		if (e.pointers.length === 2) {
		    			x = e.center.x;
		    		}

		    		if (weather.lastx === -1) {
		    			weather.lastx = x;
		    		}
		    		
	    			var diff = x - weather.lastx,
	    				index;

	    			if (Math.abs(diff) >= 10) {

	    				current_index = image.getCurrentIndex();

	    				changing = true;
	    				
	    				if (diff > 0) {
	    					if (!image.atEnd()) {

	    						// Move 1 day up
	    						if (e.pointers.length === 2) {
	    							index = image.loadSingle("+1d");
	    						}
	    						else {
		    						index = image.loadSingle(current_index + 1);
		    					}
		    				}
	    				}
	    				else {
	    					// Move 1 day down
    						if (e.pointers.length === 2) {
    							index = image.loadSingle("-1d");
    						}
    						else {
	    						index = image.loadSingle(current_index - 1);
	    					}
	    				}

    					weather.lastx = -1;

						setTimeout(function () {
							changing = false;
						}, 1);
	    			}
				}
			}
		});

		hammertimeImage.on("panend", function (e) {
	    	weather.lastx = -1;

	    	var duration = 2000,
	    		startIndex = image.getCurrentIndex(),
	    		changeInIndex = 25 * e.velocityX * -1,
	    		decreasing = changeInIndex < 0,
	    		timeStart = +new Date();

	    	if (Math.abs(changeInIndex) > 3) {
	    		slideNewImage();
	    	}

	    	function slideNewImage () {
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
		hammertimeImage.on("pinchstart", image.pinchStart);
		hammertimeImage.on("pinch", image.pinch);
		hammertimeImage.on("pinchEnd", image.pinchEnd);
	}

	function ChangeImageIndexFromRangeSlider (e) {
		var $target = $(e.target);
		if ($target.closest($rangeWrap).length > 0) {
			var x = Math.floor(e.pointers[0].pageX);

    		var rangeWidth = weather.vw - (32.5 * 2);
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

	// Pads number with given digits
	function EnsureDigits (num, digits) {
		num = num.toString();
		var incr = digits - num.length;
		for (var i = 0; i < incr; i++) {
			num = "0" + num;
		}
		return num;
	}

	// Returns a pretty date string from date
	function PrettyDate (date, format) {
		
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

		return day + " <span>" + time + "</span>";
	}

	// Returns a short date string from date
	function ShortDate (dt) {
		var year = dt.getFullYear().toString();
		return dt.getDate() + "/" + (dt.getMonth() + 1) + "/" + year[2].toString() + year[3].toString();
	}

	function ShortDateTime (date) {
		return ShortDate(date) + " <span>" + Time(date) + "</span>";
	}

	function Time (date, seconds) {
		var timePart = EnsureDigits(date.getHours(), 2) + ":" + EnsureDigits(date.getMinutes(), 2);
		
		if (seconds) {
			return timePart + ":" + EnsureDigits(date.getSeconds(), 2);
		}

		return timePart;
	}

	// Shorthand for better click
	function OnClick ($el, fn) {
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

			$this.click(function (e) {
				e.preventDefault();
			});
		});
	}

	function prevDef (e) {
		e.preventDefault();
	}

	function loading (hide) {
		var $btn = $header.find(".ico[data-action='refresh']");
		
		if (hide === false) {
			$btn.removeClass("spin");
		}
		else {
			$btn.addClass("spin");
		}
	}

	// Handle document focus
	var hasFocus = document.hasFocus(),
		lastAutoRefresh = +new Date();
	setInterval(checkDocumentFocus, 500);
	function checkDocumentFocus () {
		var focus = document.hasFocus();

		// Refresh if regaining focus
		if (!hasFocus && focus) {
			var now = +new Date();
			
			// Last refresh must be more than 1 minute old
			if (needsUpdate()) {
				lastAutoRefresh = now;

				refresh();
			}
		}

		hasFocus = focus;
	}

	function firstUpper (str) {
		if (!str || str.length < 1) {
			return str;
		}

		var first = str[0].toUpperCase();

		return first + str.substr(1);
	}

	// Track page view
	function trackPageView () {

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
		time: Time,
		ensureDigits: EnsureDigits,
		getCurrent: GetCurrent,
		loading: loading,
		needsUpdate: needsUpdate,
		$: {},
		imageWidth: 640,
		imageHeight: 480
	};

})();
},{"./chart.js":1,"./data.js":2,"./image.js":3,"./layout.js":4,"./settings.js":6}],6:[function(require,module,exports){
module.exports = (function () {

	// App settings
	var settings_default = {
		localStorageKey: "vhsys",
		place: "",
		appVersion: 1
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
		settings.place = "veggli";
	}

	// Set default
	if (settings.place.length === 0) {
		settings.place = "veggli";
	}

	//if (settings.place === "test") {
	//	localStorage.clear();
	//}

	return settings;
}());
},{}]},{},[5]);
