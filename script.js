// Tell the script to run once everything else is loaded with the document ready
$(document).ready(function() {

    $('#search-button').on('click', function(){
        var citySearch = $('#search-value').val().trim()
        weatherSearch(citySearch)
    })
    // declare variables for API and Query
    var APIKey = "&appid=89dca057e18b0dc3b39d424eee0981f9&units=imperial"
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q="
    var cityBody;
    // declare variable for search history to be stored in local storage, if there is nothing in the storage then create one
    var searchHistory = JSON.parse(window.localStorage.getItem("searchHistory")) || [];
    // if a city is already stored in the search history, display the last item searched when you load the browser again
    if (searchHistory.length > 0) {
        weatherSearch(searchHistory[searchHistory.length-1]);
      }
    // make a function to display stored searched history within the html class "history" as a list of items with added bootstrap
    function makeRow(text) {
        var li = $("<li>").addClass("list-group-item list-group-item-action").text(text);
        $(".history").append(li);
        //console.log("inside makerow: " + text)
      }
    // for loop to create a row for every search item stored
    for (var i = 0; i < searchHistory.length; i++) {
    makeRow(searchHistory[i]);
    }
    // when any city in search history list is clicked, display the info for the city with weatherSearch($this).text());
    $(".history").on("click", "li", function() {
    weatherSearch($(this).text());
    });

    // function using ajax to retrieve weather info from API for the city
    function weatherSearch(citySearch) {
        $.ajax({
            url: queryURL + citySearch + APIKey,
            method: 'GET'
        }).then(function(response){
            // if statement saying that if there's no city weather info already stored when you load the browser, push the info to the storage as a string
            if (searchHistory.indexOf(citySearch) === -1) {
                searchHistory.push(citySearch);
                window.localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
                // call function to make the listed rows
                makeRow(citySearch);
              }
            // clear previous city content 
            $("#today").empty();
            // variables for div today card with added bootstrap
            var cityHeader = $("<h3>").addClass("card-title").text(response.name + " (" + new Date().toLocaleDateString() + ")");
            var cityCard = $("<div>").addClass("card");
            var cityWind = $("<p>").addClass("card-text").text("Wind Speed: " + response.wind.speed + " MPH");
            var cityHumidity = $("<p>").addClass("card-text").text("Humidity: " + response.main.humidity + "%");
            var cityTemp = $("<p>").addClass("card-text").text("Temperature: " + response.main.temp + " °F");
            cityBody = $("<div>").addClass("card-body");
            var iconImg = $("<img>").attr("src", "http://openweathermap.org/img/w/" + response.weather[0].icon + ".png");
            var UVlat = response.coord.lat
            var UVlon = response.coord.lon
            // append temp, wind, humidity, and UV in the card
            cityHeader.append(iconImg)
            cityBody.append(cityHeader, cityTemp, cityWind, cityHumidity)
            getUVIndex(UVlat, UVlon)
            cityCard.append(cityBody)
            $("#today").append(cityCard)
            // run the getweatherForecast function
            getweatherForecast(citySearch);
        })
    }
    // function using ajax to retrieve UV info from the API for the city
    function getUVIndex(latitude, longitude) {
        $.ajax({
          type: "GET",
          url: "http://api.openweathermap.org/data/2.5/uvi?appid=89dca057e18b0dc3b39d424eee0981f9&lat=" + latitude + "&lon=" + longitude
        }).then(function(response){
            // variables for city UV info with added bootstrap
            var cityUV = $("<p>").addClass("card-text").text("UV Index: ");
            var cityUVbtn = $("<span>").addClass("btn btn-sm").text(response.value)
            // if else statements for displaying button with color values indicating level of UV severity with added bootstrap
            if (response.value < 3) {
                cityUVbtn.addClass("btn-success");
              }
              else if (response.value < 7) {
                cityUVbtn.addClass("btn-warning");
              }
              else {
                cityUVbtn.addClass("btn-danger");
              }
            // append to card body
            $("#today .card-body").append(cityUV.append(cityUVbtn))
        });
    }
    // function using ajax to retrieve weather forecast info from API
    function getweatherForecast(citySearch) {
        $.ajax({
          type: "GET",
          url: "http://api.openweathermap.org/data/2.5/forecast?q=" + citySearch + "&appid=89dca057e18b0dc3b39d424eee0981f9&units=imperial",
        }).then(function(response) {
            // when function runs, create new classes within the forecast div and append
            $("#forecast").html("<h4 class=\"mt-3\">5-Day Forecast:</h4>").append("<div class=\"row\">");
            // variable for 5 days forecast with the info retrieved from API
            var fiveForecast = response.list
            // jQuery forEach statement for grabbing the info only for the next 5 days from the weather forecast API
            fiveForecast.forEach((forecastEl, i) => {
                if (i < 5) {
                    // when forEach runs, add these variables and add bootstrap elements
                    var col = $("<div>").addClass("col-md-2");
                    var card = $("<div>").addClass("card bg-primary text-white");
                    var body = $("<div>").addClass("card-body p-2");
        
                    var title = $("<h5>").addClass("card-title").text(new Date(forecastEl.dt_txt).toLocaleDateString());
        
                    var img = $("<img>").attr("src", "http://openweathermap.org/img/w/" + forecastEl.weather[0].icon + ".png");
        
                    var p1 = $("<p>").addClass("card-text").text("Temp: " + forecastEl.main.temp_max + " °F");
                    var p2 = $("<p>").addClass("card-text").text("Humidity: " + forecastEl.main.humidity + "%");
                    // apprend everything into the body within the card within the column within the div forecast
                    col.append(card.append(body.append(title, img, p1, p2)));
                    $("#forecast .row").append(col);
                // otherwise log that the rest of the days retrieved are breaking away from the first statement      
                } else {
                    console.log("breaking")
                    return true;
                }
            })
        });
    }
})
