const express = require('express');
const mongoose = require("mongoose");
const router = express.Router();

const Order = require('../models/order');
const OrderItem = require('../models/orderItem');

router.get(`/`, async (req, res) =>{
    const orderList = await Order.find()
        .populate('user', 'name')
        .sort({
            'dateOrdered': -1
        });

    if (!orderList) {
        res.status(500).json({
            success: false,
            message: 'Cannot get list of orders!'
        });
    }
    res.status(200).json({
        success: true,
        orderList
    });
});

router.get(`/:id`, async (req, res) => {
    const { id } = req.params;

    if (! mongoose.isValidObjectId(id)) {
        return res.status(400).send('Invalid Order id!');
    }

    try {
        const order = await Order.findById(id)
            .populate('user', 'name')
            .populate({
                path: 'orderItems',
                populate: {
                    path: 'product',
                    populate: 'category'
                }
            });

        if (! order) {
            res.status(404).json({
                success: false,
                message: 'The order is not found!'
            });
        }

        res.status(200).json({
            success: true,
            order
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
    const {
        orderItems,
        shippingAddress1,
        shippingAddress2,
        city,
        zip,
        country,
        phone,
        status,
        user
    } = req.body;

    const orderItemsIdsPromise = Promise.all(orderItems.map(async item => {
        let newOrderItem = new OrderItem({
            quantity: item.quantity,
            product: item.product
        });
        newOrderItem = await newOrderItem.save();
        return newOrderItem._id;
    }));

    const orderItemsIds = await orderItemsIdsPromise;

    const totalPrices = await Promise.all(orderItemsIds.map(async orderItemId => {
        const orderItem = await OrderItem
            .findById(orderItemId)
            .populate('product', 'price');

        if (! orderItem) {
            return res.status(404).json({
                success: false,
                message: 'The orderItem is not found!'
            });
        }

        return orderItem.product.price * orderItem.quantity;
    }));

    const totalPrice = totalPrices.reduce((a, b) => a + b, 0);

    try {
        const order = new Order({
            orderItems: orderItemsIds,
            shippingAddress1,
            shippingAddress2,
            city,
            zip,
            country,
            phone,
            status,
            totalPrice,
            user
        });

        const newOrder = await order.save();

        if (!newOrder) {
            return res.status(500).send('The order cannot be created!');
        }

        res.status(201).json({
            success: true,
            order
        });
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
    const { status } = req.body;

    if (! mongoose.isValidObjectId(id)) {
        return res.status(400).send('Invalid Order id!');
    }

    try {
        const order = await Order.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if(! order) {
            return res.status(500).json({
                success: false,
                message: 'The order cannot by updated!'
            });
        }

        return res.status(200).json({
            success: true,
            order
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
        return res.status(400).send('Invalid Order id!');
    }

    try {
        const order = await Order.findByIdAndRemove(id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'The order is not found!'
            });
        }

        await order.orderItems.map(async item => {
           await OrderItem.findByIdAndRemove(item);
        });

        return res.status(200).json({
            success: true,
            message: 'The order is deleted!'
        });
    } catch (error) {
        console.error(error.name + ': ' + error.message);
        return res.status(400).json({
            success: false,
            error
        });
    }
});

router.get(`/get/total-sales`, async (req, res) =>{
    const totalSales = await Order.aggregate([
        {
            $group: {
                _id: null,
                totalSales: {
                    $sum: '$totalPrice'
                }
            }
        }
    ]);

    if (! totalSales) {
        res.status(400).json({
            success: false,
            message: 'The order sales cannot be generated!'
        });
    }

    res.status(200).json({
        success: true,
        totalSales: totalSales.pop().totalSales
    });
});

router.get('/get/count', async (req, res) => {
    const orderCount = await Order.countDocuments(count => count);

    if (! orderCount) {
        return res.status(400).send('Cannot return count orders!');
    }

    res.status(200).json({
        success: true,
        orderCount
    });
});

router.get(`/get/user-orders/:userId`, async (req, res) =>{
    const { userId } = req.params;

    if (!mongoose.isValidObjectId(userId)) {
        return res.status(400).send('Invalid User ID!');
    }

    const userOrderList = await Order.find({ user: userId })
        .populate({
            path: 'orderItems',
            populate: {
                path: 'product',
                populate: 'category'
            }
        })
        .sort({
            'dateOrdered': -1
        });

    if (! userOrderList) {
        res.status(400).json({
            success: false,
            message: 'Cannot get list orders of user!'
        });
    }

    res.status(200).json({
        success: true,
        userOrderList
    });
});

module.exports = router;