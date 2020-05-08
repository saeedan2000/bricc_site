"use strict";
(function() {
    // Currently my biggest concerns about this file in general are that 
    // A. the number of days in the calendar is hardcoded in to be the number of 
    //    buttons in the booking.html file
    // B. even worse, the number of hours bricc is open is hardcoded.
    //    for now, im using a couple bad global variables for this
    let startTime = 6;
    let numHours = 16;


    // this variable holds the value of the day selected by the user
    let date;

    // shorthand
    function $(id){
        return document.getElementById(id);
    }

    // check for server response.
    function checkStatus(response) {
        if (response.status >= 200 && response.status < 300) {
            return response.text();
        } else {
            return Promise.reject(new Error(response.status +
                                            ": " + response.statusText));
        }
    }
    
    // This function uses an AJAX fetch to get information about the BRICC
    // calendar from the web server.
    function ajaxCalendar() {
        let url = "http://bricc.us-east-2.elasticbeanstalk.com/calendar.php"; 
        fetch(url)
           .then(checkStatus)
           .then(loadCalendar)
           .catch(function(error) {
               //error: do something with error
               console.log(error);
           });
    }

    // this function takes the response text from the calendar.php file in the web server
    // and uses the information in it to populate the calendar buttons with text. It also
    // set the onclick handler for those buttons to the function selectDay()
    function loadCalendar(responseText) {
        let calInfo = JSON.parse(responseText);
        let calButtons = document.getElementsByClassName("calButton");
        for (let i = 0; i < calButtons.length; i++) {
            calButtons[i].textContent = (calInfo[i]).text;
            calButtons[i].value = (calInfo[i]).value;
            calButtons[i].onclick = selectDay;
        }
    }

    // unhide the lane selection drop down list, and set the date global variable
    function selectDay() {
        // temporary
        console.log(this.value);
        clearHours();
        date = this.value;
        $("lanes").style.display = "block";
    }

    // this function uses AJAX fetch to get all reservations on the given lane on the given day
    function ajaxReservations(data) {
        let url = "http://bricc.us-east-2.elasticbeanstalk.com/read.php"; 
        fetch(url, {method: "POST", body: data})
           .then(checkStatus)
           .then(loadHours)
           .catch(function(error) {
               //error: do something with error
               console.log(error);
           });
    }


    // this function builds validates the user's choice of lane and builds the 
    // parameters required to make an API call in order to get all reservations
    // on that lane on the selected day.
    function selectLane() {
        clearHours();
        let val = parseInt(this.value, 10);
        if (val && val >= 1 && val <= 8) {
            let data = new FormData();
            data.append("date", date);
            data.append("lane", val);
            ajaxReservations(data);
        }
    }

    // this function takes an integer from 1 - 24 (an hour in the 24 hour clock) and 
    // converts it to a string representing a time in the 12 hour clock, for example "6:00 am"
    // it assumes a valid parameter.
    function toTwelve(hr) {
        let suffix = "am";
        if (hr >= 12 && hr < 24) {
            suffix = "pm";
        }
        if (hr > 12) {
            hr = hr - 12
        }
        return hr + ":00 " + suffix;
    }

    // this function loads all available hours for the selected lane and day on the page
    function loadHours(responseText) {
        let res = JSON.parse(responseText);
        console.log(res);
        let hrContainer = $("hours");
        hrContainer.style.display = "block";
        for (let i = 0; i < 16; i++) {
            let hr = i + startTime;
            let clashFlag = false;
            for (let x = 0; x < res.length; x++) {
                if (hr < (res[x]).end && hr >= (res[x]).start) {
                    clashFlag = true;
                }
            }
            if (!clashFlag) {
                let hrBox = document.createElement("button");
                hrBox.textContent = toTwelve(hr);
                hrBox.value = hr;
                hrContainer.appendChild(hrBox);
            }
        }
    }

    // this function clears all hours currently displayed in the available hours part of the page
    function clearHours() {
        let hrs = $("hours");
        while(hrs.firstChild) {
            hrs.removeChild(hrs.lastChild);
        }
    }
   
    window.onload = function() {
        // load calendar using information from web server
        ajaxCalendar();
        $("laneSelect").onchange = selectLane;
    }
})();
