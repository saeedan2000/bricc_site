<?php

error_reporting(E_ALL);
ini_set('display_errors', 'On');

// represents a free slot of time for a certain lane
class freeSlot {
    public string $laneName;
    public int $start;
    public int $end;

    public function __construct(string $laneName, int $start, int $end) {
        $this->laneName = $laneName;
        $this->start = $start;
        $this->end = $end;
    }
}


# BIG ISSUE: actually idk but currently we dont validate duration of booking as in end - start.
# so possible somebody books 24 hours in one go?
# SPECIAL HOURS DOES NTO WORK RN ONLY DEFAULT HOURS
# NOTE: MAY CURRENTLY RECOMMEND HOURS BEFORE CURRENT TIME
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

        header("Content-Type: application/json"); // for debug

        // build set (actually an assoc array with keys as elements of set) of lanes with clashes
        $clashLanes = array();
        foreach ($clashes as $clash) {
            $clashLanes[$clash["laneID"]] = true;
        }
        // for any lanes that dont have a clash, add slot to ret
        $ret = array();
        // maps from laneid to lane name
        $laneInfo = array();
        $index = 0;
        foreach ($lanes as $lane) {
            $laneInfo[$lane["laneID"]] = $lane["type"] . " " . $lane["number"];
            if (!isset($clashLanes[$lane["laneID"]])) {
                $ret[$index] = array($laneInfo[$lane["laneID"]], $start, $end);
                $index++;
            }
        }

        // now loop through the lanes with clashes, and for each, add its free blocks to the priority queue
        $que = new SplPriorityQueue(); // contains free blocks;
        foreach ($clashLanes as $laneID => $junk) {
            getFreeSlots($que, intval($laneID), $_POST["date"], $db, $start, $end, $laneInfo);
        }
        // now pull the right number of freeSlots from the priority queue and put in ret
        for ($i = 0; $i < count($clashLanes); $i++) {
            $cur = $que->extract();
            array_push($ret, array($cur->laneName, $cur->start, $cur->end));
        }

        print(json_encode($ret));
    } else {  // debug stuff here can be removed
        header("HTTP/1.1 400 Bad Request1");
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

// function which calculates the weight of a free slot for the priority queue
function slotValue(freeSlot $slot, int $start, int $end) {
    $durationDiff = abs(($slot->end - $slot->start) - ($end - $start)); // prob dont need abs since it will always be less
    $timeDiff = 0.0;
    if ($slot->start < $start) {
        $timeDiff = $start - $slot->start;
    } elseif ($slot->end > $end + 1) {
        $timeDiff = $slot->end - ($end + 1);
    }
    return 100.0 - (0.7 * $durationDiff) - (1.0 * $timeDiff);
}

// trims the free slot down to what the customer wants
function trimFreeSlot (freeSlot $slot, int $start, int $end) {
    $duration = $end - $start;
    $slotDuration = $slot->end - $slot->start;
    if ($slot->end - $slot->start <= $duration) {
        return;
    } else {
        // trim from bottom
        if ($slot->start < $start) {
            $slot->start += min(($slot->end - $slot->start) - $duration, $start - $slot->start);
        }
        // trim from top
        $slot->end -= ($slot->end - $slot->start) - $duration;
    }
}

// fills que with all free slots for given lane in given day
function getFreeSlots(SplPriorityQueue $que, string $laneID, string $date, PDO $db, int $start, int $end, array $laneInfo) {
    $reservations = $db->prepare("SELECT r.startTime, r.endTime FROM Reservations AS r WHERE r.laneID = ? AND r.date = ?");
    $reservations->execute(array($laneID, $date));
    $pdoSt = $db->query("SELECT h.start, h.num_hours FROM Hours AS h WHERE h.date = '1000-01-01'");
    // need to know hours
    $hours = $pdoSt->fetch(PDO::FETCH_ASSOC);

    $lastEnd = intval($hours["start"]);
    foreach($reservations as $reservation) {
        if (intval($reservation["startTime"]) > $lastEnd) {
            // there is a free block
            $freeSlot = new freeSlot($laneInfo[$laneID], $lastEnd, intval($reservation["startTime"]));
            // trim the free slot down to size;
            trimFreeSlot($freeSlot, $start, $end);
            $que->insert($freeSlot, slotValue($freeSlot, $start, $end));
        }
        $lastEnd = $reservation["endTime"];
    }
    // take care of edge case where free slot is after last reservation
    $closingTime = intval($hours["start"]) + intval($hours["num_hours"]);
    if ($closingTime > $lastEnd) {
        $freeSlot = new freeSlot($laneInfo[$laneID], $lastEnd, $closingTime);
        // trim the free slot down to size;
        trimFreeSlot($freeSlot, $start, $end);
        // add to que
        $que->insert($freeSlot, slotValue($freeSlot, $start, $end));
    }
}

# take a date given by the client and makes sure it is valid
# meaning it is in correct format and also >= todays date in seattle
function validateDate(string $date, string $format = 'Y-m-d') {
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
function validateLaneType(string $type) {
    return ($type == 'Indoor' || $type == 'Outdoor' || $type == "Both");
}
?>