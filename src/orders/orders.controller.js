const { stat } = require("fs");
const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

function orderExists(req, res, next) {
    const { orderId } = req.params;
    const foundOrder = orders.find(order => order.id === orderId);

    if (foundOrder) {
        res.locals.order = foundOrder;
        return next()
    } else {
        next({
            status: 404,
            message: `Order id not found: ${orderId}`
        })
    }
}

function mobileNumberIsValid(req, res, next) {
    const { data: { mobileNumber } = {} } = req.body;

    if (!mobileNumber) {
        next({
            status: 400,
            message: `A 'mobileNumber' is required.`,
        });
    }
    return next();
}

function dishesIsValid(req, res, next) {
    const { data: { dishes } = {} } = req.body;

    if (!dishes || dishes.length <= 0 || !Array.isArray(dishes)) {
        next({
            status: 400,
            message: `A 'dish' or 'dishes' are required.`,
        });
    }
    return next();
}

function dishQuantityIsValid(req, res, next) {
    const { data: { dishes } = {} } = req.body;
    const missingQuantity = dishes.find(dish => !dish.quantity);
    const quantityNaN = dishes.find(dish => !Number.isInteger(dish.quantity));

        if (missingQuantity || quantityNaN) {
            const index = dishes.indexOf(quantityNaN);
            next({
                status: 400,
                message: `Dish ${index} must have a quantity that is an integer greater than 0.`
            });
        }
        return next();
    }

function deliverToIsValid(req, res, next) {
    const { data: { deliverTo } = {} } = req.body;

    if (!deliverTo) {
        next({
            status: 400,
            message: `A 'deliverTo' is required.`,
        });
    }
    return next();
}

function statusExists(req, res, next) {
    const { data: { status } = {} } = req.body;

    if (!status) {
        next({
            status: 400,
            message: `A 'status' is required.`,
        });
    }
    return next();
}

function statusIsValid(req, res, next) {
    const { data: { status } = {} } = req.body;
    if (status === 'pending' ||
        status === 'preparing' ||
        status === 'out-for-delivery' ||
        status === 'delivered')
        {
            return next();
    }
    next({
        status: 400,
        message: `Order must have a status of pending, preparing, out-for-delivery, delivered`,
    })
}

function statusNotPending(req, res, next) {
    const order = res.locals.order;
    const { status } = order;

    if (status !== "pending") {
        next({
            status: 400,
            message: `This order is no longer 'pending' and can no longer be canceled, status: ${status}.`,
        })
    }
    return next();
}



function orderMatchId(req, res, next) {
    const { orderId } = req.params;
    const { data: { id } } = req.body;
    if (orderId === id || !id) {
        return next();
    }
    next({
        status: 400,
        message: `An 'id' property must be valid, received ${id}.`,
    });
}

function create(req, res) {
    const { data: {
        deliverTo,
        mobileNumber,
        status,
        dishes: [
          {
            name,
            description,
            image_url,
            price,
            quantity,
          },
        ],
    } = {} } = req.body;

    const newOrder = {
        id: nextId(),
        deliverTo,
        mobileNumber,
        status,
        dishes: [
          {
            id: nextId(),
            name,
            description,
            image_url,
            price,
            quantity,
          },
        ],
    }
    orders.push(newOrder);
    res.status(201).json({ data: newOrder });
}

function update(req, res) {
    const order = res.locals.order;
    const originalDeliverTo = order.deliverTo;
    const originalMobileNumber = order.mobileNumber;
    const originalStatus = order.status;
    const originalDishes = order.dishes;

    const { data: {
        deliverTo,
        mobileNumber,
        status,
        dishes,
    } = {} } = req.body;

    if (originalDeliverTo !== deliverTo) {
        order.deliverTo = deliverTo;
    }

    if (originalMobileNumber !== mobileNumber) {
        order.mobileNumber = mobileNumber;
    }

    if (originalStatus !== status) {
        order.status = status;
    }

    if (originalDishes !== dishes) {
        order.dishes = dishes;
    }

    res.json({ data: order });
};

function destroy(req, res) {
    const { orderId } = req.params;
    const index = orders.find(order => order.id === Number(orderId));
    orders.splice(index, 1);
    res.sendStatus(204);
}

function list(req, res) {
    res.json({ data: orders });
};

function read(req, res) {
    res.json({ data: res.locals.order });
};

module.exports = {
    create: [deliverToIsValid,
            mobileNumberIsValid,
            dishesIsValid,
            dishQuantityIsValid,
            create],
    list,
    read: [orderExists, read],
    update: [orderExists,
            orderMatchId,
            deliverToIsValid,
            mobileNumberIsValid,
            statusExists,
            statusIsValid,
            dishesIsValid,
            dishQuantityIsValid,
            update],
    delete: [orderExists,
            statusNotPending,
            destroy],
}