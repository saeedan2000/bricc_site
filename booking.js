"use strict";
(function() {
    let monthNames = ["January", "February", "March",
                        "April", "May", "June", "July",
                        "August", "September", "October",
                        "November", "December"];
    
    // stores the date chosen by the user, format yyyy-mm-dd
    let date;

    // store todays date as an array of year, month, day
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
    
    // This function makes an AJAX request to pickerInfo.php when the page is first loaded
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

    function prevMonth() {
        let monthYear = $("selectedMonth").textContent.split(" ");
        let month = monthNames.indexOf(monthYear[0]);
        let year = parseInt(monthYear[1]);
        if (month == 0) {
            year--;
            month = 11;
        } else {
            month--;
        }
        calendar(month, year);
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
                let filler = document.createElement("td");
                filler.classList.add("fillerCell");
                row.appendChild(filler);
                $("amTable").appendChild(row);
            }
        } // now same for pm table
        let numPmRows = $("pmTable").querySelectorAll("tr").length;
        if (numPmRows < minRowsPerTable) {
            for (let i = numPmRows; i < minRowsPerTable; i++) {
                let row = document.createElement("tr");
                let filler = document.createElement("td");
                filler.classList.add("fillerCell");
                row.appendChild(filler);
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

    function clickHour() {
        let oldSelected = document.querySelector(".selectedHourTile");
        if (oldSelected != null) {
            oldSelected.classList.remove("selectedHourTile");
        }
        this.classList.add("selectedHourTile");
        $("selectedHour").textContent = this.textContent + " " + $("selectedAmPm").textContent;
    }
   
    window.onload = function() {
        ajaxInitInfo();
        $("prevMonthButton").onclick = prevMonth;
        $("nextMonthButton").onclick = nextMonth;
        let timeButtons = document.querySelectorAll(".timeButton");
        timeButtons[0].onclick = toggleTime;
        timeButtons[1].onclick = toggleTime;
    }
})();
