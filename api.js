import express from 'express';
import bodyParser from 'body-parser';
import { connectDatabase, addTaskDB, getUserTasks } from './database.js';

const api = express();
const port = 3000;

api.use(bodyParser.json());


api.post('/reminders', async (req, res) => {
    try {
        const { userId, taskText, reminderTime, reminderDate } = req.body;

        if (!userId || !taskText || !reminderTime || !reminderDate) {
            return res.status(400).json({ error: 'Необходимо предоставить userId, taskText, reminderTime и reminderDate в теле запроса.' });
        }

        const db = await connectDatabase();
        const dataValidFormat = convertDateFormat(reminderDate);
        await addTaskDB(db, userId, taskText, reminderTime, dataValidFormat);
        await db.close();

        res.status(201).json({ message: 'Напоминание успешно создано.' });

    } catch (error) {
        console.error('Ошибка при создании напоминания через API:', error);
        res.status(500).json({ error: 'Не удалось создать напоминание.', details: error.message });
    }
});


api.get('/reminders/:userId', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);

        if (isNaN(userId)) {
            return res.status(400).json({ error: 'Неверный userId. UserId должен быть числом.' });
        }

        const db = await connectDatabase();
        const reminders = await getUserTasks(db, userId);
        await db.close();

        res.status(200).json({ reminders });

    } catch (error) {
        console.error('Ошибка при получении списка напоминаний через API:', error);
        res.status(500).json({ error: 'Не удалось получить список напоминаний.', details: error.message });
    }
});

api.listen(port, () => {
    console.log(`API сервер запущен на порту ${port}`);
});


function convertDateFormat(dateString) {
    if (!dateString) return null;
    const [day, month, year] = dateString.split('.');

    const formattedYear = `20${year}`;
    const formattedMonth = month.padStart(2, '0');
    const formattedDay = day.padStart(2, '0');

    return `${formattedYear}-${formattedMonth}-${formattedDay}`;
}