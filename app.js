const express = require('express');
const app = express();
const db = require('./db'); 

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

app.get('/getAllItems', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM ItemsNew');

    res.json(rows);
  } catch (e) {
    res.status(500).json(null);
  }
});

app.get('/addItem', async (req, res) => {
  const { name, desc } = req.query;

  if (!name || !desc) {
    return res.status(400).json(null);
  }

  try {
    const [result] = await db.query(
      'INSERT INTO ItemsNew (name, `desc`) VALUES (?, ?)', [name, desc]
    );

    const [rows] = await db.query(
      'SELECT * FROM ItemsNew WHERE id = ?', [result.insertId]
    );

    res.status(201).json(rows[0] || {});
  } catch (e) {
    res.status(500).json(null);
  }
});

app.get('/deleteItem', async (req, res) => {
  const id = req.query.id;

  if (isNaN(id)) {
    return res.status(400).json(null);
  }

  try {
    const [rows] = await db.query('SELECT * FROM ItemsNew WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({});
    }
    else {
      await db.query('DELETE FROM ItemsNew WHERE id = ?', [id]);
      res.json(rows[0]);
    }
  } catch (e) {
    res.status(500).json(null);
  }
});

app.get('/updateItem', async (req, res) => {
  const { id, name, desc } = req.query;

  if (isNaN(id) || !name || !desc) {
    return res.status(400).json(null);
  }
  else {
    try {
      const [rows] = await db.query('SELECT * FROM ItemsNew WHERE id = ?', [id]);

      if (rows.length === 0) {
        return res.status(404).json({});
      }
      else {
        await db.query('UPDATE ItemsNew SET name = ?, `desc` = ? WHERE id = ?', [name, desc, id]);

        const [updatedRows] = await db.query('SELECT * FROM ItemsNew WHERE id = ?', [id]);
        res.json(updatedRows[0]);
      }
    } catch (e) {
      res.status(500).json(null);
    }
  }
});

app.use((req, res) => {
  res.status(404).send('Not Found');
});

app.listen(3000, "127.0.0.1",function(){
    console.log("Сервер начал прослушивание запросов на порту 3000");
});