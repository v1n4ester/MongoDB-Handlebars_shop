module.exports = function (req, res, next) {
    res.locals.isAuth = req.session.isAuthenticated // створили свою змінну з значенням логінізації
    res.locals.csrf = req.csrfToken()

    next() // для продовження ланцюга виконання middlewares
} 