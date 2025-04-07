import { Scenes, Markup } from "telegraf";
import { addTaskDB, connectDatabase, getTasksCount, getUserTasks } from '../database.js'



export const callbacks = (bot) => {
    bot.action('quickStart', async (ctx) => {
        await ctx.answerCbQuery();
        await ctx.editMessageCaption(`
    🚀 <b>Быстрый старт:</b>

    1. Чтобы создать напоминание, нажми <b>"📝 Создать"</b> или пропишите команду:
       <code>/addtask</code>

    2. Посмотреть все напоминания:
       <b>"🗂 Список"</b> или <code>/list</code>

    3. Удалить:
       Для того, чтобы удалить напоминание зайдите в список напоминаний, выберите его в списке и нажмите <b>"🗑 Удалить"</b> или <code>/deletetask</code>.
        `, {parse_mode: 'HTML', reply_markup: {
            inline_keyboard: [
                [{text: '🧭 Назад', callback_data: 'return_to_menu'}]
            ]
        }});
    });


    bot.action('help', async(ctx) => {
        await ctx.answerCbQuery();
        await ctx.editMessageCaption(`
🤖 <b>Список доступных команд:</b> 📋

✏️ <b>/addtask</b> - добавить новое напоминание
🗑️ <b>/deletetask</b> - удалить существующее напоминание
📋 <b>/list</b> - просмотреть список всех напоминаний
⚡ <b>/fast</b> - быстро создать напоминание

ℹ️ Это бот для создания и управления напоминаниями.
        `, {parse_mode: 'HTML', disable_web_page_preview: true, reply_markup: {
            inline_keyboard: [
                [{text: '🧭 Назад', callback_data: 'return_to_menu'}]
            ]
        }});
    });


    bot.action('return_to_menu', async(ctx) => {
        await ctx.answerCbQuery();
        await ctx.editMessageCaption(`

🎉 <b>Добро пожаловать, ${ctx.from.first_name}!</b> 🎉

Я - <b>Умный напоминатель</b> 🤖

<b>Мои возможности:</b>
• 📌 Создание напоминаний с точным временем
• 📋 Удобное управление списком
• ⏰ Автоматические уведомления\n

                    `,
                        {parse_mode: 'HTML',
                        protect_content: true,
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: '✨ Начать работу', callback_data: 'quickStart' }],
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
                    }
                );
    }
);
}



export const addTaskScene = new Scenes.WizardScene(
        'ADD_TASK_WIZARD',
        async(ctx) => {
            await ctx.reply('<b>🌠 Введите текст напоминания</b>', { parse_mode: 'HTML' });
            return ctx.wizard.next();
        },

        async(ctx) => {
            ctx.wizard.state.taskText = ctx.message.text;
            await ctx.reply('<b>📅 Введите дату в формате ДД.ММ.ГГ (Например: 13.06.27)</b>', { parse_mode: 'HTML' });
            return ctx.wizard.next();
        },

        async(ctx) => {
            ctx.wizard.state.taskDate = ctx.message.text;
            const testValidDate =  await validateDate(ctx.wizard.state.taskDate)

            if(testValidDate === false){
                await ctx.reply(`<b>📛 Вы ввели неправильную дату. Попробуйте снова 🔄</b>`, { parse_mode: 'HTML' })
                return
            }
            if(testValidDate === true){
            await ctx.reply('<b>⏰ Введите время в формате: ЧЧ:ММ (Пример: 23:43)</b>', { parse_mode: 'HTML' });
            return ctx.wizard.next();}
        },

        async(ctx) => {
            ctx.wizard.state.taskTime = ctx.message.text;
            const testValidTime = await validateTime(ctx.wizard.state.taskDate, ctx.wizard.state.taskTime)

            if(testValidTime === false){
                await ctx.reply(`<b>📛 Вы ввели неправильное время. Попробуйте снова 🔄</b>`, { parse_mode: 'HTML' })
                return
            }
            if(testValidTime === true){
                await ctx.replyWithHTML(`
🎉 <b>Напоминание успешно создано!</b> 🎉
                    
📌 <b>Текст:</b>
<code><b>${ctx.wizard.state.taskText}</b></code>
                    
🗓 <b>Дата:</b>
<code><b>${ctx.wizard.state.taskDate}</b></code>
                    
⏰ <b>Время:</b>
<code><b>${ctx.wizard.state.taskTime}</b></code>
                    
━━━━━━━━━━━━━━
<i>Вы получите уведомление в указанное время</i> 🔔
                    `)
                const db = await connectDatabase();
                const dataValidFormat = convertDateFormat(ctx.wizard.state.taskDate)
                await addTaskDB(db, ctx.from.id, ctx.wizard.state.taskText, ctx.wizard.state.taskTime, dataValidFormat);
                return ctx.scene.leave();
            }
        }

    )


