const keys = require('../keys')

module.exports = function (email) {
    return { 
        to: email,
        from: keys.EMAIL_FROM,
        subject: 'Registration success',
        html: `
            <h1>Welcome to our store</h1>
            <p>You seccessfully created account with email - ${email}</p>
            <hr />
            <a href='${keys.BASE_URL}'>Courses store</a>
        `
    }
}