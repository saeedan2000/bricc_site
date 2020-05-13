"use strict";
(function() {
    let monthNames = ["January", "February", "March",
                        "April", "May", "June", "July",
                        "August", "September", "October",
                        "November", "December"];
    
    // stores the date chosen by the user, format yyyy-mm-dd
    let date;

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
            curRow.appendChild(document.createElement("td"));
        }
        // now add a table cell for each day of the month
        for (let i = 1; i <= daysInMonth; i++) {
            let td = document.createElement("td");
            td.textContent = i;
            td.onclick = clickDay;
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
    function clickDay() {
        let oldSelected = document.querySelector(".selectedDay");
        if (oldSelected != null) {
            oldSelected.classList.remove("selectedDay");
        }
        this.classList.add("selectedDay");
        let d = f(this.textContent);
        let monthYear = $("selectedMonth").textContent.split(" ");
        let month = f(String(monthNames.indexOf(monthYear[0]) + 1));
        let display = d + " / " + month + " / " + monthYear[1];
        $("selectedDate").textContent = display;
        date = monthYear[1] + "-" + month + "-" + d;

        // make the select day? button appear
        $("hideCalButton").style.display = "block";
    }

    function toggleCalendar() {
        let cal = $("calContainer");
        if (cal.style.display != "block") {
            cal.style.display = "block";
        } else {
            cal.style.display = "none";
        }
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

    // onclick for select day button, basically
    // hides itself and then hides the calendar.
    function hideCal() {
        this.style.display = "none";
        $("calContainer").style.display = "none";
    }
   
    window.onload = function() {
        // load the calendar
        let d = new Date();
        calendar(d.getMonth(), d.getFullYear());
        $("selectedDate").onclick = toggleCalendar;
        $("prevMonthButton").onclick = prevMonth;
        $("nextMonthButton").onclick = nextMonth;
        $("hideCalButton").onclick = hideCal;
    }
})();
