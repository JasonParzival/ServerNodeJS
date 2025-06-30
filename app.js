const http = require("http");
const url = require('url');

http.createServer(function(request,response){
    const parsedUrl = url.parse(request.url, true);
    const path = parsedUrl.pathname;
    const query = parsedUrl.query;
    
    if (path === '/') {
        response.writeHead(200, {
            "Content-Type": "text/html; charset=utf-8"
        });

        response.end("<h1>Привет, Октагон!</h1>");
    }
    else if (path === '/static') {
        const responsejson = {
            header: "Hello",
            body: "Octagon NodeJS Test"
        };

        response.writeHead(200, { 
            'Content-Type': 'application/json; charset=utf-8' 
        });
        response.end(JSON.stringify(responsejson));
    }
    else if (path === '/dynamic'){
        const a = parseFloat(query.a);
        const b = parseFloat(query.b);
        const c = parseFloat(query.c);

        if (
            query.a === undefined || query.b === undefined || query.c === undefined ||
            isNaN(a) || isNaN(b) || isNaN(c)
        ) {
            const errorResponse = { 
                header: "Error" 
            };

            response.writeHead(404, { 
                'Content-Type': 'application/json; charset=utf-8' 
            });

            response.end(JSON.stringify(errorResponse));
        } else {
            const result = (a * b * c) / 3;

            const successResponse = {
                header: "Calculated",
                body: result.toString()
            };

            response.writeHead(200, { 
                'Content-Type': 'application/json; charset=utf-8' 
            });
            response.end(JSON.stringify(successResponse));
        }
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