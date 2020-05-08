<?php
# This file contains the code used to connect to the database using PDO
$dbhost = $_SERVER['RDS_HOSTNAME'];
$dbport = $_SERVER['RDS_PORT'];
$dbname = $_SERVER['RDS_DB_NAME'];
$charset = 'utf8' ;

$dsn = "mysql:host={$dbhost};port={$dbport};dbname={$dbname};charset={$charset}";
$username = $_SERVER['RDS_USERNAME'];
$password = $_SERVER['RDS_PASSWORD'];

function connectToDB() {
    # Construct PDO object
    global $dbhost;
    global $dbport;
    global $dbname;
    global $charset;
    global $dsn;
    global $username;
    global $password;
    try
    {
        $db = new PDO($dsn, $username, $password);
    }

    catch(Exception $e)
    {
        header("Content-Type: text/plain");
        print ("Can not connect to the database. Please try again later.\n");
        print ("Error details: $e \n");
        die();
    }
    return $db;
}
?>