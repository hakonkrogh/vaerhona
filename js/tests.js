(function () {

	// Check if the pretty dates formats correctly in Norwegian
	QUnit.test("PrettyDate", function (assert) {
		assert.equal(weather.prettyDate(new Date("2014/12/14 12:00:00"), "short"), "Sø. 14. des. 2014 <span>12:00</span>");
		assert.equal(weather.prettyDate(new Date("2014/12/15 12:00:00"), "short"), "Ma. 15. des. 2014 <span>12:00</span>");

		assert.equal(weather.prettyDate(new Date("2014/12/14 12:00:00"), "long"), "Søndag 14. desember 2014 <span>12:00</span>");
		assert.equal(weather.prettyDate(new Date("2014/12/15 12:00:00"), "long"), "Mandag 15. desember 2014 <span>12:00</span>");
	});

	// Check if the weather API returns an array for a set of days
	QUnit.test("Weather API", function (assert) {
		var done = assert.async();

		var now = new Date();
		var yesterday = new Date(now.getTime());
		yesterday.setDate(yesterday.getDate() - 1);

		weather.data.getFromAPI(now, yesterday, function (snapshots) {
			var success = snapshots && $.isArray(snapshots);
			if (success) {
				assert.ok(true, "Got correct weather API response");
			}
			else {
				assert.ok(false, "The response was not an array");
			}
			
			done();
		});
	});

})();