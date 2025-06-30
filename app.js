const http = require("http");
http.createServer(function(request,response){
     
    if (request.url === '/') {
        response.writeHead(200, {
            "Content-Type": "text/html; charset=utf-8"
        });

        response.end("<h1>Привет, Октагон!</h1>");
    }
    else if (request.url == '/static') {
        const responsejson = {
            header: "Hello",
            body: "Octagon NodeJS Test"
        };

        response.writeHead(200, { 
            'Content-Type': 'application/json; charset=utf-8' 
        });
        response.end(JSON.stringify(responsejson));
    }
    else {
        response.writeHead(404, { 
            'Content-Type': 'text/plain; charset=utf-8' 
        });
        response.end('Not Found');
    }
    
     
}).listen(3000, "127.0.0.1",function(){
    console.log("Сервер начал прослушивание запросов на порту 3000");
});