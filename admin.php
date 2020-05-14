<?php
include_once "./config/database.php";

$db = connectToDB();
if (isset($_GET["q"])) {
    header('Content-Type: application/json');
    $res = $db->query($_GET["q"]);
    $res = $res->fetchAll();
    print(json_encode($res));
} else {
    header("HTTP/1.1 400 Invalid Request");
    header("Content-type: text/plain");
    echo("empty param.");
}



?>