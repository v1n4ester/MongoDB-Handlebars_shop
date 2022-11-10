const toCurrency = price => {
    return  new Intl.NumberFormat('ua-UA', { // глобальний об'єкт для форматування цін
        currency: 'uah',
        style: 'currency'
    }).format(price) // заносимо створене значення
}

const toDate = date => {
    return new Intl.DateTimeFormat('ua-Ua', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    }).format(new Date(date))
}

document.querySelectorAll('.date').forEach(node => {
    node.textContent = toDate(node.textContent)
})

document.querySelectorAll('.price').forEach(node=>{
    node.textContent = toCurrency(node.textContent)
})

const $cart = document.querySelector('#cart')

if($cart) {
    $cart.addEventListener('click', event =>{
        if(event.target.classList.contains('js-remove')){
            const id = event.target.dataset.id
            const csrf = event.target.dataset.csrf
            console.log(csrf)

            fetch('/cart/remove/' + id, {
                method: 'delete',
                headers: {
                    'X-XSRF-TOKEN': csrf
                }
            }).then(res => res.json())
            .then(cart => {
                if(cart.courses.length){
                    // обновляємо сторінку якщо є щось в корзині
                    const html = cart.courses.map(c => {
                        return `
                        <tr>
                            <td>${c.title}</td>
                            <td>${c.count}</td>
                            <td>
                            <button class ="btn btn-small js-remove" data-id="${c.id}">Remove</button>
                            </td>
                        </tr>
                        `
                    }).join('')
                    $cart.querySelector('tbody').innerHTML = html
                    $cart.querySelector('.price').textContent = toCurrency(cart.price)
                }else {
                    // показуємо що в корзині нічого немає
                    $cart.innerHTML = `<p>Cart is empty</p>`
                }
            })
        }
    })
}

M.Tabs.init(document.querySelectorAll('.tabs'))