const {Router} = require('express')
const router = Router()

router.get('/', (req, res)=>{
    //res.sendFile(path.join(__dirname, 'views', 'index.html'))
    res.render('index', { // передаєм опції і параметри для сторінки
        title: 'Main page',
        isHome: true
    })
})



module.exports = router