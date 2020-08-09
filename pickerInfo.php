<?php
include_once "./config/database.php";
$db = connectToDB();
# Get current date in PST
date_default_timezone_set('America/Los_Angeles');
$today = date("Y-m-d");
# get info from db
$ret = array();
$pdoSt = $db->query("SELECT h.start, h.num_hours FROM Hours AS h WHERE h.date = '1000-01-01';");
$ret["default"] = $pdoSt->fetchAll();
$pdoSt = $db->query("SELECT * FROM Hours AS h WHERE h.date >= '{$today}';");
$ret["specialHours"] = $pdoSt->fetchAll();
$ret["today"] = $today;
unset($db);
# Send response.
header("Content-Type: application/json");
print(json_encode($ret));
?>