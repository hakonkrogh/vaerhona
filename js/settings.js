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