const TelegramBot = require('node-telegram-bot-api');
const QRcode = require('qrcode');
const puppeteer = require('puppeteer');
const fs = require('fs');
const db = require('./db');

const { setIntervalAsync, clearIntervalAsync } = require('set-interval-async/dynamic');

const token = '7901575482:AAHvGX4eTbREUS77stmzPIhy7FVDh_-1dQ4';
const bot = new TelegramBot(token, { polling: true });

function startBot() {
    
    

    bot.onText(/\/start/, (msg) => {
        const chatId = msg.chat.id;
        bot.sendMessage(chatId, 'Привет, октагон!');
    });

    bot.onText(/\/help/, (msg) => {
        const chatId = msg.chat.id;
        const helpText = `Доступные команды:
/help — список команд и их описание
/site — ссылка на сайт Октагона
/creator — информация о Создателе бота
/randomItem — вывод случайного объекта
/deleteItem (ID) — удаление объекта по айди
/getItemById (ID) — нахождение обьекта по айди
!qr (текст/ссылка) — создание QR-кода по тексту или сайту
!webscr (ссылка) — создание скриншота сайта`;
        bot.sendMessage(chatId, helpText);
    });

    bot.onText(/\/site/, (msg) => {
        const chatId = msg.chat.id;
        bot.sendMessage(chatId, 'https://octagon-students.ru');
    });

    bot.onText(/\/creator/, (msg) => {
        const chatId = msg.chat.id;
        bot.sendMessage(chatId, 'Мухамедзянов Руслан Ильгизарович'); 
    });

    bot.onText(/\/randomItem/, async (msg) => {
        const chatId = msg.chat.id;

        await sendRandomItem(chatId);
    });

    bot.onText(/\/deleteItem(?: (\d+))?/, async (msg, match) => {
        const chatId = msg.chat.id;
        const idStr = match[1];
        const id = parseInt(idStr);
        if (!idStr) {
            bot.sendMessage(chatId, 'Ошибка: ID не указан или не является числом.');
        }
        else {
            try {
                const [rows] = await db.query('SELECT * FROM ItemsNew WHERE id = ?', [id]);

                if (rows.length === 0) {
                    bot.sendMessage(chatId, 'Ошибка');
                } else {
                    const item = rows[0];

                    await db.query('DELETE FROM ItemsNew WHERE id = ?', [item.id]);

                    bot.sendMessage(chatId, 'Удачно');
                }
            } catch (e) {
                bot.sendMessage(chatId, 'Ошибка при получении предмета.');
            }
        }
    });

    bot.onText(/\/getItemById(?: (\d+))?/, async (msg, match) => {
        const chatId = msg.chat.id;
        const idStr = match[1];
        const id = parseInt(idStr);
        if (!idStr) {
            bot.sendMessage(chatId, 'Ошибка: ID не указан или не является числом.');
        }
        else {
            try {
                const [rows] = await db.query('SELECT * FROM ItemsNew WHERE id = ?', [id]);

                if (rows.length === 0) {
                    bot.sendMessage(chatId, 'Такого объекта нет.');
                } else {
                    const item = rows[0];

                    bot.sendMessage(chatId, `(${item.id}) - ${item.name}: ${item.desc}`);
                }
            } catch (e) {
                bot.sendMessage(chatId, 'Ошибка при получении предмета.');
            }
        }
    });

    bot.onText(/!qr (.+)/, async (msg, match) => {
        const chatId = msg.chat.id;
        const text = match[1];

        try {
            const qrDataUrl = await QRcode.toBuffer(text);

            bot.sendPhoto(chatId, qrDataUrl, { caption: 'Ваш QR-код' }, {
                filename: 'qrcode.png',
                contentType: 'image/png'
            });
        } catch (e) {
            bot.sendMessage(chatId, 'Ошибка при генерации QR-кода.');
        }
    });

    bot.onText(/!webscr (.+)/, async (msg, match) => {
        const chatId = msg.chat.id;
        const url = match[1];

        if (!/^https?:\/\//.test(url)) {
            bot.sendMessage(chatId, 'Пожалуйста, введите корректный URL с http://... или https://...');
        }
        else{
            try {
                const browser = await puppeteer.launch({
                    args: ['--no-sandbox', '--disable-setuid-sandbox']
                });

                const page = await browser.newPage();

                await page.setViewport({ width: 1280, height: 800 });

                await page.goto(url, { 
                    waitUntil: 'networkidle2', timeout: 30000 
                });

                const screenshot = await page.screenshot({ fullPage: false });

                await browser.close();

                await bot.sendPhoto(chatId, screenshot, {
                    caption: 'Скриншот сайта' 
                }, {
                    filename: 'screenshot.png',
                    contentType: 'image/png'
                });
            } catch (e) {
                bot.sendMessage(chatId, 'Ошибка при создании скриншота. Возможно, сайт недоступен.');
            }
        }
    });

    bot.on('message', async (msg) => {
        const userId = msg.from.id;
        const chatId = msg.chat.id;
        const today = new Date().toISOString().slice(0, 10);

        try {
            const [rows] = await db.query('SELECT id FROM Users WHERE id = ?', [userId]);

            if (rows.length === 0) {
                await db.query('INSERT INTO Users (id, lastMessage) VALUES (?, ?)', [userId, today]);
            } else {
                await db.query('UPDATE Users SET lastMessage = ? WHERE id = ?', [today, userId]);
            }
            
            //bot.sendMessage(chatId, 'Вы прекрасны!');
        } catch (e) {
            console.error('Ошибка:', e);
            bot.sendMessage(chatId, 'Ошибка при обращении к БД');
        }
    });

    console.log('Telegram bot started');

    setTimeout(() => {
        setIntervalAsync(async () => {
            try {
                await checkInactiveUsers();
            } catch (e) {
                console.error('Ошибка в таймере:', e);
            }
        }, 24 * 60 * 60 * 1000);
        checkInactiveUsers();
    }, msUntilNext13MSK());
}

module.exports = startBot;

function msUntilNext13MSK() {
  const now = new Date();

  const next = new Date(now);

  next.setUTCHours(10, 0, 0, 0);

  if (now >= next) {
    next.setUTCDate(next.getUTCDate() + 1);
  }
  return next - now;
}

async function checkInactiveUsers() {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    const dateStr = twoDaysAgo.toISOString().slice(0, 10);

    const [users] = await db.query('SELECT id FROM users WHERE lastMessage <= ?', [dateStr]);

    for (const user of users) {
        await sendRandomItem(user.id);
    }
}

async function sendRandomItem(chatId) {
    try {
        const [rows] = await db.query('SELECT * FROM ItemsNew ORDER BY RAND() LIMIT 1');
        if (rows.length === 0) {
            await bot.sendMessage(chatId, 'В базе нет предметов.');
        } else {
            const item = rows[0];
            await bot.sendMessage(chatId, `(${item.id}) - ${item.name}: ${item.desc}`);
        }
    } catch (e) {
        await bot.sendMessage(chatId, 'Ошибка при получении предмета.');
    }
}