<?php
    # We have to validate everything that is coming from the client side
    # that means the date, the time, the lane type, the duration, everything
    if (isset($_POST) && isset($_POST["date"]) && isset($_POST["time"]) && 
        isset($_POST["duration"]) && isset($_POST["laneType"])) {

        #validate parameters
        if (validateDate($_POST["date"]) && validateTime($_POST["time"]) && 
            validateDuration($_POST["duration"]) && validateLaneType($_POST["laneType"])) {
            
            header("Content-Type: application/json");
            print(json_encode($_POST));
        } else {
            #header("HTTP/1.1 400 Bad Request");
            header("Content-Type: text/plain");
            echo(validateDate($_POST["date"]);
            echo(validateTime($_POST["time"]));
            echo(validateDuration($_POST["duration"]));
            echo(validateLaneType($_POST["laneType"]));
            die();
        }
            
    } else {
        header("HTTP/1.1 400 Bad Request");
        header("Content-Type: text/plain");
        print ("Received invalid parameters from client.");
        die();
    }

    # take a date given by the client and makes sure it is valid
    function validateDate($date, $format = 'Y-m-d') {
        $d = DateTime::createFromFormat($format, $date);
        return $d && $d->format($format) === $date;
    }

    # validates a start time given by the client
    function validateTime($time) {
        if (preg_match('^[0-9][0-9]$', $time) == 1) {
            $intTime = intval($time);
            if ($intTime < 23 && $intTime >= 0) {
                return true;
            }
        }
        return false;
    }

    # validates a duration given by the client
    function validateDuration($dur) {
        if (preg_match('^[0-9]$', $dur) == 1) {
            $intDur = intval($dur);
            if ($intDur >= 1 && $intDur <= 4) {
                return true;
            }
        }
        return false;
    }

    #validates late type given by the client
    function validateLaneType($type) {
        if ($type == 'Indoor' || $type == 'Outdoor' || $type == "Both") {
            return true;
        }
        return false;
    }
?>