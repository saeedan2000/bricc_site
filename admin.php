<?php
include_once "./config/database.php";

$db = connectToDB();
if (isset($_GET["q"])) {
    header('Content-Type: application/json');
    $res = $db->query($_GET["q"]);
    $res = $res->fetchAll();
    for ($i = 0; $i < count($res); $i++) {
        unset($res[$i]);
    }
    print(json_encode($res->fetchAll()));
} else {
    header("HTTP/1.1 400 Invalid Request");
    header("Content-type: text/plain");
    echo("empty param.");
}



?>