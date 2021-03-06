"use strict";
(function() {

    function $(id){
        return document.getElementById(id);
    }


    function checkStatus(response) {
        if (response.status >= 200 && response.status < 300) {
            return response.text();
        } else {
            return Promise.reject(new Error(response.status +
                                            ": " + response.statusText));
        }
    }
    
    function ajaxCall(q) {
        let url = "http://briccsite-env-2.cc6s3rcj3k.us-east-2.elasticbeanstalk.com/admin.php?q=" + q; 
        fetch(url)
           .then(checkStatus)
           .then(function(responseText) {
               console.log(responseText);
               $("resBox").value = JSON.stringify(JSON.parse(responseText), undefined, 4);
           })
           .catch(function(error) {
               //error: do something with error
               console.log(error);
           });
    }

    window.onload = function() {
        $("queryButton").onclick = function() {
            console.log("query: " + $("textBox").value);
            ajaxCall($("textBox").value);
        }
        $("clearButton").onclick = function() {
            $("textBox").value = "";
        }
    }
})();