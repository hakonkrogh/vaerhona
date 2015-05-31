$.fn.kwRange = function (mixed, mixed2) {
	return this.each(function () {
		var $this = $(this);

		// Attempt to call a public method
		if (typeof mixed === "string") {
			var fn = $this.data(mixed);
			if (fn) {
				fn(mixed2);
			}
			return;
		}

		var $ind = $this.find(".kwr-indicator"),
			$indText = $ind.find(".kwr-text"),
			$line = $this.find(".kwr-line"),
			minValue = 0,
			maxValue = 0,
			value = 0,
			valuePct = 0;

		if (mixed.max) {
			maxValue = mixed.max;
		}

		setValue({
			value: mixed.value
		});

		if (mixed.markIntervals) {
			createIntervals(mixed.markIntervals);
		}

		function createIntervals (intervals) {
			var $intervals = $("<div class='kwr-intervals'/>");

			intervals.forEach(function (item) {
				$intervals.append("<div class='intv' style='left: " + item.startPct + "%; width: " + item.widthPct + "%;' class='" + item.cls + "' />");
			});

			$line.find(".kwr-intervals").remove();
			$line.append($intervals);
		}

		function setValue (opt) {
			
			if (opt.value) {
				value = opt.value;
			}

			if (value < 0) {
				value = 0;
			}
			
			if (value > maxValue) {
				value = maxValue;
			}

			// Determine pct
			valuePct = ((opt.value) / (maxValue)) * 100;

			$ind.css({
				left: valuePct + "%"
			});

			if (opt.text) {
				$indText.html(opt.text);
			}

			if (opt.cls) {
				$ind.attr("class", "kwr-indicator " + opt.cls);
			}
			else {
				$ind.attr("class", "kwr-indicator");
			}
		}

		// Public methods
		$this.data({
			setValue: setValue,
			createIntervals: createIntervals
		});
	});
};

Math.easeOutExpo = function (currTime, startValue, valueChange, duration) {
	return valueChange * ( -Math.pow( 2, -10 * currTime/duration ) + 1 ) + startValue;
};