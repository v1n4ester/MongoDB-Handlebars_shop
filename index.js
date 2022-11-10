const express = require('express')
const path = require('path')
const csrf = require('csurf')
const flash = require('connect-flash')
const mongoose = require('mongoose')
const helmet = require('helmet')
const exphbs = require('express-handlebars')
const session = require('express-session')
const compression = require('compression')
const MongoStore = require('connect-mongodb-session')(session) // функція в яку треба передати пакет для синхронізації
const homeRoutes = require('./routes/home')
const addRoutes = require('./routes/add')
const profileRoutes = require('./routes/profile')
const coursesRoutes = require('./routes/courses')
const cartRoutes = require('./routes/cart')
const fileMiddleware = require('./middleware/file')
const ordersRoutes = require('./routes/orders')
const authRoutes = require('./routes/auth')
//const User = require('./models/user')
const varMiddleware = require('./middleware/variables')
const userMiddleware = require('./middleware/user')
const errorHandler = require('./middleware/error')
const keys = require('./keys')

const app = express()

const hbs = exphbs.create({
    defaultLayout: 'main',
    extname: 'hbs',
    helpers: require('./utils/hbs-helpers'),
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true
    }
}) // робимо об'єкт handlebars
const store = new MongoStore({
    collection: 'sessions', // вказуєм таблицю в якій буде сессія
    uri: keys.MONGODB_URI
})

app.engine('hbs', hbs.engine) // реєструємо движок для рендеренгу html сторінок

app.set('view engine', // одне із фіксованих значень
    'hbs' // модуль який хочемо використовувати
) // використовуємо зареєстрований движок

app.set('views',
    'views'// назва папки де будуть зберігатись шаблони
)

// app.use(async (req, res, next) => {  // Без next не будуть працювати наступні use
//     try {
//         const user = await User.findById('6365107ebfde6f2678c5787d')
//         req.user = user
//         next()
//     } catch (e) {
//         console.log(e)
//     }

// }) // створюєм власний midleware

app.use(express.static(path.join(__dirname, 'public'))// створення статичної папки
) // добавлення нових midlewares
app.use('/images', express.static(path.join(__dirname, 'images')))

app.use(express.urlencoded({ extended: true })) // опрацьовуєм дані з форми . має бути перед роутами
app.use(session({
    secret: keys.SESSION_SECRET, // строка на основі якої шифрується сессія
    resave: false,
    saveUninitialized: false,
    store: store // конектимо сессію до БД
}))
app.use(fileMiddleware.single('avatar')) // передаємо поле куди буде складатись файл
app.use(csrf()) // мусить бути після створення сессії
app.use(flash())
app.use(helmet({
    contentSecurityPolicy: false,
}))
app.use(compression())

app.use(varMiddleware)
app.use(userMiddleware)

app.use('/', homeRoutes) // реєструємо роути
app.use('/add', addRoutes)
app.use('/courses', coursesRoutes)
app.use('/cart', cartRoutes)
app.use('/orders', ordersRoutes)
app.use('/auth', authRoutes)
app.use('/profile', profileRoutes)

app.use(errorHandler) // треба підключати в самому кінці


const PORT = process.env.PORT || 3000

async function start() {
    try {
        await mongoose.connect(keys.MONGODB_URI, {
            useNewUrlParser: true
        })
        // const candidate = await User.findOne() //  якщо є хоч один користувач, то ми його получимо
        // if (!candidate) {
        //     // якщо немає користувачів то створюєм дефолтного
        //     const user = new User({
        //         email: 'vlad@gmail.com',
        //         name: 'Vlad',
        //         cart: { items: [] }
        //     })
        //     await user.save()
        // }
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`)
        })
    } catch (e) {
        console.log(e)
    }
}

start()
