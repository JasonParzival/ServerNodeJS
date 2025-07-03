const TelegramBot = require('node-telegram-bot-api');
const QRcode = require('qrcode');
const puppeteer = require('puppeteer');
const fs = require('fs');
const db = require('./db');

function startBot() {
    const token = '7901575482:AAHvGX4eTbREUS77stmzPIhy7FVDh_-1dQ4';
    const bot = new TelegramBot(token, { polling: true });

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
        try {
            const [rows] = await db.query('SELECT * FROM ItemsNew ORDER BY RAND() LIMIT 1');

            if (rows.length === 0) {
                bot.sendMessage(chatId, 'В базе нет предметов.');
            } else {
                const item = rows[0];
                bot.sendMessage(chatId, `(${item.id}) - ${item.name}: ${item.desc}`);
            }
        } catch (e) {
            bot.sendMessage(chatId, 'Ошибка при получении предмета.');
        }
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

    console.log('Telegram bot started');
}

module.exports = startBot;