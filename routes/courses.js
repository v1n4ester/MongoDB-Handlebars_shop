const { Router } = require('express')
const Course = require('../models/course')
const auth = require('../middleware/auth')
const { validationResult } = require('express-validator')
const { courseValidators } = require('../utils/validators')
const router = Router()

function isOwner(course, req) {
    return course.userId.toString() === req.user._id.toString()
}

router.get('/', async (req, res) => {
    try {
        // const courses = await Course.getAll()  
        const courses = await Course.find() // забираємно всі курси які є в базі данних
            .populate('userId', // робимо з userId об'єкт з всіма інакшими значеннями в User
                'email name' // вказуємно які поля нам необхідно передати в userId
            )
            .select('price title img') // вказуємо які мають бути в об'єкті courses ключі окрім userId
        res.render('courses', {
            title: 'Courses',
            isCourses: true,
            userId: req.user ? req.user._id.toString() : null,
            courses,
        })
    } catch (e) {
        console.log(e)
    }

})

router.get('/:id/edit', auth, async (req, res) => {
    if (!req.query.allow) {
        return res.redirect('/')
    }

    try {
        // const course = await Course.getById(req.params.id)
        const course = await Course.findById(req.params.id)

        if (!isOwner(course, req)) {
            return res.redirect('/courses')
        }

        res.render('courseEdit', {
            title: `Edit ${course.title}`,
            course,
            error: req.flash('error')
        })
    } catch (e) {
        console.log(e)
    }
})

router.post('/edit', auth, courseValidators, async (req, res) => {
    try {
        const errors = validationResult(req)
        const { id } = req.body
        if (!errors.isEmpty()) {
            req.flash('error', errors.array()[0].msg)
            return res.status(422).redirect(`/courses/${id}/edit?allow=true`)
        }
        
        delete req.body.id // забираємо id тому що в mongoose він є по дефолту з нижньою рискою
        const course = await Course.findById(id)
        if (!isOwner(course, req)) {
            return res.redirect('/courses')
        }
        Object.assign(course, req.body) // замінюєм поля
        await course.save()
        //await Course.update(req.body)
        //await Course.findByIdAndUpdate(id, req.body) // перший параметр - id по якому найдем елемент, другий - новий об'єкт для заміни
        res.redirect('/courses')
    } catch (e) {
        console.log(e)
    }

})

router.post('/remove', auth, async (req, res) => {
    try {
        await Course.deleteOne({
            _id: req.body.id,
            userId: req.user._id
        })
        res.redirect('/courses')
    } catch (e) {
        console.log(e)
    }
})

router.get('/:id', async (req, res) => {
    try {
        // const course = await Course.getById(req.params.id)
        const course = await Course.findById(req.params.id)
        res.render('course', {
            layout: 'empty',
            title: `Course ${course.title}`,
            course
        })
    } catch (e) {
        console.log(e)
    }

})



module.exports = router