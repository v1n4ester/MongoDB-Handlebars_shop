const { Router } = require('express')
const User = require('../models/user')
const nodemailer = require('nodemailer')
const sendgrid = require('nodemailer-sendgrid-transport')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const { validationResult } = require('express-validator')
const resetEmail = require('../emails/reset')
const keys = require('../keys')
const { registerValidators, loginValidators } = require('../utils/validators')
const regEmail = require('../emails/registration')

const router = Router()

const transporter = nodemailer.createTransport(// передаємо сервіс для відправки email
    sendgrid({ // об'єкт конфігурації
        auth: { api_key: keys.SENDGRID_API_KEY }
    }))

router.get('/login', async (req, res) => [
    res.render('auth/login', {
        title: 'Authorize',
        isLogin: true,
        loginError: req.flash('loginError'), // з одним параметром працює як geter
        registerError: req.flash('registerError')
    })
])

router.get('/logout', async (req, res) => {
    req.session.destroy(() => { // очищуєм данні сессії
        res.redirect('/auth/login#login') // виконується після очищення
    })

})

router.post('/login', loginValidators, async (req, res) => {
    try {
        const { email, password } = req.body

        const errors = validationResult(req)
            if (!errors.isEmpty()) {
                req.flash('loginError', errors.array()[0].msg)
                return res.status(422).redirect('/auth/login#login')
            }

        const candidate = await User.findOne({ email })

        req.session.user = candidate
        req.session.isAuthenticated = true // створюєм власну змінну при успішному логу
        req.session.save(err => { // для того щоб сессія себе перезаписала перед виконанням redirect
            if (err) {
                throw err
            } else {
                res.redirect('/')
            }
        })

        // if (candidate) {
        //     const isSame = await bcrypt.compare(password, candidate.password) // метод для підюирання під хеш
        //     if (isSame) {
        //         //const user = await User.findById('6365107ebfde6f2678c5787d')
        //         //req.session.user = user
        //         req.session.user = candidate
        //         req.session.isAuthenticated = true // створюєм власну змінну при успішному логу
        //         req.session.save(err => { // для того щоб сессія себе перезаписала перед виконанням redirect
        //             if (err) {
        //                 throw err
        //             } else {
        //                 res.redirect('/')
        //             }
        //         })
        //     } else {
        //         req.flash('loginError', 'Wrong password')
        //         res.redirect('/auth/login#login')
        //     }
        // } else {
        //     req.flash('loginError', 'This user is not exist')
        //     res.redirect('/auth/login#login')
        // }
    } catch (e) {
        console.log(e)
    }
})

router.post('/register', registerValidators,// можемо вказувати безліч middlewares
    async (req, res) => {
        try {
            const { email, password, name } = req.body

            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                // є помилки в валідації
                req.flash('registerError', errors.array()[0].msg)
                return res.status(422).redirect('/auth/login#register')
            }

            // if (candidate) {
            //     req.flash('registerError', // назва сповіщення
            //     'User with the same email is exist') // текст сповіщення
            //     res.redirect('/auth/login#register')
            // } else {
            const hashPassword = await bcrypt.hash(password, 10 // кількість символів за якими зашифрується пароль
            )
            const user = new User({
                email,
                name,
                password: hashPassword,
                cart: { items: [] }
            })
            await user.save()

            await transporter.sendMail(regEmail(email)) // відправка емейлів, рекомендується після редіректів
            res.redirect('/auth/login#login')
            //}
        } catch (e) {
            console.log(e)
        }
    })

router.get('/reset', (req, res) => {
    res.render('auth/reset', {
        title: 'Forgot a password?',
        error: req.flash('error')
    })
})

router.get('/password/:token', async (req, res) => {
    if (!req.params.token) {
        return res.redirect('auth/login')
    }
    try {
        const user = await User.findOne({
            resetToken: req.params.token,
            resetTokenExp: { $gt: Date.now() }// більше ніж Date.now
        })

        if (!user) {
            return res.redirect('/auth/login')
        } else {
            res.render('auth/password', {
                title: 'Reseting access',
                error: req.flash('error'),
                userId: user._id.toString(),
                token: req.params.token
            })
        }
    } catch (e) {
        console.log(e)
    }
})

router.post('/reset', (req, res) => {
    try {
        crypto.randomBytes(32, async (err, buffer) => { // генеруємо випадковий ключ
            if (err) {
                req.flash('error', 'Something gone wrong, try again later')
                return res.redirect('/auth/reset')
            }

            const token = buffer.toString('hex') // получаємо токен
            const candidate = await User.findOne({ email: req.body.email })

            if (candidate) {
                candidate.resetToken = token
                candidate.resetTokenExp = Date.now() + 3600000 // 1 година
                await candidate.save()
                await transporter.sendMail(resetEmail(candidate.email, token))
                res.redirect('/auth/login')
            } else {
                req.flash('error', 'This email is not exist')
                res.redirect('/auth/reset')
            }
        })
    } catch (e) {
        console.log(e)
    }
})

router.post('/password', async (req, res) => {
    try {
        const user = await User.findOne({
            resetToken: req.body.token,
            _id: req.body.userId,
            resetTokenExp: { $gt: Date.now() }
        })

        if (user) {
            user.password = await bcrypt.hash(req.body.password, 10)
            user.resetToken = undefined
            user.resetTokenExp = undefined
            await user.save()
            res.redirect('auth/login')
        } else {
            req.flash('loginError', 'Lifetime of the token is over')
            res.redirect('/auth/login')
        }
    } catch (e) {
        console.log(e)
    }
})

module.exports = router