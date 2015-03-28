;(function (window, undefined) {

	if (navigator.userAgent.indexOf("Android") !== -1) {
		if (document.body.classList) {
			document.body.classList.add("android");
		}
	}
	
	var loader = document.querySelector("#app-loader");

	setTimeout(loadResources, 100);

	function loadResources () {
		
		var script = document.createElement("script");
		var css = document.createElement("link");
		
		script.src = "js/build/production.min.js";

		css.href = "css/build/production.css";
		css.rel = "stylesheet";

		document.body.appendChild(css);
		document.body.appendChild(script);

		setTimeout(checkAppLoadingStatus, 100);
	}

	function checkAppLoadingStatus () {
		if (!window.weather || !window.weather.firstLoadComplete) {
			setTimeout(checkAppLoadingStatus, 25);
		}
		else {
			setTimeout(HideLogo, 100);
		}
	}

	function HideLogo (callback) {
		if (loader) {
			loader.style.opacity = 0;
			setTimeout(function () {
				loader.parentNode.removeChild(loader);

				if (callback) {
					callback();
				}
			}, 500);
		}
	}
})(window, undefined);	