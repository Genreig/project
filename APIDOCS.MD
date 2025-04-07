# API Документация для Telegram Reminder Bot

## Обзор

Telegram Reminder Bot - это интеллектуальный бот для управления напоминаниями с расширенными возможностями. API предоставляет полный функционал для интеграции с внешними системами и управления напоминаниями.

## Базовый URL

`https://api.reminderbot.com/v1`  
*или*  
`http://localhost:3000/api/v1` (для локального тестирования)

## Аутентификация

Все запросы требуют API-ключа в заголовке:
```
Authorization: Bearer your_api_key_here
```

## Эндпоинты

### 1. Создание напоминания

**URL:** `/reminders`  
**Метод:** POST  
**Content-Type:** `application/json`

#### Параметры запроса:

| Параметр      | Тип    | Обязательный | Описание                               | Пример значения              |
|---------------|--------|--------------|----------------------------------------|-------------------------------|
| userId        | number | Да           | Уникальный ID пользователя в Telegram  | 123456789                    |
| taskText      | string | Да           | Текст напоминания                      | "Купить молоко"              |
| reminderTime  | string | Да           | Время в формате ЧЧ:ММ                  | "20:00"                      |
| reminderDate  | string | Да           | Дата в формате ДД.ММ.ГГ                | "20.04.24"                   |
| priority      | string | Нет          | Приоритет (low/medium/high)            | "medium"                     |
| repeat        | string | Нет          | Периодичность (daily/weekly/monthly)   | "weekly"                     |
| category      | string | Нет          | Категория напоминания                  | "Покупки"                    |

#### Пример запроса:

```json
{
  "userId": 123456789,
  "taskText": "Не забыть купить молоко",
  "reminderTime": "20:00",
  "reminderDate": "20.04.24",
  "priority": "medium",
  "repeat": "daily",
  "category": "Покупки"
}
```

#### Ответы:

**Успех (201 Created):**
```json
{
  "status": "success",
  "data": {
    "reminderId": 42,
    "createdAt": "2024-04-20T15:30:00Z",
    "nextReminder": "2024-04-20T20:00:00+03:00"
  }
}
```

**Ошибка (400 Bad Request):**
```json
{
  "status": "error",
  "error": {
    "code": "INVALID_DATE_FORMAT",
    "message": "Неверный формат даты. Используйте ДД.ММ.ГГ"
  }
}
```

**Ошибка (401 Unauthorized):**
```json
{
  "status": "error",
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Неверный API ключ"
  }
}
```

### 2. Получение списка напоминаний

**URL:** `/reminders`  
**Метод:** GET  
**Query Parameters:**

| Параметр   | Тип    | Обязательный | Описание                          | Пример значения |
|------------|--------|--------------|-----------------------------------|-----------------|
| userId     | number | Да           | ID пользователя Telegram          | 123456789       |
| page       | number | Нет          | Номер страницы (по умолчанию 1)   | 2               |
| limit      | number | Нет          | Количество на странице (макс 50)  | 10              |
| status     | string | Нет          | Фильтр по статусу (active/done)   | "active"        |
| category   | string | Нет          | Фильтр по категории               | "Покупки"       |
| fromDate   | string | Нет          | Дата начала периода (ДД.ММ.ГГ)    | "01.04.24"      |
| toDate     | string | Нет          | Дата окончания периода (ДД.ММ.ГГ) | "30.04.24"      |

#### Пример запроса:
`GET /reminders?userId=123456789&page=1&limit=5&status=active`

#### Ответы:

**Успех (200 OK):**
```json
{
  "status": "success",
  "data": {
    "total": 15,
    "page": 1,
    "limit": 5,
    "reminders": [
      {
        "id": 42,
        "taskText": "Купить молоко",
        "reminderTime": "20:00",
        "reminderDate": "20.04.24",
        "priority": "medium",
        "status": "active",
        "createdAt": "2024-04-19T12:00:00Z"
      },
      {
        "id": 43,
        "taskText": "Забрать посылку",
        "reminderTime": "12:30",
        "reminderDate": "21.04.24",
        "priority": "high",
        "status": "active",
        "createdAt": "2024-04-19T12:05:00Z"
      }
    ]
  }
}
```

### 3. Получение конкретного напоминания

**URL:** `/reminders/{id}`  
**Метод:** GET

#### Пример запроса:
`GET /reminders/42`

#### Ответы:

**Успех (200 OK):**
```json
{
  "status": "success",
  "data": {
    "id": 42,
    "userId": 123456789,
    "taskText": "Купить молоко",
    "reminderTime": "20:00",
    "reminderDate": "20.04.24",
    "priority": "medium",
    "repeat": "daily",
    "category": "Покупки",
    "status": "active",
    "createdAt": "2024-04-19T12:00:00Z",
    "updatedAt": "2024-04-19T12:00:00Z"
  }
}
```

### 4. Обновление напоминания

**URL:** `/reminders/{id}`  
**Метод:** PUT  
**Content-Type:** `application/json`

#### Пример запроса:
```json
{
  "taskText": "Купить молоко и хлеб",
  "reminderTime": "19:30",
  "reminderDate": "20.04.24"
}
```

#### Ответы:

**Успех (200 OK):**
```json
{
  "status": "success",
  "data": {
    "id": 42,
    "updatedFields": ["taskText", "reminderTime"]
  }
}
```

### 5. Удаление напоминания

**URL:** `/reminders/{id}`  
**Метод:** DELETE

#### Ответы:

**Успех (200 OK):**
```json
{
  "status": "success",
  "data": {
    "message": "Напоминание удалено",
    "id": 42
  }
}
```

## Коды ошибок

| Код ошибки            | HTTP Status | Описание                               |
|-----------------------|-------------|----------------------------------------|
| INVALID_CREDENTIALS   | 401         | Неверные учетные данные                |
| NOT_FOUND             | 404         | Ресурс не найден                       |
| INVALID_DATE_FORMAT   | 400         | Неверный формат даты                   |
| INVALID_TIME_FORMAT   | 400         | Неверный формат времени                |
| PAST_DATE             | 400         | Дата уже прошла                        |
| RATE_LIMIT_EXCEEDED   | 429         | Превышен лимит запросов                |
| INTERNAL_SERVER_ERROR | 500         | Внутренняя ошибка сервера              |

## Лимиты и квоты

- Максимальный размер запроса: 1MB
- Лимит запросов: 100 запросов в минуту на ключ
- Максимальная длина текста напоминания: 500 символов

## Версионирование

API использует семантическое версионирование. Текущая версия: `v1`.

Все запросы должны включать версию в URL:
```
https://api.reminderbot.com/v1/reminders
```

## Webhooks

Бот поддерживает следующие webhook-события:

1. `reminder_created` - новое напоминание
2. `reminder_triggered` - срабатывание напоминания
3. `reminder_updated` - изменение напоминания
4. `reminder_deleted` - удаление напоминания

Для настройки webhooks используйте эндпоинт:
`POST /webhooks`

Пример тела запроса:
```json
{
  "url": "https://yourdomain.com/webhook-handler",
  "events": ["reminder_created", "reminder_triggered"]
}
```