<?php
include_once "./config/database.php";
# We have to validate everything that is coming from the client side
# that means the date, the time, the lane type, the duration, everything
if (isset($_POST) && isset($_POST["date"]) && isset($_POST["time"]) && 
    isset($_POST["duration"]) && isset($_POST["laneType"])) {

    #validate parameters
    $time = intval($_POST["time"]);
    $dur = intval($_POST["duration"]);
    # MUST CHANGE THIS IF CHECK TO CHANGE THE MAX DURATION OF A BOOKING
    if (validateDate($_POST["date"]) && $time <= 23 && $time >= 0 && 
        $dur >= 1 && $dur <= 4 && validateLaneType($_POST["laneType"])) {
        
        # here goes the logic for recommending potential reservations to client
        # first, get all reservations that clash with date, time, laneType
        $db = connectToDB();
        if ($_POST["laneType"] == 'Both') {
            $stmt = $db->prepare('SELECT r.laneID, r.startTime, r.duration FROM Reservations AS r, Lanes
                AS l WHERE r.laneID = l.laneID AND r.date = ? AND r.startTime <= ? AND r.duration');
            $stmt->execute(array($_POST["date"]));
        } else {
            $stmt = $db->prepare('SELECT r.laneID, r.startTime, r.duration FROM Reservations AS r, Lanes
                AS l WHERE r.laneID = l.laneID AND l.type = ? AND r.date = ?');
            $stmt->execute(array($_POST["laneType"], $_POST["date"]));
        }
        # I need to know ho
        
        header("Content-Type: application/json");
        print(json_encode($_POST));
    } else {
        header("HTTP/1.1 400 Bad Request");
        header("Content-Type: text/plain");
        echo("Received Bad Parameters from Client");
        die();
    }
        
} else {
    header("HTTP/1.1 400 Bad Request");
    header("Content-Type: text/plain");
    print ("Received invalid parameters from client.");
    die();
}

# take a date given by the client and makes sure it is valid
# meaning it is in correct format and also >= todays date in seattle
function validateDate($date, $format = 'Y-m-d') {
    $d = DateTime::createFromFormat($format, $date);
    # if not a valid date, then return false
    if (!($d && $d->format($format) === $date)) {
        return false;
    }
    date_default_timezone_set('America/Los_Angeles');
    $today = DateTime::createFromFormat($format, date($format));
    # make sure clients date is not before today
    if ($d < $today) {
        return false;
    }
    return true;
}

#validates late type given by the client
function validateLaneType($type) {
    if ($type == 'Indoor' || $type == 'Outdoor' || $type == "Both") {
        return true;
    }
    return false;
}
?>