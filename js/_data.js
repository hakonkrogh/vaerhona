;(function (window, $, undefined) {
	window.weather.data = (function () {

		var settings = weather.getSettings(),
			items_current = [];
			items_all = [];

		// Get data from localStorage or API
		function Get (options) {
			
			var data_loader = $.Deferred(),
				dates = [],
				api_date_from,
				api_date_to,
				datetime_from,
				datetime_to;

			// Show loading indication
			weather.loading();
			data_loader.always(function () {
				weather.loading(false);
			});

			// Make sure the last image is stored in localstorage after getting
			data_loader.then(StoreLastImage);

			datetime_from = options.from.getTime();
			datetime_to = options.to.getTime();

			// Dates to ask from API
			api_date_from = new Date(datetime_from);
			api_date_to = new Date(datetime_to);

			var forceGetFromApi = options.forceGetFromApi;

			// Check where the data is avalible
			items_current = DataAvailbleAtClient();

			if (items_current.length === 0 || forceGetFromApi) {

				// Get from API
				GetDataFromAPI(api_date_from, api_date_to, function (items) {

					// Merge the new data with the existing cache (items_all)
					MergeWithCache(items);

					// Save everything
					Save();

					// Get the selection again
					items_current = DataAvailbleAtClient(true);

					// Resolve promise
					data_loader.resolve();
				});
			}
			// Its all good. Just resolve without asking the API for data =)
			else {
				data_loader.resolve();
			}

			return data_loader;

			// Check if we can use only the data from the client
			function DataAvailbleAtClient (forceGetFromClient) {
				var items = GetDataFromClient(),
					items_to_return = [],
					len = items.length;

				// If there is any data from the client
				if (len > 0) {

					// Compile list of all dates
					for (var i = 0; i < len; i++) {
						dates.push(items[i].t);
					}

					// See if all the hours between from and to are availble
					while (!FromDateIsLargerThanTo() && dates.indexOf(api_date_from.getTime()) !== -1) {
						api_date_from.setHours(api_date_from.getHours() + 1);
					}
					while (!FromDateIsLargerThanTo() && dates.indexOf(api_date_to.getTime()) !== -1) {
						api_date_to.setHours(api_date_to.getHours() - 1);
					}

					// We have all data on the client. Continue withouth asking API for data
					if (forceGetFromClient || FromDateIsLargerThanTo()) {
						return filterItemsForCurrentDate();
					}
					//else if (forceGetFromClient) {
					//	return filterItemsForCurrentDate();
					//}

					// Compile list of items use
					function filterItemsForCurrentDate () {
						var items_to_return = [];

						for (var i = 0; i < len; i++) {
							var item = items[i];
							
							if (item.t >= datetime_from && item.t <= datetime_to) {
								items_to_return.push(item);
							}
						}

						return items_to_return;
					}
				}

				return [];
			}

			function FromDateIsLargerThanTo () {
				return api_date_from.getTime() > api_date_to.getTime();
			}
		}

		function GetDataFromAPI (from, to, callback) {
			
			var date_from = new Date(from.getTime());
			var date_to = new Date(to.getTime());

			var deferred = $.ajax({
				url: "http://www.vhsys.no/api/",
				dataType: "jsonp",
				cache: false,
				data: {
					from: CreateDateKeyDb(date_from),
					to: CreateDateKeyDb(date_to),
					place: settings.place,
					testdata: kw.testapi
				}
			}).then(function (response) {
				if (response && response.success) {

					var items_from_api = ParseAPIdata(response.data);

					if (callback) {
						callback(items_from_api);
					}
				}
				else {
					alert(response.message);
				}
			}).fail(function (response) {
				if (callback) {
					callback([]);
				}
			});

			// Parse data API response
			function ParseAPIdata (rawArray) {
				
				var items_to_return = [],
					len = rawArray.length;

				for (var i = 0; i < len; i++) {
					
					var item = rawArray[i];
					var date = new Date(item.time * 1000);

					var _item = {
						date: date,
						t: Number(date),
						motion: parseInt(item.motion_event),
						tmp_o: Round(parseFloat(item.outside_temperature), 1),
						tmp_i: Round(parseFloat(item.inside_temperature), 1),
						prs_o: parseInt(item.outside_pressure),
						hum_o: parseFloat(item.outside_humidity),
						img: item.image
					};

					CreateImageUrl(_item);

					items_to_return.push(_item);
				}

				return items_to_return;
			}
		}

		// Retrieves data from cache or client storage
		function GetDataFromClient () {

			var items_string,
				raw_data;

			// If already got 
			if (items_all.length > 0) {
				return items_all;
			}

			// Attempt to get from local storage
			try {
				items_string = localStorage.getItem(GetLocalStorageKey());
			}
			catch (e) {
				console.error("Could not get data from localStorage", e);
			}

			if (items_string != null) {
				raw_data = JSON.parse(items_string);
				
				items_all = ParseLocalStorageData(raw_data.items);
			}

			// Enriching data from localStorage storage
			function ParseLocalStorageData (items) {

				// Add date property
				items.map(function (item) {
					item.date = new Date(item.t);
					CreateImageUrl(item);
				});

				return items;
			}

			return items_all;
		}

		function CreateImageUrl (item) {
			var year = item.date.getFullYear();
			var month = weather.ensureDigits(item.date.getMonth() + 1, 2);
			var date = weather.ensureDigits(item.date.getDate(), 2);
			
			item.img_url = settings.place + "/" + year + "/" + month + "/" + date + "/" + item.img;
		}

		// Save items to localStorage
		function Save () {
			var items = [];
				len = items_all.length;

			// Create clone of all objects
			for (var i = 0; i < len; i++) {
				items.push($.extend({}, items_all[i]));
			}

			// Remove date property before saving
			items.map(function (item) {
				delete item.date;
				delete item.img_url;
			});

			var saveObj = {
				place: settings.place,
				time: Number(new Date()),
				items: items
			};

			// Store
			return SaveToLocalStorage(GetLocalStorageKey(), JSON.stringify(saveObj));
		}

		function SaveToLocalStorage (key, data) {
			try {
				localStorage.setItem(key, data);
				return true;
			}
			catch (e) {}

			return false;
		}

		// Merge new array with client array
		function MergeWithCache (newItems) {

			var keys = [],
				len = items_all.length,
				len_new = newItems.length,
				item;

			// Create array of keys of the existing array
			for (var i = 0; i < len; i++) {
				keys.push(items_all[i].t);
			}

			// Add the entries that does not exist in items_all
			for (var i = 0; i < len_new; i++) {
				item = newItems[i];
				if (keys.indexOf(item.t) === -1) {
					items_all.push(item);
				}
			}
			
			// Sort by date asc
			items_all.sort(function (a, b) {
				return Number(a.date) - Number(b.date);
			});

			return items_all;
		}

		// Round helper
		function Round (number, decimals) {
			var pow = Math.pow(10, decimals);
			return parseInt(number * pow) / pow;
		}

		// The local storage key
		function GetLocalStorageKey () {
			return settings.localStorageKey + "_" + settings.place;
		}

		function CreateDateKey (date) {
			return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
		}

		function CreateDateKeyDb (date) {
			return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
		}

		function GetCurrent () {
			return items_current;
		}

		function GetCurrentLength () {
			return items_current.length;
		}

		function GetAll () {
			return items_all;
		}

		function StoreLastImage () {

			return;

			if (!weather.image_url) {
				setTimeout(StoreLastImage, 25);
				return;
			}

			var lastSnapshot = items_all[items_all.length - 1];

			if (!weather.$.imageCanvas) {
				weather.$.imageCanvas = $("<canvas class='image-binary' />");
				weather.$.imageCanvas.appendTo(weather.$.app);
			}

			var ctx = weather.$.imageCanvas[0].getContext("2d");
			var $img = $("<img class='image-binary-helper' src='" + weather.image.resolve(lastSnapshot.img_url, false) + "' />").appendTo(weather.$.app);
			
			$img.load(function () {

				weather.$.imageCanvas[0].width = weather.imageWidth;
				weather.$.imageCanvas[0].height = weather.imageHeight;

				ctx.drawImage($img[0], 0, 0);

				// The image must be from same origin if attempting to call toDataURL
				try {
					var imageData = weather.$.imageCanvas[0].toDataURL("image/jpeg");
					
					var lastImage = {
						img: lastSnapshot.img_url,
						data: imageData
					};

					SaveToLocalStorage(GetLocalStorageKey() + "_image", JSON.stringify(lastImage));
				}
				catch (e) {}

				setTimeout(function () {
					$img.remove();
				}, 100);
			});
		}

		function GetStoredImage () {
			var last = {};

			try {
				var item = localStorage.getItem(GetLocalStorageKey() + "_image");
				if (item) {
					last = JSON.parse(item);
				}
			}
			catch (e) {}

			return last;
		}

		return {
			get: Get,
			getCurrent: GetCurrent,
			getCurrentLength: GetCurrentLength,
			getAll: GetAll,
			getFromAPI: GetDataFromAPI,
			getFromClient: GetDataFromClient,
			getStoredImage: GetStoredImage
		}
	})();
})(window, jQuery);