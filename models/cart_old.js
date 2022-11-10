const path = require('path')
const fs = require('fs')

const p = path.join(
    path.dirname(process.mainModule.filename), // вказуємо що ми йдем від абсолютного шляху до 2 параметра
    'data',
    'cart.json'
)

class Cart {
    static async add(course) {
        const cart = await Cart.fetch()

        const idx = cart.courses.findIndex(c => c.id === course.id)
        const candidate = cart.courses[idx]

        if(candidate) {
            //  курс вже є
            candidate.count++
            cart.courses[idx] = candidate
        }else {
            // треба добавити
            course.count = 1
            cart.courses.push(course)
        }

        cart.price += +course.price

        return new Promise((resolve, reject) =>{
            fs.writeFile(p, JSON.stringify(cart), err=>{
                if(err) reject(err)

                resolve()
            })
        })
    }

    static async fetch() {
        return new Promise((resolve, reject)=>{
            fs.readFile(p, 'utf-8', (err, data)=>{
                if(err) reject(err)

                resolve(JSON.parse(data))
            })
        })
    }

    static async remove(id) {
        const cart = await Cart.fetch()

        const idx = cart.courses.findIndex(c => c.id === id)
        const course = cart.courses[idx]

        if(course.count === 1){
            // видалити
            cart.courses = cart.courses.filter(c => c.id !== id)
        }else {
            // змінити кількість
            cart.courses[idx].count--
        }

        cart.price -= course.price

        return new Promise((resolve, reject) =>{
            fs.writeFile(p, JSON.stringify(cart), err=>{
                if(err) reject(err)

                resolve(cart)
            })
        })
    }
}

module.exports = Cart 