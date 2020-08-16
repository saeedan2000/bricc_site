"use strict";
(function() {
    let monthNames = ["January", "February", "March",
                        "April", "May", "June", "July",
                        "August", "September", "October",
                        "November", "December"];
    
    // stores the date chosen by the user, format yyyy-mm-dd
    let date;

    // store todays date as an array of year, month, day (NOT ASSOC)
    let today;
    // store normal hours (start and num hours)
    let normalHours;
    // store any days with special hours (each date has a start and num hours)
    let specialHours


    // shorthand
    function $(id){
        return document.getElementById(id);
    }

    // take a string or an int of consisting of 1 or 2 numbers, and format it
    // to two numbers. eg 1 -> 01
    function f(input) {
        if (input.length == 1) {
            return "0" + input;
        }
        return input;
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
    
    // This function makes an AJAX get request to pickerInfo.php when the page is first loaded
    function ajaxInitInfo() {
        let url = "http://briccwebapp-env.eba-ekqffpav.us-east-1.elasticbeanstalk.com/pickerInfo.php"; 
        fetch(url)
           .then(checkStatus)
           .then(function(responseText) {
                let initInfo = JSON.parse(responseText);
                today = initInfo.today.split("-");
                normalHours = initInfo.default;
                specialHours = initInfo.specialHours;
                calendar(parseInt(today[1]) - 1, parseInt(today[0]));
           })
           .catch(function(error) {
               console.log(error);
           });
    }

    // takes a month (0-11) and a year and reloads the calendar for that month
    function calendar(month, year) {
        // clear any existing calendar
        let table = $("calendarTable");
        table.textContent = '';

        let dayOffset = new Date(year, month).getDay();
        let daysInMonth = 32 - (new Date(year, month, 32)).getDate();
        let cur = false;
        if (today[1] - 1 == month && today[0] == year) {
            cur = true;
        }
        let curRow = document.createElement("tr");
        // fill in empty table cells so that first day will be in correct
        // column, based on what day of the week it is.
        for (let i = 0; i < dayOffset; i++) {
            curRow.appendChild(document.createElement("td"));
        }
        // now add a table cell for each day of the month
        for (let i = 1; i <= daysInMonth; i++) {
            let td = document.createElement("td");
            td.textContent = i;
            td.onclick = clickDay;
            // if day is today, make it look special
            if (cur && today[2] == i) {
                td.className = "today";
            }
            curRow.appendChild(td);
            // if row is full, append to table and go to next row
            if (curRow.childElementCount == 7) {
                table.append(curRow);
                // if we are not done, create a new row
                if (i != daysInMonth) {
                    curRow = document.createElement("tr");
                }
            }
        }
        // now add more empty table cells if necessary to finish the last row
        while (curRow.childElementCount != 7) {
            curRow.appendChild(document.createElement("td"));
        }
        // if the row hasn't been appended, append it
        if (curRow.parentNode == null) {
            table.appendChild(curRow);
        }

        // set the month display correctly
        $("selectedMonth").textContent = monthNames[month] + " " + year;
    }

    // onclick handler for a day tile
    function clickDay() {
        let oldSelected = document.querySelector(".selectedDayTile");
        if (oldSelected != null) {
            oldSelected.classList.remove("selectedDayTile");
        }
        this.classList.add("selectedDayTile");
        let d = f(this.textContent);
        let monthYear = $("selectedMonth").textContent.split(" ");
        let month = f(String(monthNames.indexOf(monthYear[0]) + 1));
        let display = month + " / " + d + " / " + monthYear[1];
        $("selectedDate").textContent = display;
        date = monthYear[1] + "-" + month + "-" + d;

        // populate time picker with available times for this day, then make
        // time section appear
        // first clear old hours
        $("amTable").textContent = "";
        $("pmTable").textContent = "";
        loadHours(date);
        $("timeContainer").style.display = "block";
    }

    // this function is onclick for prev month arrow in calendar. It will reload the calendar
    // for the previous month, provided we are not on the current month.
    function prevMonth() {
        let monthYear = $("selectedMonth").textContent.split(" ");
        let month = monthNames.indexOf(monthYear[0]);
        let year = parseInt(monthYear[1]);
        // dont do anything if trying to go into the past
        if (parseInt(today[0]) < year || parseInt(today[1]) < month + 1) {
            if (month == 0) {
                year--;
                month = 11;
            } else {
                month--;
            }
            calendar(month, year);
        }    
    }

    function nextMonth() {
        let monthYear = $("selectedMonth").textContent.split(" ");
        let month = monthNames.indexOf(monthYear[0]);
        let year = parseInt(monthYear[1]);
        if (month == 11) {
            year++;
            month = 0;
        } else {
            month++;
        }
        calendar(month, year);
    }

    // reloads a new time picker with available times for a given day
    // clears out old hours, then adds new
    function loadHours(date) {
        let start
        let numHours;
        let specialFlag = false;
        let s;
        // check if this date has special hours
        if (specialHours != null) {
            for (s of specialHours) {
                if (s.date == date) {
                    specialFlag = true;
                    start = parseInt(s.start);
                    numHours = parseInt(s.num_hours);
                }
            }
        }
        // if not use normal hours
        if (!specialFlag) {
            start = parseInt(normalHours.start);
            numHours = parseInt(normalHours.num_hours);
        }
        // start filling in hours
        let type;
        if (start < 11) {
            type = "AM";
        } else {
            type = "PM";
        }
        let hour;
        let amRow = document.createElement("tr");
        let pmRow = document.createElement("tr");
        let amIndex = 0;
        let pmIndex = 0;
        let numHoursPerRow = 5; // THIS IS MODIFIABLE TO CHANGE APPEARANCE
        let minRowsPerTable = 3; // ALSO MODDABLE
        for (let i = start + 1; i <= start + numHours; i++) {
            // if we have filled a row, put it in table and create new row 
            if (amIndex == numHoursPerRow) {
                amIndex = 0;
                $("amTable").appendChild(amRow);
                amRow = document.createElement("tr");
            }
            if (pmIndex == numHoursPerRow) {
                pmIndex = 0;
                $("pmTable").appendChild(pmRow);
                pmRow = document.createElement("tr");
            }
            // just figures out what hour we are currently on
            hour = i % 12;
            if (hour == 0) {
                hour = 12;
                if (type == "AM") {
                    type = "PM";
                } else {
                    type = "AM";
                }
            }
            // make table cell and add it to correct row
            let hr = document.createElement("td");
            hr.textContent = hour + ":00";
            hr.onclick = clickHour;
            if (type == "AM") {
                amRow.appendChild(hr);
                amIndex++;
            } else {
                pmRow.appendChild(hr);
                pmIndex++;
            }
        }
        // add any partially finished rows to table
        if (amIndex > 0) {
            for (let i = amIndex + 1; i <= numHoursPerRow; i++) {
                let filler = document.createElement("td");
                filler.classList.add("fillerCell");
                amRow.appendChild(filler);
            }
            $("amTable").appendChild(amRow);
        }
        if (pmIndex > 0) {
            for (let i = pmIndex + 1; i <= numHoursPerRow; i++) {
                let filler = document.createElement("td");
                filler.classList.add("fillerCell");
                pmRow.appendChild(filler);
            }
            $("pmTable").appendChild(pmRow);
        }
        // if necessary, add more rows to the am table to fill space
        let numAmRows = $("amTable").querySelectorAll("tr").length;
        if (numAmRows < minRowsPerTable) {
            for (let i = numAmRows; i < minRowsPerTable; i++) {
                let row = document.createElement("tr");
                for (let x = 0; x < numHoursPerRow; x++) {
                    let filler = document.createElement("td");
                    filler.classList.add("fillerCell");
                    row.appendChild(filler);
                }
                $("amTable").appendChild(row);
            }
        } // now same for pm table
        let numPmRows = $("pmTable").querySelectorAll("tr").length;
        if (numPmRows < minRowsPerTable) {
            for (let i = numPmRows; i < minRowsPerTable; i++) {
                let row = document.createElement("tr");
                for (let x = 0; x < numHoursPerRow; x++) {
                    let filler = document.createElement("td");
                    filler.classList.add("fillerCell");
                    row.appendChild(filler);
                }
                $("pmTable").appendChild(row);
            }
        }
    }

    // This function swaps the displayed hours between AM and PM
    function toggleTime() {
        let amTable = $("amTable");
        let pmTable = $("pmTable");
        let selectedAmpm = $("selectedAmpm");
        if (selectedAmpm.textContent == "AM") {
            selectedAmpm.textContent = "PM";
            amTable.style.display = "none";
            pmTable.style.display = "table";
        } else {
            selectedAmpm.textContent = "AM";
            amTable.style.display = "table";
            pmTable.style.display = "none";
        }
    }

    // this function is an event handler for the hour tiles. It makes the tile
    // look selected while unselecting any older selections, then populates the display
    // also, it makes sure this hour + the duration currently chosen is not out of bounds
    function clickHour() {
        let oldSelected = document.querySelector(".selectedHourTile");
        if (oldSelected != null) {
            oldSelected.classList.remove("selectedHourTile");
        }
        this.classList.add("selectedHourTile");
        $("selectedHour").textContent = this.textContent + " " + $("selectedAmpm").textContent;
        
        // make load button visible
        $("loadContainer").style.display = "block";

        // duration check 
        // for now im too lazy to write a check, just going to reset to 1 every time
        // might be slightly annoying for user
        $("selectedDuration").textContent = "1 hour(s) long";
    }

    // this function is an event handler for the increase duration button
    // it checks the current hour and if it is set, makes sure it + duration
    // is not out of bounds, then updates the duration display.
    function increaseDuration() {
        let maxDuration = 4; // MODDABLE
        let durationDisplay = $("selectedDuration");
        let duration = parseInt(durationDisplay.textContent);
        if (duration < maxDuration) {
            let hr = parseInt($("selectedHour").textContent);
            // if no hour is selected then there is no problem updating duration
            if (isNaN(hr)) {
                durationDisplay.textContent = duration + 1 + " hour(s) long";
            } else { // hour is selected, make sure it works with the duration
                // convert hr to 0-23
                if ($("selectedHour").textContent.split(" ")[1] == "PM") {
                    if (hr == 12) {
                        hr = 0;
                    }
                    hr += 12;
                } else {
                    if (hr == "12") {
                        hr = 0;
                    }
                }
                if (hr + duration + 1 <= parseInt(normalHours.start) + parseInt(normalHours.num_hours)) {
                    durationDisplay.textContent = (duration + 1) + " hour(s) long";
                }
            }
        }
    }

    // onclick for decrease duration button, simply decrease if > 1
    function decreaseDuration() {
        let durationDisplay = $("selectedDuration");
        let duration = parseInt(durationDisplay.textContent);
        if (duration > 1) {
            durationDisplay.textContent = (duration - 1) + " hour(s) long";
        }
    }

    // onclick handler for lane type buttons, if one is clicked, unselect the old 
    // selected lane type and make this one selected.
    function clickLaneType() {
        let oldSelected = document.querySelector(".selectedLaneTypeTile");
        oldSelected.classList.remove("selectedLaneTypeTile");
        this.classList.add("selectedLaneTypeTile");
    }

    // this function is the onclick handler for the load button. It compiles all the user's choices
    // into an object, then sends that info to the server using an ajax call
    function clickLoad() {
        // this next bit makes the button disappear for a while, spam protection
        this.style.display = "none";
        $("loadText").style.display = block;
        setTimeout(function(){
            $("loadButton").style.display = "block";
            $("loadText").style.display = "none";
        }, 3000);
        // prepare post data
        let data = new FormData();
        let date = $("selectedDate").textContent.split(" / ");
        data.append("date", date[2] + "-" + date[0] + "-" + date[1]);
        let time = $("selectedHour").textContent.split(" ");
        let hr = parseInt(time[0]);
        if (hr == 12) {
            hr = 0;
        }
        if (time[1] == "PM") {
            hr += 12;
        }
        data.append("startTime", hr);
        data.append("endTime", parseInt($("selectedDuration").textContent) + hr);
        data.append("laneType", document.querySelector(".selectedLaneTypeTile").textContent);
        console.log("date: " + date[2] + "-" + date[0] + "-" + date[1]);
        console.log("startTime: " + hr + ", endTime: " + (parseInt($("selectedDuration").textContent) + hr));
        let url = "http://briccwebapp-env.eba-ekqffpav.us-east-1.elasticbeanstalk.com/getAvailable.php";
        ajaxPost(data, url, loadBookable, console.log);
    }

    // sends users choices to server in AJAX POST request
    function ajaxPost(data, url, handleResponse, handleError) {
        fetch(url, {method: "POST", body: data})
           .then(checkStatus)
           .then(function(responseText) {
                handleResponse(responseText)
           })
           .catch(function(error) {
               handleError(error);
           });
    }

    function loadBookable(response) {
        let lanes = JSON.parse(response);
        let flag = false;
        for (let l of lanes) {
            if (parseInt(l.endTime) > parseInt(l.startTime)) {
                flag = true;
            }
        }
        if (flag) {
            $("loadSuccessText").style.display = "block";
        } else {
            $("loadFailText").style.display = "block"
        }
        console.log(JSON.parse(response));
    }

    // IDEA: need spam protection for load button, maybe make it disappear into a loading... text for a bit
    // IDEA: currently if client chooses a day in the past, server throws 400 error, client gets no feedback. Improve?

    window.onload = function() {
        ajaxInitInfo();
        $("prevMonthButton").onclick = prevMonth;
        $("nextMonthButton").onclick = nextMonth;
        let timeButtons = document.querySelectorAll(".timeButton");
        timeButtons[0].onclick = toggleTime;
        timeButtons[1].onclick = toggleTime;
        $("durationIncreaseButton").onclick = increaseDuration;
        $("durationDecreaseButton").onclick = decreaseDuration;
        let laneTypes = $("laneTypeTable").querySelectorAll("td");
        for (let x of laneTypes) {
            x.onclick = clickLaneType;
        }
        $("loadButton").onclick = clickLoad;
    }
})();
