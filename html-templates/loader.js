;(function (window, undefined) {

	if (navigator.userAgent.indexOf("Android") !== -1) {
		if (document.body.classList) {
			document.body.classList.add("android");
		}
	}
	
	var loader = document.querySelector("#app-loader");

	// Make sure there is a place set
	var hrefParts = location.href.split("/");
	var hrefPartLast = hrefParts[hrefParts.length - 1];
	if (hrefPartLast.length === 0 && hrefPartLast !== "dev.html") {
		var div = document.createElement("div");
		div.className = "no-place-set";
		div.innerHTML = "<div class='logo'></div><h1>værhøna.no/[din-værhøne]</h1><div class='sub'>Skriv inn navnet på værhøna i adressefeltet</div>";
		document.body.appendChild(div);
	}
	else {
		setTimeout(loadResources, 100);
	}

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