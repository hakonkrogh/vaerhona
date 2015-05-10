;(function (window, $, undefined) {
	weather.chart = (function () {

		var types = {
			tempOutside: {
				dataID: "temperature-outside",
				name: "Temperatur",
				valueSuffix: "°C"
			},
			pressure: {
				dataID: "pressure",
				name: "Lufttrykk",
				valueSuffix: "hPa"
			},
			humidity: {
				dataID: "humidity",
				name: "Luftfuktighet",
				valueSuffix: "%"
			}
		};

		setChartTheme();

    	// Load temperature chart
		function LoadChart () {
			
			var callback = function () {};
			var type = false;

			var arg_len = arguments.length;
			if (arg_len > 0) {
				
				if ($.isFunction(arguments[0])) {
					callback = arguments[0];
				}
				else {
					type = arguments[0];
				}

				if (arg_len > 1) {
					callback = arguments[1];
				}
			}

			var items = weather.data.getCurrent();

			// Default chart
			var typeDef = types.tempOutside;
			weather.chartTypeDef = typeDef.dataID;

			// Get dates
			var items_date = GetOnlyData(items, "date");

			// Set tickInterval
			var tickInterval = Math.floor(items_date.length / 10);
			if (window.innerWidth <= 500) {
				tickInterval = Math.floor(items_date.length / 2);
			}

			// Already initiated. Just update
			if (weather.highchart) {
				
				typeDef = types[type];
				
				var data;
				
				if (typeDef) {
					data = GetOnlyData(items, typeDef.dataID);

					weather.chartTypeDef = typeDef;
				}
				else {
					data = GetOnlyData(items, weather.chartTypeDef);
				}

				weather.highchart.series[0].setData(data);

				// Update
				weather.highchart.xAxis[0].setCategories(GetOnlyData(items, "date"));

				weather.highchart.xAxis[0].update({
					tickInterval: tickInterval,
					categories: items_date
				});
			}
			
			// Init highchart using outside temperature
			else {

				// Get temperature outside
				var items_default = GetOnlyData(items, weather.chartTypeDef);

				var $chartEl = $('#chart-canvas');
				
		        // Go!
		        $chartEl.highcharts({
		            title: false,
		            subtitle: false,
		            legend: false,
		            xAxis: {
		                tickInterval: tickInterval,
		                categories: items_date
		            },
		            series: [{
		                data: items_default
		            }],
		            yAxis: {
		                title: false,
		                plotLines: [{
		                    value: 0,
		                    width: 1,
		                    color: '#808080'
		                }]
		            }
		        });

		        weather.highchart = $chartEl.highcharts();
		    }

		    // Set serie values
		    var serie = weather.highchart.series[0];
			if (serie) {
				serie.name = typeDef.name;
				serie.tooltipOptions.pointFormat = "<b>{point.y}</b> " + typeDef.valueSuffix;
			}

	        if (callback) {
        		setTimeout(callback, 500);
        	}


			function AddHeader (arr, header) {
				arr.reverse();
				arr.push(header);
				arr.reverse();
			}

		    // Extract relevant data
			function GetOnlyData (arr, type) {
				var items = [];

				arr.map(function (item) {
					if (!item.motion) {
						switch (type) {
							case "temperature-outside":
								items.push(item.tmp_o);
								break;
							case "temperature-inside":
								items.push(item.tmp_i);
								break;
							case "pressure":
								items.push(item.prs_o);
								break;
							case "humidity":
								items.push(item.hum_o);
								break;
							case "date":
								items.push(weather.shortDateTime(new Date(item.t)));
								break;
						}
					}
				});
				
				return items;
			}
		}

		return {
			load: LoadChart
		}
	})();

	function setChartTheme () {

		/**
		 * Gray theme for Highcharts JS
		 * @author Torstein Honsi
		 */
		Highcharts.theme = {
			colors: ["#e0e0e0"],
			chart: {
				backgroundColor: "transparent",
				borderWidth: 0,
				borderRadius: 0,
				plotBackgroundColor: null,
				plotShadow: false,
				plotBorderWidth: 0
			},
			title: {
				style: {
					color: '#FFF',
					font: '16px Lucida Grande, Lucida Sans Unicode, Verdana, Arial, Helvetica, sans-serif'
				}
			},
			subtitle: {
				style: {
					color: '#DDD',
					font: '12px Lucida Grande, Lucida Sans Unicode, Verdana, Arial, Helvetica, sans-serif'
				}
			},
			xAxis: {
				gridLineWidth: 0,
				lineColor: '#999',
				tickColor: '#999',
				labels: {
					style: {
						color: '#999',
						fontWeight: 'bold'
					}
				},
				title: {
					style: {
						color: '#AAA',
						font: 'bold 12px Lucida Grande, Lucida Sans Unicode, Verdana, Arial, Helvetica, sans-serif'
					}
				}
			},
			yAxis: {
				alternateGridColor: null,
				minorTickInterval: null,
				gridLineColor: 'rgba(255, 255, 255, .1)',
				minorGridLineColor: 'rgba(255,255,255,0.07)',
				lineWidth: 0,
				tickWidth: 0,
				labels: {
					style: {
						color: '#999',
						fontWeight: 'bold'
					}
				},
				title: {
					style: {
						color: '#AAA',
						font: 'bold 12px Lucida Grande, Lucida Sans Unicode, Verdana, Arial, Helvetica, sans-serif'
					}
				}
			},
			labels: {
				style: {
					color: '#CCC'
				}
			},
			tooltip: {
				backgroundColor: "rgba(50, 50, 50, .8)",
				borderWidth: 0,
				style: {
					color: '#ccc'
				},
				pointFormat: "<b>{point.y}</b> °C"
			},

			plotOptions: {
				line: {
					marker: {
						enabled: false
					}
				}
			},

			toolbar: {
				itemStyle: {
					color: '#CCC'
				}
			},

			navigator: {
				handles: {
					backgroundColor: '#666',
					borderColor: '#AAA'
				},
				outlineColor: '#CCC',
				maskFill: 'rgba(16, 16, 16, 0.5)',
				series: {
					color: '#7798BF',
					lineColor: '#A6C7ED'
				}
			},

			// special colors for some of the demo examples
			legendBackgroundColor: 'rgba(48, 48, 48, 0.8)',
			background2: 'rgb(70, 70, 70)',
			dataLabelsColor: '#444',
			textColor: '#E0E0E0',
			maskColor: 'rgba(255,255,255,0.3)'
		};

		// Apply the theme
		var highchartsOptions = Highcharts.setOptions(Highcharts.theme);
	}
})(window, jQuery);