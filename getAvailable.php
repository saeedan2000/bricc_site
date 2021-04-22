<?php

error_reporting(E_ALL);
ini_set('display_errors', 'On');


# BIG ISSUE: actually idk but currently we dont validate duration of booking as in end - start.
# so possible somebody books 24 hours in one go?
include_once "./config/database.php";
# We have to validate everything that is coming from the client side
# that means the date, the start time, the lane type, the end time
if (isset($_POST) && isset($_POST["date"]) && isset($_POST["startTime"]) && 
    isset($_POST["endTime"]) && isset($_POST["laneType"])) {

    #validate parameters
    $start = intval($_POST["startTime"]);
    $end = intval($_POST["endTime"]);
    if (validateDate($_POST["date"]) && $start <= 23 && $start >= 0 && 
        $end > $start && $end <= 24 && validateLaneType($_POST["laneType"])) {
        
        # here goes the logic for recommending potential reservations to client
        # first, get all reservations that clash with date, time, laneType
        # also, find out how many lanes there are (of type chosen)
        $db = connectToDB();
        if ($_POST["laneType"] == 'Both') {
            $lanes = $db->query('SELECT * FROM Lanes');
            $clashes = $db->prepare('SELECT r.laneID FROM Reservations AS r WHERE r.date = ? AND r.startTime < ? AND r.endTime > ?');
            $clashes->execute(array($_POST["date"], $end, $start));
        } else {
            $lanes = $db->prepare('SELECT * FROM Lanes AS l WHERE l.type = ?');
            $lanes->execute(array($_POST["laneType"]));
            $clashes = $db->prepare('SELECT r.laneID FROM Reservations AS r, Lanes
                AS l WHERE r.laneID = l.laneID AND l.type = ? AND r.date = ? AND r.startTime < ? AND r.endTime > ?');
            $clashes->execute(array($_POST["laneType"], $_POST["date"], $end, $start));
        }
        // build set (actually an assoc array with keys as elements of set) of lanes with clashes
        $clashLanes = array();
        foreach ($clashes as $clash) {
            $clashLanes[$clash["laneID"]] = true;
        }
        // for any lanes that dont have a clash, add slot to ret
        $ret = array();
        foreach ($lanes as $lane) {
            if (!$clashLanes[$lane["laneID"]]) {
                array_push($ret, array($lane["type"] . " " . $lane["number"], $start, $end));
            }
        }
        
        header("Content-Type: application/json");
        print(json_encode($ret));
        //header("Content-Type: application/json");
        //print(json_encode($ret));
    } else {  // debug stuff here can be removed
        header("HTTP/1.1 400 Bad Request1" . $reason);
        header("Content-Type: text/plain");
        echo("Received Bad Parameters from Client");
        die();
    }
        
} else {
    header("HTTP/1.1 400 Bad Request2");
    header("Content-Type: text/plain");
    print ("Received invalid parameters from client.");
    die();
}

# take a date given by the client and makes sure it is valid
# meaning it is in correct format and also >= todays date in seattle
function validateDate($date, $format = 'Y-m-d') {
    date_default_timezone_set('America/Los_Angeles');
    $today = DateTime::createFromFormat($format, date($format));
    $d = DateTime::createFromFormat($format, $date);
    # if not a valid date, then return false
    if (!($d && $d->format($format) === $date)) {
        return false;
    }
    # make sure clients date is not before today
    if ($d < $today) {
        return false;
    }
    return true;
}

#validates late type given by the client
function validateLaneType($type) {
    return ($type == 'Indoor' || $type == 'Outdoor' || $type == "Both");
}
?>