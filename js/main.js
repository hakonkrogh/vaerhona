;(function (window, $, undefined) {

	window.weather = (function () {

		// App settings
		var settings_default = {
			localStorageKey: "vhsys",
			place: "",
			appVersion: 1
		};

		// Todo: get from localstorage
		settings = settings_default;
		//if (!settings.appVersion) {
		//	localStorage.clear();
		//}

		// Handle cache
	    StartCacheControl();

		// Get place name
		var locationParts = window.location.href.split("/");
		if (locationParts.length > 1) {
			settings.place = locationParts[locationParts.length - 1];
		}

		if (settings.place.indexOf("dev.html") !== -1) {
			settings.place = "test";
		}

		// Set default
		if (settings.place.length === 0) {
			settings.place = "veggli";
		}

		if (settings.place === "test") {
			localStorage.clear();
		}

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

	    // Init
	    function startApp () {

	    	if (window.weather && weather.layout) {

	    		setTitle(settings.place);

	    		CacheObjects();
	    		weather.layout.resized();
	    		BindEvents();

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
			$img = $("#img");
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
			weather.$.img = $img;
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

				$w.resize(weather.layout.resized);

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
				weather.chart.load($btn.data("type"));
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

		function GetSettings () {
			return settings;
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
			weather.data.get(getOptions).then(function () {
				weather.image.load();
				
				// Wait some before loading charts
				setTimeout(weather.chart.load, 500);
				
				deferred.resolve();

				if (options.moveToEnd) {
					var index = weather.image.getMaxIndex();
					weather.image.loadSingle(index);
				}

				// Notify to other components that loading is done
				weather.firstLoadComplete = true;
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
						moveToEnd: weather.image.atEnd(),
						forceGetFromApi: options.forceGetFromApi
					});
					return;
				}
				
				SetDates({
					from: from,
					to: to,
					setDateInputs: false,
					moveToEnd: weather.image.atEnd(),
					forceGetFromApi: options.forceGetFromApi
				});
			}, 500);
		}

		// Init hammer for app
		function HammerTime () {

			if (!weather.image) {
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
			    	current_index = weather.image.getCurrentIndex();
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

		    				current_index = weather.image.getCurrentIndex();

		    				changing = true;
		    				
		    				if (diff > 0) {
		    					if (!weather.image.atEnd()) {

		    						// Move 1 day up
		    						if (e.pointers.length === 2) {
		    							index = weather.image.loadSingle("+1d");
		    						}
		    						else {
			    						index = weather.image.loadSingle(current_index + 1);
			    					}
			    				}
		    				}
		    				else {
		    					// Move 1 day down
	    						if (e.pointers.length === 2) {
	    							index = weather.image.loadSingle("-1d");
	    						}
	    						else {
		    						index = weather.image.loadSingle(current_index - 1);
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
		    		startIndex = weather.image.getCurrentIndex(),
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
		    		
		    		weather.image.loadSingle(newIndex);

		    		if (time < duration) {
			    		weather.slideOutTimeout = setTimeout(slideNewImage, 25);
			    	}
		    	}
		    });

			// Zoom
			hammertimeImage.on("pinchstart", weather.image.pinchStart);
			hammertimeImage.on("pinch", weather.image.pinch);
			hammertimeImage.on("pinchEnd", weather.image.pinchEnd);
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

	    		var length = weather.data.getCurrentLength();
	    		var index = length * pctX;

	    		weather.image.loadSingle(index);

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
			getSettings: GetSettings,
			loading: loading,
			needsUpdate: needsUpdate,
			$: {},
			imageWidth: 640,
			imageHeight: 480
		};

	})();

})(window, jQuery);