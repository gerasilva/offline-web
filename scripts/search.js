function search(){
    var request = new XMLHttpRequest();
    var query = document.querySelector("input[type=search]").value;
    
    if(sessionStorage.getItem(query)!==undefined && sessionStorage.getItem(query)!==null){
        document.querySelector("#result").innerHTML = sessionStorage.getItem(query);
    }
    else {
        request.open("GET", "https://en.wikipedia.org/w/api.php?action=parse&format=json&origin=*&page=" + query);
    
        request.onload = function(){
            if(request.status === 200){
                var wiki = JSON.parse(request.response);
                document.querySelector("#result").innerHTML = wiki.parse.text["*"];
                sessionStorage.setItem(query,wiki.parse.text["*"]);
            }
            else {
                document.querySelector("#result").innerHTML = "HTTP Code: " + request.status;
            }
        };
        request.send();        
    }

}