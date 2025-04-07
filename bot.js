import {Telegraf, session, Scenes} from 'telegraf';
import dotenv from 'dotenv';

dotenv.config()

import { start, help, addTaskCommand } from './callbacks/commands.js'
import { callbacks, addTaskScene, addTask, setupListHandlers } from './callbacks/callbacks.js';

import { connectDatabase, createTable } from './database.js';
import { startReminderChecker } from './checker.js';





const bot = new Telegraf(process.env.TOKEN)

async function dbWork(){
    const db = await connectDatabase()
    await createTable(db)
    await startReminderChecker(bot, db)
    await setupListHandlers(bot, db);
}



bot.command('add_task', async(ctx) => {
    await ctx.answerCbQuery();
})




await dbWork()
await start(bot)
await callbacks(bot)


bot.use(session());
const stage = new Scenes.Stage([addTaskScene]);
bot.use(stage.middleware())

await addTask(bot)
await addTaskCommand(bot)
await help(bot)


console.log('🎁 ПРОЕКТ ЗАПУЩЕН')
bot.launch()