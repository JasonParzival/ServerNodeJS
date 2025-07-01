const http = require("http");
const url = require('url');
const db = require('./db');

http.createServer(async function(request,response){
    const parsedUrl = url.parse(request.url, true);
    const path = parsedUrl.pathname;
    const query = parsedUrl.query;
    
    if (path === '/') {
        return sendHTML(response, "<h1>Привет, Октагон!</h1>", 200);
    }
    else if (path === '/static') {
        const responsejson = {
            header: "Hello",
            body: "Octagon NodeJS Test"
        };

        return sendJSON(response, responsejson);
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
            return;
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
            return;
        }
    }
    if (path === '/getAllItems' && request.method === 'GET') {
        try {
            const [rows] = await db.query('SELECT * FROM Items');

            return sendJSON(response, rows);
        } catch (e) {
            return sendJSON(response, null);
        }
    }
    else if (path === '/addItem' && request.method === 'GET') {
        const { name, desc } = query;

        if (!name || !desc) {
            return sendJSON(response, null);
        }
        else {
            try {
                const [result] = await db.query(
                    'INSERT INTO Items (name, `desc`) VALUES (?, ?)', [name, desc]
                );

                const [rows] = await db.query(
                    'SELECT * FROM Items WHERE id = ?', [result.insertId]
                );

                return sendJSON(response, rows[0] || {});
            } catch (e) {
                return sendJSON(response, null);
            }
        }
    }
    else if (path === '/deleteItem' && request.method === 'GET') {
        const id = parseInt(query.id);

        if (isNaN(id)) {
            return sendJSON(response, null);
        }
        else {
            try {
                const [rows] = await db.query(
                    'SELECT * FROM Items WHERE id = ?', [id]
                );

                if (rows.length === 0) {
                    return sendJSON(response, {});
                }
                else {
                    await db.query('DELETE FROM Items WHERE id = ?', [id]);
                    return sendJSON(response, rows[0]);
                }
            } catch (e) {
                return sendJSON(response, null);
            }
        }       
    }
    else if (path === '/updateItem' && request.method === 'GET') {
        const id = parseInt(query.id);

        const { name, desc } = query;

        if (isNaN(id) || !name || !desc) {
            return sendJSON(response, null);
        }
        else {
            try {
                const [rows] = await db.query('SELECT * FROM Items WHERE id = ?', [id]);

                if (rows.length === 0) {
                    return sendJSON(response, {});
                }
                else {
                    await db.query(
                        'UPDATE Items SET name = ?, `desc` = ? WHERE id = ?', [name, desc, id]
                    );

                    const [updatedRows] = await db.query('SELECT * FROM Items WHERE id = ?', [id]);
                    return sendJSON(response, updatedRows[0]);
                }
            } catch (e) {
                return sendJSON(response, null);
            }
        }
    }
    else {
        return sendHTML(response, "<h1>Статус 404</h1><br><h2>Not Found</h2><br><h2>Не найдено</h2>", 404);
    }
}).listen(3000, "127.0.0.1",function(){
    console.log("Сервер начал прослушивание запросов на порту 3000");
});

function sendJSON(res, obj) {
    res.writeHead(200, { 
        'Content-Type': 'application/json; charset=utf-8' 
    });
    res.end(JSON.stringify(obj));
}

function sendHTML(res, obj, code) {
    res.writeHead(code, {
        "Content-Type": "text/html; charset=utf-8"
    });

    res.end(obj);
}