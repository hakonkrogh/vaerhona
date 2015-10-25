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

	hammerEvents();
}

function hammerEvents () {

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
						pushImageToDisplay(function () {
							// Move 1 day up
							if (e.pointers.length === 2) {
								image.loadSingle("+1d");
							}
							else {
	    						image.loadSingle(current_index + 1);
	    					}
	    				});
    				}
				}
				else {
					pushImageToDisplay(function () {
    					
    					// Move 1 day down
						if (e.pointers.length === 2) {
							image.loadSingle("-1d");
						}
						else {
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
	}());

	hammertimeImage.on("panend", function (e) {
    	weather.lastx = -1;

    	var duration = 1000,
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
	//hammertimeImage.on("pinchstart", image.pinchStart);
	//hammertimeImage.on("pinch", image.pinch);
	//hammertimeImage.on("pinchEnd", image.pinchEnd);
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

module.exports = {
	init
};