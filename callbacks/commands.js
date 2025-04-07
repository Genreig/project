export const start = (bot) => {
    bot.command(`start`, async (ctx) => {
        await ctx.replyWithPhoto('https://ibb.co/hFP0CTYB', {caption: `
🎉 <b>Добро пожаловать, ${ctx.from.first_name}!</b> 🎉
    
Я - <b>Умный напоминатель</b> 🤖
    
<b>Мои возможности:</b>
• 📌 Создание напоминаний с точным временем
• 📋 Удобное управление списком
• ⏰ Автоматические уведомления\n
                  
        `, 
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [{ text: '✨ Как начать работу', callback_data: 'quickStart' }],
                    [
                        { text: '📝 Создать', callback_data: 'addTask' },
                        { text: '🗂 Список', callback_data: 'listTask' }
                    ],
                    [
                        { text: '🆘 Помощь', callback_data: 'help' },
                        { text: '💬 Cвязь', url: 'https://t.me/neowarnawsku' }
                    ]
                ]
            }
        });
    });
}


export const help = (bot) => {
    bot.command('help', async (ctx) => {
        await ctx.reply(`
🤖 <b>Список доступных команд:</b> 📋

✏️ <b>/addtask</b> - добавить новое напоминание
🗑️ <b>/deletetask</b> - удалить существующее напоминание
📋 <b>/list</b> - просмотреть список всех напоминаний
⚡ <b>/fast</b> - быстро создать напоминание

ℹ️ Это бот для создания и управления напоминаниями.
        `, { 
            parse_mode: 'HTML',
            disable_web_page_preview: true 
        });
    });
}


export const addTaskCommand = (bot) => {
    bot.command('addtask', async(ctx) => {
        ctx.scene.enter('ADD_TASK_WIZARD')
    })
}