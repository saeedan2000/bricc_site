<?php
# This file contains the code used to connect to the database using PDO
/*
$dbhost = $_SERVER['RDS_HOSTNAME'];
$dbport = $_SERVER['RDS_PORT'];
$dbname = $_SERVER['RDS_DB_NAME'];
$charset = 'utf8' ;

$dsn = "mysql:host={$dbhost};port={$dbport};dbname={$dbname};charset={$charset}";
$username = $_SERVER['RDS_USERNAME'];
$password = $_SERVER['RDS_PASSWORD']; */ # MOD for local vs AWS

function connectToDB() {
    # Construct PDO object
    /*
    global $dbhost;
    global $dbport;
    global $dbname;
    global $charset;
    global $dsn;
    global $username;
    global $password; */ # MOD for local vs AWS
    try
    {
        $db = new PDO('mysql:host=localhost;dbname=briccdb', 'saeedan', 'wyandotte'); # PDO($dsn, $username, $password); MOD for local vs AWS
    }

    catch(Exception $e)
    {
        header("HTTP/1.1 500 Internal Server Error");
        header("Content-Type: text/plain");
        print ("Can not connect to the database. Error details: $e \n");
        die();
    }
    return $db;
}
?>