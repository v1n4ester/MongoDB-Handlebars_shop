const multer = require('multer')

const storage = multer.diskStorage({ // де і як має зберігатись файл
    destination(req, file, cb) { // куда необхідно складати даний файл
        cb(null, 'images') // перший аргумент помилка, 2 - шлях
    },
    filename(req, file, cb) { // як має бути названий новий файл
        cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname)
    }
})

const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg']

const fileFilter = (req, file, cb) => { // валідація для файлів
    if (allowedTypes.includes(file.mimetype)) {
        // успішна валідація
        cb(null, true)
    }else {
        // не проходить валідацію
        cb(null, false)
    }
}

module.exports = multer({
    storage: storage,
    fileFilter: fileFilter
})