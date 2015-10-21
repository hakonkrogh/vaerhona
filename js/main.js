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

    	let $blockMsgImage,
    		$blockMsgChart;

		function show (message) {
			if (!$blockMsgImage) {
				let template = `<div class='section-block-message'>${message}</div>`;
				$blockMsgImage = $(template);
				$blockMsgChart = $(template);
				weather.$.image.append($blockMsgImage);
				weather.$.chart.append($blockMsgChart);
			}
			else {
				$blockMsgImage.html(message);
				$blockMsgChart.html(message);
			}

			weather.$.image.toggleClass("section-blocked", true);
			weather.$.chart.toggleClass("section-blocked", true);
		}

		function hide () {
			weather.$.image.find(".section-block").remove();
			weather.$.chart.find(".section-block").remove();

			weather.$.image.toggleClass("section-blocked", false);
			weather.$.chart.toggleClass("section-blocked", false);
		}

		return {
			show,
			hide
		};
	}());

    // Init
    function startApp () {
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

	function CacheObjects () {

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

	function BindMobiScroll (opt) {
		
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

	function SetMinimumDate (date) {
		BindMobiScroll({
			from: weather.$.dateFrom.mobiscroll("getDate"),
			to: weather.$.dateTo.mobiscroll("getDate"),
			fromMin: date
		});
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
			}
			else {
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
	
	function refresh (options) {

		options = options || {};

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

		function checkDocumentFocus () {
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
			checkDocumentFocus
		};
	}());

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

		if (format === "no-time") {
			return day;
		}

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

			$this.click(prevDef);
		});
	}

	function prevDef (e) {
		e.preventDefault();
	}

	function loading (hide) {
		var $btn = weather.$.header.find(".ico[data-action='refresh']");
		
		if (hide === false) {
			$btn.removeClass("spin");
		}
		else {
			$btn.addClass("spin");
		}
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
		setMinimumDate: SetMinimumDate,
		time: Time,
		ensureDigits: EnsureDigits,
		getCurrent: GetCurrent,
		loading: loading,
		needsUpdate: needsUpdate,
		$: {},
		imageWidth: 640,
		imageHeight: 480,
		refresh
	};

})();