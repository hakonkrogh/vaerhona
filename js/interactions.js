var image = require('./image.js'),
	chart = require('./chart.js'),
	layout = require('./layout.js'),
	data = require('./data.js');

var current_index;
//var changingImageWithTouch = false;

function init () {
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

	touchEventsInit();
}

function touchEventsInit () {

	if (!image) {
		setTimeout(touchEventsInit, 25);
		return;
	}

	// Enable hammer on document.body
	//weather.hammerTimeBody = new Hammer(document.body);

	var hammertimeImage = new Hammer.Manager(weather.$.image[0]);

    hammertimeImage.add(new Hammer.Pan({ threshold: 5, pointers: 1 }));
    //hammertimeImage.add(new Hammer.Tap({ event: 'doubletap', taps: 2 }));
    //hammertimeImage.add(new Hammer.Swipe()).recognizeWith(hammertimeImage.get('pan'));
    //hammertimeImage.add(new Hammer.Pinch({ threshold: 0 })).recognizeWith([mc.get('pan'), mc.get('rotate')]);

    // Enable zoom
	zoom.init();

	// Stop any running slide animation
	hammertimeImage.on("hammer.input", function (e) {
		e.preventDefault();
		clearTimeout(weather.slideOutTimeout);
		ChangeImageIndexFromRangeSlider(e);
	});

	// Change snapshot
    weather.lastx = -1;

    hammertimeImage.on("panstart", function (e) {
		if (!zoom.active() && !ChangeImageIndexFromRangeSlider(e)) {
	    	current_index = image.getCurrentIndex();
	    	//changingImageWithTouch = true;
	    }
    });

    hammertimeImage.on("pan", function (e) {
    	if (!zoom.active() && !ChangeImageIndexFromRangeSlider(e)) {
	    		
    		var x = e.pointers[0].pageX;
    		if (e.pointers.length === 2) {
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
						// Move 1 day up
						if (e.pointers.length === 2) {
							image.loadSingle("+1d");
						}
						else {
    						image.loadSingle(current_index + 1);
    					}
    				}
				}
				else {
					// Move 1 day down
					if (e.pointers.length === 2) {
						image.loadSingle("-1d");
					}
					else {
						image.loadSingle(current_index - 1);
					}
				}

				weather.lastx = -1;
			}
		}
	});

	hammertimeImage.on("panend", function (e) {
		if (!zoom.active()) {
	    	weather.lastx = -1;

	    	var duration = 1000,
	    		startIndex = image.getCurrentIndex(),
	    		changeInIndex = 25 * e.velocityX * -1,
	    		decreasing = changeInIndex < 0,
	    		timeStart = +new Date();

	    	if (Math.abs(changeInIndex) > 3) {
	    		slideNewImage();
	    	}
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
}

// Switch active section
function HeaderButtonClick () {
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

function ChangeImageIndexFromRangeSlider (e) {
	var $target = $(e.target);
	var x = Math.floor(e.pointers[0].pageX);

	if ($target.closest(weather.$.rangeWrap).length > 0) {

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

// Switch active chart
function ChangeChartType () {
	var $btn = $(this);
	$btn.addClass("selected").siblings().removeClass("selected");
	setTimeout(function () {
		chart.load($btn.data("type"));
	}, 25);
}

// Zoom
var zoom = (function zoomInit() {

	let $el;

	// Checks if zoom is active
	function active () {
		if (!$el) {
			return false;
		}

		let matrix = $el.panzoom('getMatrix');
		return matrix[0] > 1;
	}

	function init () {
		$el = weather.$.imgWrap.children('div');

		if (!$el.length) {
			return setTimeout(init, 25);
		}

		$el.panzoom({
		    startTransform: 'scale(1)',
		    increment: 1,
		    minScale: 1,
		    contain: 'invert',
		    transition: true
		});

		// Register a double tap zoom
		let mc = new Hammer.Manager($el[0]);
		mc.add(new Hammer.Tap({
			event: 'doubletap',
			threshold: 5,
			interval: 500,
			time: 500,
			taps: 2
		}));
		mc.on('doubletap', function onImgDoubleTap (event) {
			
			// Zoom out
			if (active()) {
				$el.panzoom('reset');
			}
			// Zoom in
			else {
				$el.panzoom('zoom', 3, {
					animate: true,
					focal: {
						clientX: event.center.x,
						clientY: event.center.y
					},
					silent: false
				});
			}
		});
	}

	return {
		init,
		active
	};
}());

module.exports = {
	init
};