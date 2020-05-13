"use strict";
(function() {
    let monthNames = ["January", "February", "March",
                        "April", "May", "June", "July",
                        "August", "September", "October",
                        "November", "December"];

    // shorthand
    function $(id){
        return document.getElementById(id);
    }

    /* OLD STUFF, COULD BE USEFUL LATER
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
    } */

    // takes a month (0-11) and a year and reloads the calendar for that month
    function calendar(month, year) {
        // clear any existing calendar
        let table = $("calendarTable");
        table.textContent = '';

        let dayOffset = new Date(year, month).getDay();
        let daysInMonth = 32 - (new Date(year, month, 32)).getDate();
        let cur = false;
        let curDate = new Date();
        if (curDate.getMonth() == month && curDate.getFullYear() == year) {
            cur = true;
        }
        let curRow = document.createElement("tr");
        // fill in empty table cells so that first day will be in correct
        // column, based on what day of the week it is.
        for (let i = 0; i < dayOffset; i++) {
            console.log("went in");
            curRow.appendChild(document.createElement("td"));
        }
        // now add a table cell for each day of the month
        for (let i = 1; i <= daysInMonth; i++) {
            let td = document.createElement("td");
            td.textContent = i;
            td.onclick = selectDay;
            // if day is today, make it look special
            if (cur && curDate.getDate() == i) {
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
    function selectDay() {
        let oldSelected = document.querySelector(".selectedDay");
        if (oldSelected != null) {
            oldSelected.classList.remove("selectedDay");
        }
        this.classList.add("selectedDay");
        let date = this.textContent;
        let monthYear = $("selectedMonth").textContent.split(" ");
        let month = monthNames.indexOf(monthYear[0]) + 1;
        let display = date + " / " + month + " / " + monthYear[1];
        $("selectedDate").textContent = display;
    }
   
    window.onload = function() {
        // load the calendar
        let d = new Date();
        calendar(d.getMonth(), d.getFullYear());
    }
})();
