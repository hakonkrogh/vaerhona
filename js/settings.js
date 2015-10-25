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
}());