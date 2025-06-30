const http = require("http");
http.createServer(function(request,response){
     
    response.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8"
    });

    response.end("<h1>Привет, Октагон!</h1>");
     
}).listen(3000, "127.0.0.1",function(){
    console.log("Сервер начал прослушивание запросов на порту 3000");
});