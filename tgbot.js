const TelegramBot = require('node-telegram-bot-api');
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
/creator — информация о Создателе бота`;
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

    console.log('Telegram bot started');
}

module.exports = startBot;