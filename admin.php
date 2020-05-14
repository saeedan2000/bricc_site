<?php
include_once "./config/database.php";

$db = connectToDB();
if (isset($_GET["q"])) {
    header('Content-Type: application/json');
    $res = $db->query($_GET["q"]);
    $res = $res->fetchAll();
    $output = [];
    foreach ($res as $k => $v)
        $output[] = (is_string($k) ? ('"' . $k . '":') : '') . json_encode($v);

    echo '{' . implode(',', $output) . '}' . PHP_EOL;
    #print(json_encode());
} else {
    header("HTTP/1.1 400 Invalid Request");
    header("Content-type: text/plain");
    echo("empty param.");
}



?>