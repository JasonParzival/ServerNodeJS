const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('<h1>Привет, Октагон!</h1>');
});

app.get('/static', (req, res) => {
  res.json({
    header: "Hello",
    body: "Octagon NodeJS Test"
  });
});

app.get('/dynamic', (req, res) => {
  const a = parseFloat(req.query.a);
  const b = parseFloat(req.query.b);
  const c = parseFloat(req.query.c);

  if (
    req.query.a === undefined || req.query.b === undefined || req.query.c === undefined ||
    isNaN(a) || isNaN(b) || isNaN(c)
  ) {
    res.status(404).json({ header: "Error" });
  } else {
    const result = (a * b * c) / 3;
    res.json({
      header: "Calculated",
      body: result.toString()
    });
  }
});

app.use((req, res) => {
  res.status(404).send('Not Found');
});

app.listen(3000, "127.0.0.1",function(){
    console.log("Сервер начал прослушивание запросов на порту 3000");
});