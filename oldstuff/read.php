<?php
# thoughts about this file. Currently i only validate dates by checking that they are in fact legal dates.
# I don't check to see whether or not the date is older than today or too far in the future. So, someone
# could possibly book hours in past days or a year in the future. Im not sure this is even a problem, but it exists.

# Parameters: "date", "lane" (optional)
# Type: POST
# This file reads reservations for a certain day from the database and outputs them in JSON format
# If the parameter lane is set to a valid int, it will do so for a certain lane.

# this is the format used for dates
$format = "Y-m-d";
# this is the number of bookable lanes
$num_lanes = 8;

include_once "./config/database.php";

# make sure the date parameter is set and valid
if (isset($_POST["date"]) && date_validator($_POST["date"])) {
    $db = connectToDB();
    # now check if the lane parameter is set.
    if (isset($_POST["lane"]) && $_POST["lane"] <= $num_lanes && $_POST["lane"] >= 1) {
        # query the database.
        $stmt = $db->prepare("SELECT r.start AS start, r.end AS end FROM reservations AS r WHERE r.day=:day AND r.lane=:lane");
        $stmt->bindParam(":day", $_POST["date"]);
        $stmt->bindParam(":lane", $_POST["lane"]);
    } else {
        # lane parameter is not set or invalid, so just query based on day
        $stmt = $db->prepare("SELECT r.start AS start, r.end AS end, r.lane As lane FROM reservations AS r WHERE r.day=:day");
        $stmt->bindParam(":day", $_POST["date"]);
    }
    # execute the query
    $stmt->execute();
    # fetch all the results into a php array, then convert to json and send back to user.
    print(json_encode($stmt->fetchAll()));
    unset($db);
} else {
    header("HTTP/1.1 400 Invalid Request");
    header("Content-type: text/plain");
    echo("Invalid date parameter.");
}



function date_validator($date) {
    global $format;
    $d = new DateTime($date);
    if (!($d && $d->format($format) === $date)) {
        return false;
    }
    return true;
}

?>