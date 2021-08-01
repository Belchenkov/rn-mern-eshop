const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');

const router = express.Router();

const Product = require('../models/product');
const Category = require('../models/category');

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
};

// multer config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('Invalid image type!');

        if (isValid) uploadError = null;

        cb(uploadError, 'public/uploads');
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.split(' ').join('-');
        const extension = FILE_TYPE_MAP[file.mimetype];
        cb(null, `${fileName}-${Date.now()}.${extension}`);
    }
});
const uploadOptions = multer({ storage: storage });

router.get('/', async (req, res) => {
    let filter = {};

    if (req.query.categories) {
        filter = {
            category: req.query.categories.split(',')
        };
    }

    const products = await Product
        .find(filter)
        .populate('category');

    if (!products) {
        res.status(500).json({ success: false });
    }
    res.status(200).json({
        success: true,
        products
    });
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).send('Invalid Product id!');
    }

    const product = await Product.findById(id)
        .populate('category');

    if (!product) {
        return res.status(404).send('The product is not found!');
    }

    res.status(200).json({
        success: true,
        product
    });
});

router.post('/', uploadOptions.single('image'), async (req, res) => {
    const {
        name,
        description,
        richDescription,
        brand,
        price,
        category,
        countInStock,
        rating,
        numReview,
        isFeatured
    } = req.body;
    const file = req.file;

    if (! file) {
        return res.status(400).send('No image in the request!');
    }

    const fileName = req.file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

    if (!mongoose.isValidObjectId(category)) {
        return res.status(400).send('Invalid Category id!');
    }

    const checkCategory = await Category.findById(category);
    if (!checkCategory) {
        return res.status(404).send('Invalid category!');
    }

    const product = new Product({
        name,
        description,
        richDescription,
        image: basePath + fileName,
        brand,
        price,
        category,
        countInStock,
        rating,
        numReview,
        isFeatured
    });

    try {
        const newProduct = await product.save();

        if (!product) {
            return res.status(500).send('The product cannot be created!');
        }

        res.status(201).json({
            newProduct,
            success: true
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error,
            success: false
        });
    }
});

router.put(`/:id`, uploadOptions.single('image'), async (req, res) =>{
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).send('Invalid Product id!');
    }

    const {
        name,
        description,
        richDescription,
        brand,
        price,
        category,
        countInStock,
        rating,
        numReview,
        isFeatured
    } = req.body;
    const { file } = req;

    try {
        if (!mongoose.isValidObjectId(category)) {
            return res.status(400).send('Invalid Category id!');
        }

        const checkCategory = await Category.findById(category);
        if (!checkCategory) {
            return res.status(404).send('Invalid category!');
        }

        const product = await Product.findById(id);
        if (! product) {
            return res.status(404).send('Invalid product!');
        }

        let imagePath = product.image;

        if (file) {
            const fileName = req.file.filename;
            const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
            imagePath = `${basePath}${fileName}`;
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            {
                name,
                description,
                richDescription,
                image: imagePath,
                brand,
                price,
                category,
                countInStock,
                rating,
                numReview,
                isFeatured
            }, { new: true });

        if(! updatedProduct) {
            res.status(404).json({
                success: false,
                message: 'The product cannot by updated!'
            });
        }

        res.status(200).json({
            success: true,
            updatedProduct
        });
    } catch (error) {
        console.error(error.name + ': ' + error.message);
        return res.status(400).json({
            success: false,
            error
        });
    }
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).send('Invalid Product id!');
    }

    try {
        const product = await Product.findByIdAndRemove(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'The product is not found!'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'The product is deleted!'
        });
    } catch (error) {
        console.error(error.name + ': ' + error.message);
        return res.status(400).json({
            success: false,
            error
        });
    }
});

router.get('/get/count', async (req, res) => {
    const productCount = await Product.countDocuments(count => count);

    if (!productCount) {
        return res.status(400).send('Cannot return count products!');
    }

    res.status(200).json({
        success: true,
        productCount
    });
});

router.get('/get/featured/:count', async (req, res) => {
    const count = req.params.count || 0;

    const products = await Product
        .find({ isFeatured: true })
        .limit(+count);

    if (!products) {
        return res.status(400).send('Cannot return featured products!');
    }

    res.status(200).json({
        success: true,
        products
    });
});

router.put(
    '/gallery-images/:id',
    uploadOptions.array('images', 10),
    async (req, res
) => {
        const { id } = req.params;
        const { files } = req;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).send('Invalid Product id!');
        }

        const imagesPaths = [];
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

        if (files) {
            files.map(file => imagesPaths.push(`${basePath}${file.filename}`))
        }

        try {
            const product = await Product.findByIdAndUpdate(
                id,
                { images: imagesPaths },
                { new: true }
            );

            if (! product) {
                return res.status(400).send('Cannot update product!');
            }

            res.status(200).json({
                success: true,
                product
            });
        } catch (error) {
            console.error(error.name + ': ' + error.message);
            return res.status(400).json({
                success: false,
                error
            });
        }
});

module.exports = router;
