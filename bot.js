import {Telegraf} from 'telegraf';
import dotenv from 'dotenv';

dotenv.config()

const bot = new Telegraf(process.env.TOKEN)

bot.command(`start`, async(ctx) => {
    ctx.reply(`Привет я бот для напоминаний`)
})


bot.command('help', async(ctx) => {
    ctx.reply(`Выберите, какие конкретно функции Вас интересуют`, {parse_mode: 'HTML', reply_markup: {
        inline_keyboard: [
            [{text: 'Обычные', callback_data: 'default_help'}],
            [{text: 'Для разработчиков', callback_data: 'api_help'}]
                    ]
                }
            }
        )
     }
)


bot.command('add_task', async(ctx) => {
    ctx.reply
})


const callbacks = (bot) => {
    bot.action('default_help', async(ctx) => {

    })


    bot.action('api_help', async(ctx) => {
        
    })
}
















console.log('🎁 ПРОЕКТ ЗАПУЩЕН')
bot.launch()