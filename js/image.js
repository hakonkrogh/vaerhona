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

	// Not online. Use the image in the local storage if not online
	if (!navigator.onLine && checkStoredImage) {
		var lastStored = data.getStoredImage();
		if (lastStored && lastStored.img === src) {
			return lastStored.data;
		}
		else {
			return "/gfx/no-image.jpg";
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