const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

function dishExists(req, res, next) {
    const { dishId } = req.params;
    const foundDish = dishes.find(dish => dish.id === dishId);

    if (foundDish) {
        res.locals.dish = foundDish;
        return next();
    } else {
        next({
            status: 404,
            message: `Dish id not found: ${dishId}`,
        })
    }
}

function dishNameIsValid(req, res, next) {
    const { data: { name } = {} } = req.body;
    
    if (!name) {
        next({
            status: 400,
            message: `A 'name' is required.`,
        })
    }
    return next();
}

function dishDescriptionIsValid(req, res, next) {
    const { data: { description } = {} } = req.body;
    
    if (!description) {
        next({
            status: 400,
            message: `A 'description' is required.`,
        })
    }
    return next();
}

function dishUrlIsValid(req, res, next) {
    const { data: { image_url } = {} } = req.body;
    
    if (!image_url) {
        next({
            status: 400,
            message: `An 'image_url' is required.`,
        })
    }
    return next();
}

function dishPriceIsValid(req, res, next) {
    const { data: { price } = {} } = req.body;
    
    if (!price || price <= 0 || !Number.isInteger(price)) {
        next({
            status: 400,
            message: `A valid 'price' is required. Price must be a number and cannot be 0.`,
        })
    }
    return next();
}

function dishMatchId(req, res, next) {
    const { dishId } = req.params;
    const { data: { id } } = req.body;
    if (dishId === id || !id) {
        return next();
    }
    next({
        status: 400,
        message: `An 'id' property must be valid, received ${id}.`,
    });
};

function create(req, res) {

    const { data: {
        name,
        description,
        price,
        image_url,
    } = {} } = req.body;

    const newDish = {
        id: nextId(),
        name,
        description,
        price,
        image_url,
    }
    dishes.push(newDish);
    res.status(201).json({ data: newDish });
};

function update(req, res) {

    const dish = res.locals.dish;
    const originalName = dish.name;
    const originalDescription = dish.description;
    const originalPrice = dish.price;
    const originalUrl = dish.image_url;

    const { data: {
        name,
        description,
        price,
        image_url,
    } = {} } = req.body;

    if (originalName !== name) {  
        dish.name = name;
    }

    if (originalDescription !== description) {    
        dish.description = description;
    }
    if (originalPrice !== price) {    
        dish.price = price;
    }
    if (originalUrl !== image_url) {    
        dish.originalUrl = image_url;
    }

    res.json({ data: dish });
};

function list(req, res) {
    res.json({ data: dishes });
};

function read(req, res) {
    res.json({ data: res.locals.dish });
};

module.exports = {
    create: [dishNameIsValid,
            dishDescriptionIsValid,
            dishUrlIsValid,
            dishPriceIsValid,
            create],
    list,
    read: [dishExists, read],
    update: [dishExists,
            dishMatchId,
            dishNameIsValid,
            dishDescriptionIsValid,
            dishUrlIsValid,
            dishPriceIsValid,
            update],
}