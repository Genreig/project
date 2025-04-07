export function startReminderChecker(bot, db) {
    setInterval(async () => {
        try {
            const now = new Date();
            const moscowOffset = 3 * 60 * 60 * 1000;
            const moscowTime = new Date(now.getTime() + moscowOffset);
            
            const moscowDate = moscowTime.toISOString().slice(0, 10);
            const moscowHours = moscowTime.getUTCHours();
            const moscowMinutes = moscowTime.getUTCMinutes();
            const moscowTimeStr = moscowHours.toString().padStart(2, '0') + ':' + 
                                 moscowMinutes.toString().padStart(2, '0');

            console.log(`[Проверка] Московское время: ${moscowDate} ${moscowTimeStr}`);


            const tasks = await db.all(
                `SELECT * FROM tasks 
                 WHERE reminder_date = ? 
                 AND reminder_time = ?`,
                [moscowDate, moscowTimeStr]
            );

            for (const task of tasks) {
                try {
                    await bot.telegram.sendMessage(
                        task.user_id,
`<b>🔔 НАПОМИНАНИЕ</b>\n\n
📌 Задача:\n${task.task}\n\n
⏰ Когда: ${task.reminder_date} в ${task.reminder_time}`, {parse_mode: 'HTML', reply_markup: {
                            inline_keyboard: [
                                [{text: '🗑 Удалить', callback_data: 'deleteReminder'}]
                            ]
                        }}
                    );
                    await db.run(`DELETE FROM tasks WHERE id = ?`, [task.id]);
                    console.log(`Отправлено и удалено: ${task.id}`);
                } catch (error) {
                    console.error(`Ошибка: ${error.message}`);
                    if (error.code === 403) {
                        await db.run(`DELETE FROM tasks WHERE id = ?`, [task.id]);
                    }
                }
            }
        } catch (error) {
            console.error('Ошибка проверки:', error);
        }
    }, 1000);


    bot.action('deleteReminder', async(ctx) => {
        await ctx.answerCbQuery();
        await ctx.deleteMessage();
    })
}




