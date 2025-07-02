const TelegramBot = require('node-telegram-bot-api');

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

    console.log('Telegram bot started');
}

module.exports = startBot;