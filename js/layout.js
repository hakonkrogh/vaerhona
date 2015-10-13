function resize () {
	window.scrollTo(0, 0);

	weather.vw = weather.$.w.width();
	weather.vh = window.innerHeight || weather.$.w.innerHeight();

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
}


module.exports = {
	resized: function () {
		clearTimeout(weather.resizeTimeout);
		weather.resizeTimeout = setTimeout(resize, 50);
	}
};