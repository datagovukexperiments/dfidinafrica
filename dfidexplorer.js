			var urlstem = "http://query.yahooapis.com/v1/public/yql?q=";
			var csvUrl = "http://dfidinafrica.appspot.com/static/africa.csv";
			
			var firstYear;
			var mapData;
			var countryCount;
			
		
			var tCountryLabel = $.template("<div id=\"closebutton\">close this window X</div><h2>${country}</h2>");
			var tCountryRow = $.template("<tr><td>${col1}</td><td>${col2}</td><td>${col3}</td><td>${col4}</td><td>${col5}</td><td>${col6}</td><td>${col7}</td><td>${col8}</td><td>${col9}</td><td>${col10}</td><td>${col11}</td><td>${col12}</td><td>${col13}</td></tr>");
		
			var colorarray = ['#88FF88', '#77DF77', '#66BF66', '#559F55', '#447F44', '#335F33', '#223F22', '#111F11', '#000000'];
			var legendarray = ["Education", "Health", "Social Services", "Water supply and Sanitation", "Government and Civil Society", "Economic", "Environment Protection", "Research", "Humanitarian Assistance"];
		
			
			
			
			var initYQLQueries = [{
				query: "select col0 from csv where url=\"%%\" | unique(field=\"col0\")",
				callback: "buildCountryNavigation"
			},
			{
				query: "select col1 from csv where url=\"%%\" | unique(field=\"col1\")",
				callback: "buildDateNavigation"
			}];
			
			var namedYQLQueries = {
				"loadYear": {
					query: "select * from csv where url=\"%%\" and col1=\"##\"",
					callback: "drawNewMap"
				},
				"loadCountry": {
					query: "select * from csv where url=\"%%\" and col0=\"##\"",
					callback: "drawCountryPanel"
				}
			}
					
			function buildCountryNavigation(data) {
				$.each(data.query.results.row, function(i, row) {
					$("#country_navigation").append("<li title=\""+ row.col0 +"\">" + row.col0 + "</li>");
					countryCount = i;
				});
				$("#country_navigation li").each(function () {
					var thiscountry = $(this).attr("title");
					$(this).bind("click", function () {
						exploreCountry(thiscountry);
					})
				});
			}
			
			function buildDateNavigation(data) {
				$.each(data.query.results.row, function(i, row) {
					firstYear = row.col1;
					$("#date_navigation").append("<span class=\"datenav\" title=\""+ row.col1 +"\">"+ row.col1 +"</span>");
				});
				$(".datenav").each(function () {
					$(this).bind("click", function () {
						var thisdate = $(this).attr("title");
						exploreDate(thisdate);
					});
				});
				exploreDate(firstYear);
			}

			
			function drawCountryPanel(data) {
				if (data) {
					$("#outer").prepend("<div id=\"infoboxcontainer\"></div><div id=\"infobox\"><div id=\"windowdebug\"></div><table><tbody id=\"countrytable\"><tr id=\"tablelabels\"><td>Year</td><td>Education</td><td>Health</td><td>Social Services</td><td>Water supply <br />& Sanitation</td><td>Government <br />& Civil Society</td><td>Economic</td><td>Environment Protection</td><td>Research</td><td>Humanitarian Assistance</td><td>Total Allocable</td><td>Non Sector Allocable</td><td>Total DFID Bilateral Programme</td></tr></tbody></table>");
					$('#infobox').prepend(tCountryLabel, {country: data.query.results.row[0].col0});
					var rowcolor = "second"
					$.each(data.query.results.row, function(i, row) {
						if (rowcolor == "first") {
							rowcolor = "second";
						} else {
							rowcolor = "first";
						}
						$('#countrytable').append(tCountryRow, row);
					});	
					drawTufteGraph(data, "#infobox");
					$("#closebutton").bind("click", function () {
						$("#infoboxcontainer").remove();
						$("#infobox").remove();
					});									
				}
			}
			

			function buildTufteArray(data) {
				var tuftearray = []
				var hasvalue = false;
				$.each(data.query.results.row, function(i, row) {
					var rowarray = []
					var bararray = []
					$.each(row, function(j, item) {
						jindex = parseInt(j.replace("col", ""));
						if (jindex > 1 && jindex < 11 ) {
							if (parseInt(item) == 0) {
								bararray.push(0.0);
							}
							else
							{
								bararray.push(parseInt(item));
								hasvalue = true
							}
						}
					});
					rowarray.push(bararray)
					rowarray.push({label: row.col1.toString()});
					tuftearray.push(rowarray);
				});
				tuftedict = {
					tuftearray: tuftearray, hasvalue: hasvalue
				}
				return tuftedict
			}
			
			function drawTufteGraph(data, target) {
				tuftedict = buildTufteArray(data);
				if (tuftedict.hasvalue) {
					$(target).append("<div id=\"tufte_canvas\"></div><div id=\"tufte_label\"><h4>Key</h4></div>");
					$("#tufte_canvas").tufteBar({
    					data: tuftedict.tuftearray,
						axisLabel: function(index) { 
							return this[1].label 
						},
						color: function(index, stackedIndex) { 
      						return colorarray[stackedIndex % 9] 
    					},
						barLabel:  function(index) {
            				amount = (($(this[0]).sum())* 1000);
            				return '&pound;' + $.tufteBar.formatNumber(amount);
          				}
					});
					$.each(legendarray, function(k, row) {
						$("#tufte_label").append("<div class=\"keyrow\"><div class=\"keyblock\" style=\"background-color:"+ colorarray[k] +"\"></div><div>" + legendarray[k] + "</div></div>");
					});
				}
			}

			
			function drawNewMap(data) {
				if (data) {
					drawMap(data);
				} else {
					$("#debug").append(" hmmm, no data?");
				}
			}
			
			function initialisePage() {
				$.each(initYQLQueries, function(i, action) {
					url = urlstem + escape(action.query.replace("%%", csvUrl)) + "&format=json&callback=" + action.callback;
					$.getScript(url);
				});
			}
			
			
			function exploreCountry(thiscountry) {
				action = namedYQLQueries.loadCountry;
				url = urlstem + escape(action.query.replace("%%", csvUrl).replace("##", thiscountry)) + "&format=json&callback=" + action.callback;
				$.getScript(url);
			}
			
			
			function exploreDate(thisdate) {
				action = namedYQLQueries.loadYear;
				url = urlstem + escape(action.query.replace("%%", csvUrl).replace("##", thisdate)) + "&format=json&callback=" + action.callback;
				$.getScript(url);
			}
			
			
			function drawInitMap() {
				countryCount = 1;
				drawMap(false);
				initialisePage();
			}
			
			
    		function drawMap(data) {
				var datatable = new google.visualization.DataTable();
     			datatable.addRows(countryCount + 1);
   				datatable.addColumn('string', 'Country');
     			datatable.addColumn('number', 'Spending');
				
				if (data) {
					$.each(data.query.results.row, function(i, row) {
      					datatable.setValue(i, 0, row.col0);
      					datatable.setValue(i, 1, parseFloat(row.col13));
					});
				}
				
      			var options = {};
      			options['dataMode'] = 'regions';
				options['region'] = '002';
				options['width'] = '600px';
				options['height'] = '600px';

     			var container = document.getElementById('map_canvas');
     			var geomap = new google.visualization.GeoMap(container);
      			geomap.draw(datatable, options);
				google.visualization.events.addListener( 
          			geomap, 'regionClick', function(e) { 
//						$("#debug").html(e["region"])
//						exploreCountry(e["region"]);
      			}); 
  			};
