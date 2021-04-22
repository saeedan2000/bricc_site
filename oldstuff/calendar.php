<?php
# this file contains the php code which outputs the information used to populate the bricc
# calendar. It outputs a json array of objects. Each object has two fields, text (the text
# on the calendar tile, visible to the user), and value, which is a date, used to query the
# database.

header("Content-Type: application/json");
# the number of tiles in the calendar
$calendar_size = 30;
$month_lengths = array(31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);
$month_names = array("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug",
"Sep", "Oct", "Nov", "Dec");

global $month_names;
global $calendar_size;
date_default_timezone_set('America/Los_Angeles');
$date = getdate();
$day = $date['mday'];
$month = $date['mon'];
$year = $date['year'];
$days_in_month = getDaysInMonth($month, $year);
# the array which we will convert to json and send back to the client
$dates_arr = array();
for ($i = 0; $i < $calendar_size; $i++) {
    if ($day <= $days_in_month) {
                # add info to the dates array
                $dates_arr[$i] = array(
                    "text" => $month_names[$month - 1] . " " . $day,
                    "value" => $year . "-" . str_pad($month, 2, '0', STR_PAD_LEFT) .
                    "-" . str_pad($day, 2, '0', STR_PAD_LEFT)
                );
    } else {
        # day is beyond end of month, time to move to next month
        $day = 1;
        if ($month == 12) {
            $month = 1;
            $year += 1;
        } else {
            $month += 1;
        }
        $days_in_month = getDaysInMonth($month, $year);
        $dates_arr[$i] = array(
            "text" => $month_names[$month - 1] . " " . $day,
            "value" => $year . "-" . str_pad($month, 2, '0', STR_PAD_LEFT) .
            "-" . str_pad($day, 2, '0', STR_PAD_LEFT)
            );
    }
    $day += 1;
}
# now, convert the array to json and echo it back to the client.
print(json_encode($dates_arr));

# This function returns the number of days in the given month of the given year
function getDaysInMonth($month, $year) {
    global $month_lengths;
    if ($month != 2) {
        return $month_lengths[$month - 1];
    } else {
        # Month is Feb, must check for leap year
        if ($year % 4 == 0) {
            if ($year % 100 == 0) {
                if ($year % 400 != 0) {
                    # Not a Leap Year
                    return $month_lengths[$month - 1];
                }
            }
            # is a leap year
            return $month_lengths[$month - 1] + 1;
        }
        # Not a Leap Year
        return $month_lengths[$month - 1];
    }
}
?>