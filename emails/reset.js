const keys = require('../keys')

module.exports = function (email, token) {
    return { 
        to: email,
        from: keys.EMAIL_FROM,
        subject: 'Reset an access',
        html: `
            <h1>You forgot a password?</h1>
            <p>If not then ignore this message</p>
            <p>Else you should press the link below</p>
            <p><a href="${keys.BASE_URL}/auth/password/${token}">Reset an access</a></p>
            <hr />
            <a href='${keys.BASE_URL}'>Courses store</a>
        `
    }
}