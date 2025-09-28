# Медична система - React додаток

Цей React додаток створено для медичної системи з можливістю реєстрації користувачів та лікарів, пошуку лікарів та перегляду їх профілів.

## Функціональність

- ✅ Реєстрація звичайних користувачів
- ✅ Реєстрація лікарів з мультиселектом спеціалізацій та вибором клініки
- ✅ Авторизація користувачів та лікарів
- ✅ Головна сторінка зі списком лікарів
- ✅ Пошук лікарів за ім'ям або спеціалізацією
- ✅ Детальні профілі лікарів
- ✅ Адаптивний дизайн для мобільних пристроїв

## Технології

- **React 18** - основний фреймворк
- **React Router** - маршрутизація
- **Tailwind CSS** - стилізація
- **shadcn/ui** - UI компоненти
- **Lucide React** - іконки
- **Vite** - збірка та dev сервер

## Встановлення та запуск

### Передумови

- Node.js 18+ 
- pnpm (або npm/yarn)
- Laravel API сервер запущений на `http://localhost:8000`

### Кроки встановлення

1. **Розпакуйте архів** (якщо використовуєте архівну версію)
   ```bash
   unzip medical-app.zip
   cd medical-app
   ```

2. **Встановіть залежності**
   ```bash
   pnpm install
   # або
   npm install
   ```

3. **Запустіть dev сервер**
   ```bash
   pnpm run dev
   # або
   npm run dev
   ```

4. **Відкрийте браузер**
   
   Перейдіть за адресою: `http://localhost:5173`

## Інтеграція з Laravel API

### Необхідні API маршрути

Переконайтеся, що ваш Laravel додаток має наступні маршрути:

```php
// routes/api.php

// Існуючі маршрути
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register-doctor', [AuthController::class, 'registerDoctor']);
Route::post('/login-doctor', [AuthController::class, 'loginDoctor']);
Route::get('/doctor-options', [DoctorController::class, 'formOptions']);

// Додаткові маршрути (потрібно додати)
Route::get('/doctors', [DoctorController::class, 'index']);
Route::get('/doctor/{id}', [DoctorController::class, 'profile']);
```

### Налаштування CORS

У файлі `config/cors.php` додайте:

```php
'allowed_origins' => [
    'http://localhost:5173', // React dev server
    'http://localhost:3000', // альтернативний порт
],
```

### Детальні вимоги до API

Дивіться файл `LARAVEL_API_REQUIREMENTS.md` для повної інформації про:
- Необхідні методи контролера
- Структуру бази даних
- Моделі та зв'язки
- Тестові дані

## Структура проекту

```
medical-app/
├── public/                 # Статичні файли
├── src/
│   ├── components/         # React компоненти
│   │   ├── Header.jsx     # Заголовок сайту
│   │   ├── Home.jsx       # Головна сторінка
│   │   ├── UserRegister.jsx    # Реєстрація користувача
│   │   ├── DoctorRegister.jsx  # Реєстрація лікаря
│   │   ├── Login.jsx      # Вхід користувача
│   │   ├── DoctorLogin.jsx     # Вхід лікаря
│   │   └── DoctorProfile.jsx   # Профіль лікаря
│   ├── components/ui/      # UI компоненти (shadcn/ui)
│   ├── App.jsx            # Головний компонент
│   ├── App.css            # Стилі
│   └── main.jsx           # Точка входу
├── package.json           # Залежності
└── README.md             # Ця документація
```

## Основні компоненти

### Header.jsx
Навігаційна панель з посиланнями на реєстрацію та авторизацію.

### Home.jsx
Головна сторінка з:
- Пошуковою формою
- Списком лікарів у вигляді карток
- Фільтрацією за ім'ям та спеціалізацією

### UserRegister.jsx / DoctorRegister.jsx
Форми реєстрації з валідацією та обробкою помилок.

### DoctorProfile.jsx
Детальна інформація про лікаря з контактними даними та клініками.

## API Endpoints

### Реєстрація користувача
```
POST /api/register
Content-Type: application/json

{
  "name": "Іван Іванов",
  "email": "user@example.com",
  "phone": "+380501234567",
  "password": "password",
  "password_confirmation": "password"
}
```

### Реєстрація лікаря
```
POST /api/register-doctor
Content-Type: application/json

{
  "name": "Доктор Петров",
  "email": "doctor@example.com",
  "phone": "+380501234567",
  "password": "password",
  "password_confirmation": "password",
  "clinic_id": "1",
  "specializations": ["cardiology", "therapy"]
}
```

### Отримання списку лікарів
```
GET /api/doctors
Accept: application/json
```

### Отримання профілю лікаря
```
GET /api/doctor/{id}
Accept: application/json
```

### Отримання опцій для форм
```
GET /api/doctor-options
Accept: application/json
```

## Збірка для продакшену

```bash
pnpm run build
# або
npm run build
```

Файли збірки будуть у папці `dist/`.

## Тестування

1. Запустіть Laravel API сервер на `http://localhost:8000`
2. Запустіть React dev сервер на `http://localhost:5173`
3. Перевірте всі сторінки:
   - Головна сторінка
   - Реєстрація користувача
   - Реєстрація лікаря
   - Авторизація
   - Профілі лікарів

## Можливі проблеми та рішення

### CORS помилки
Переконайтеся, що CORS налаштовано правильно в Laravel.

### API не відповідає
Перевірте, чи запущений Laravel сервер на правильному порту.

### Помилки завантаження даних
Перевірте, чи існують необхідні API маршрути та методи контролера.

## Підтримка

Для питань та проблем створіть issue або зверніться до розробника.

