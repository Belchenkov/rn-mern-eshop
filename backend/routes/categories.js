const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

const Category = require('../models/category');

router.get(`/`, async (req, res) =>{
    const categoryList = await Category.find();

    if(!categoryList) {
        res.status(500).json({success: false})
    }

    res.status(200).json({
        success: true,
        categoryList
    });
});

router.get(`/:id`, async (req, res) =>{
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).send('Invalid Product id!');
    }

    try {
        const category = await Category.findById(id);

        if(!category) {
            res.status(404).json({
                success: false,
                message: 'The category is not found!'
            })
        }

        res.status(200).send(category);
    } catch (error) {
        console.error(error.name + ': ' + error.message);
        return res.status(400).json({
            success: false,
            error
        });
    }
});

router.put(`/:id`, async (req, res) =>{
    const { id } = req.params;
    const { name, color, icon } = req.body;

    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).send('Invalid Product id!');
    }

    try {
        const category = await Category.findByIdAndUpdate(
            id,
        {
            name,
            icon,
            color
        }, { new: true });

        if(!category) {
            res.status(404).json({
                success: false,
                message: 'The category cannot by updated!'
            });
        }

        res.status(200).json({
            success: true,
            category
        });
    } catch (error) {
        console.error(error.name + ': ' + error.message);
        return res.status(400).json({
            success: false,
            error
        });
    }
});

router.post('/', async (req, res) => {
    const { name, icon, color } = req.body;

    try {
        const category = new Category({
            name,
            icon,
            color
        });

        const newCategory = await category.save();

        if (!newCategory) {
            return res.status(404).send('The category cannot be created!');
        }

        res.status(201).json({
            success: true,
            newCategory
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
        const category = await Category.findByIdAndRemove(id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'The category is not found!'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'The category is deleted!'
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
