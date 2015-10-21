;(function (window, undefined) {
	if (navigator.userAgent.indexOf("Android") !== -1) {
		if (document.body.classList) {
			document.body.classList.add("android");
		}
	}
})(window, undefined);	