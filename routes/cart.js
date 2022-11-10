const {Router} = require('express')
//const Cart = require('../models/cart_old')
const Course = require('../models/course')
const auth = require('../middleware/auth')
const router = Router()

function mapCartItems(cart) {
    return cart.items.map(c =>({
        ... c.courseId._doc,
        id: c.courseId._id,
        count: c.count
    }))
}

function computePrice(courses) {
    return courses.reduce((acc, el) =>(acc += el.count * el.price), 0)
}

router.post('/add', auth, async(req, res)=>{
    //const course = await Course.getById(req.body.id)
    const course = await Course.findById(req.body.id)
    //await Cart.add(course)
    // await req.user.addToCart(course)
    await req.user.addToCart(course)
    res.redirect('/cart')
})

router.delete('/remove/:id', auth, async (req, res) => {
    // const cart = await Cart.remove(req.params.id)
    await req.user.removeFromCart(req.params.id)

    const user = await req.user.populate('cart.items.courseId')
    const courses = mapCartItems(user.cart)
    const cart = {
        courses,
        price: computePrice(courses)
    }
    res.status(200).json(cart)
})

router.get('/', auth, async(req, res)=>{
    // const cart = await Cart.fetch()
    // res.json({test: true})
    const user = await req.user
    .populate('cart.items.courseId')

    const courses = mapCartItems(user.cart)
    res.render('cart', {
        title: 'Cart',
        isCart: true,
        courses: courses,
        price: computePrice(courses)
    })
})

module.exports = router