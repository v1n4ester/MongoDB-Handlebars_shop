const { body } = require('express-validator')
const User = require('../models/user')
const bcrypt = require('bcryptjs')

exports.registerValidators = [
    body('email')
        .isEmail().withMessage('Write correct email')
        .custom(async (value, { req }) => {
            try {
                const user = await User.findOne({ email: value })
                if (user) {
                    return Promise.reject('This email is exist')
                }
            } catch (e) {
                console.log(e)
            }
        })
        .normalizeEmail(), // виправить криво введений email

    body('password', 'Password must be at least 6 symbols')
        .isLength({ min: 6, max: 56 })
        .isAlphanumeric()
        .trim(), // видаляє лишні пробіли

    body('confirm')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords does not match')
            }
            return true
        })
        .trim(),

    body('name').isLength({ min: 3 })
        .withMessage('Name must be at least 3 symbols')
        .trim(),

]

exports.loginValidators = [
    body('email')
        .isEmail().withMessage('Write correct email')
        .normalizeEmail()
        .custom(async (value, { req }) => {
            try {
                const user = await User.findOne({ email: value })
                if (user) {
                    return true
                } else {
                    return Promise.reject('User with this email does not exist')
                }
            } catch (e) {
                console.log(e)
            }
        }),

    body('password', 'Password must be at least 4 symbols')
        .isLength({ min: 4, max: 56 })
        .isAlphanumeric()
        .custom(async (value, { req }) => {
            try {
                const candidate = await User.findOne({email: req.body.email})
                const isSame = await bcrypt.compare(value, candidate.password) // метод для підюирання під хеш
                if (isSame) {
                    return true
                }else {
                    return Promise.reject('Wrong password')
                }
            } catch (e) {
                console.log(e)
            }
        })
]

exports.courseValidators = [
    body('title').isLength({min: 3}).withMessage('Minimum length of name is 3 symbol').trim(),
    body('price').isNumeric().withMessage('Write correct price'),
    body('img', 'Write correct Url of image').isURL()
]