async function validateDate(date){
        const regex = /^(0[1-9]|[12][0-9]|3[01])\.(0[1-9]|1[0-2])\.\d{2}$/;
        if (!regex.test(date)) {
            return false
        }
    
        const [day, month, year] = date.split('.').map(Number);
    

        const inputDate = new Date(year + 2000, month - 1, day);
        const currentDate = new Date();

        currentDate.setHours(0, 0, 0, 0);

        if (inputDate < currentDate) {
            return false
        }
        return true
    }


async function validateTime(date, time){
    const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!regex.test(time)) {
        return false;
    }

    const [day, month, year] = date.split('.').map(Number);
    const [hours, minutes] = time.split(':').map(Number);

    const inputDate = new Date(year + 2000, month - 1, day, hours, minutes);
    const currentDate = new Date();

    if (inputDate.toDateString() === currentDate.toDateString() && inputDate <= currentDate) {
        return false;
    }
    return true;
}


function convertDateFormat(dateString) {
    const [day, month, year] = dateString.split('.');
    
    const formattedYear = `20${year}`;
    const formattedMonth = month.padStart(2, '0');
    const formattedDay = day.padStart(2, '0');
    
    return `${formattedYear}-${formattedMonth}-${formattedDay}`;
}


export const addTask = (bot) => {
    bot.action('addTask', async(ctx) => {
        ctx.scene.enter('ADD_TASK_WIZARD')
    })
}


export function setupListHandlers(bot, db) {
    const userPages = new Map();

    bot.action('listTask', async (ctx) => {
        try {
            const userId = ctx.from.id;
            userPages.set(userId, 1);
            await showTasksPage(ctx, db, userId);
            await ctx.answerCbQuery();
        } catch (error) {
            console.error('List error:', error);
            await ctx.reply('⚠️ Ошибка загрузки задач');
        }
    });

    bot.action(/^task_page_(\d+)$/, async (ctx) => {
        const userId = ctx.from.id;
        const page = parseInt(ctx.match[1]);
        userPages.set(userId, page);
        await showTasksPage(ctx, db, userId);
        await ctx.answerCbQuery();
    });

    bot.action('task_close', async (ctx) => {
        await ctx.deleteMessage();
        await ctx.answerCbQuery();
    });

    async function showTasksPage(ctx, db, userId) {
        const currentPage = userPages.get(userId) || 1;
        const tasks = await getUserTasks(db, userId, currentPage);
        const totalCount = await getTasksCount(db, userId);
        const totalPages = Math.ceil(totalCount / 8);

        if (tasks.length === 0) {
            return await ctx.reply('📭 У вас пока нет задач.');
        }

        const taskButtons = tasks.map(task => [
            { 
                text: `📌 ${task.task.slice(0, 30)} (${task.reminder_date} ${task.reminder_time})`,
                callback_data: `task_detail_${task.id}`
            }
        ]);

        const paginationButtons = [];
        if (currentPage > 1) {
            paginationButtons.push({
                text: '⬅️ Назад',
                callback_data: `task_page_${currentPage - 1}`
            });
        }
        if (currentPage < totalPages) {
            paginationButtons.push({
                text: 'Вперед ➡️',
                callback_data: `task_page_${currentPage + 1}`
            });
        }

        const keyboard = [
            ...taskButtons,
            ...(paginationButtons.length ? [paginationButtons] : []),
            [{ text: '❌ Закрыть', callback_data: 'task_close' }]
        ];

        const messageText = `📋 Ваши задачи (Страница ${currentPage} из ${totalPages}):`;
        
        try {
            if (ctx.updateType === 'message' || !ctx.callbackQuery?.message?.text) {
                await ctx.reply(messageText, {
                    reply_markup: { inline_keyboard: keyboard }
                });
            } 
            else if (ctx.callbackQuery.message.text) {
                await ctx.editMessageText(messageText, {
                    reply_markup: { inline_keyboard: keyboard }
                });
            }
            else {
                await ctx.reply(messageText, {
                    reply_markup: { inline_keyboard: keyboard }
                });
                await ctx.deleteMessage();
            }
        } catch (editError) {
            console.error('Edit error:', editError);
            await ctx.reply(messageText, {
                reply_markup: { inline_keyboard: keyboard }
            });
        }
    }

    bot.action(/^task_detail_(\d+)$/, async (ctx) => {
        await ctx.answerCbQuery(`Задача #${ctx.match[1]} выбрана`);
    });
}