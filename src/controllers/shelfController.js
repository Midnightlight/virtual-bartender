const { shelfModel } = require("../models/shelfModel")
const ingredientController = require("../controllers/ingredientController");
const { recipeModel } = require("../models/recipeModel");

async function listAll (req, res) {
    try {
        const data = await shelfModel.find().exec();
        res.send(data);
    } catch (error) {
        res.status(500).send(error);
    }
}

async function listShelf (req, res) {
    try {
        const data = await shelfModel.findById(req.params.id).exec();
        res.send(data);
    } catch (error) {
        res.status(500).send(error);
    }
}

async function createShelf (req, res) {
    try {
        const newShelf = new shelfModel(req.body);
        const data = await newShelf.save();
        res.send(data);
    } catch (error) {
        res.status(500).send(error);
    }
}

async function updateShelf (req, res) {
    try {   
        let shelfData = await shelfModel.findById(req.params.id).exec();
        shelfData.set(req.body);
        const data = await shelfData.save();
        res.send(data);
    } catch (error) {
        res.status(500).send(error);
    }
}

async function deleteShelf (req, res) {
    try {
        const data = await shelfModel.deleteOne({'_id': req.params.id}).exec();
        res.send(data);
    } catch (error) {
        res.status(500).send(error);
    }
}

////////////////////////
async function addIngredient (req, res) {
    try {   
        const newIngredientID = req.params.iid;
        let shelfData = await shelfModel.findById(req.params.id).exec();
        shelfData.content.push(newIngredientID);
        const data = await shelfData.save();
        res.send(data);
    } catch (error) {
        res.status(500).send(error);
    }
}

async function deleteIngredient (req, res) {
    try {   
        const newIngredientID = req.params.iid;
        let shelfData = await shelfModel.findById(req.params.id).exec();
        if (shelfData.content.includes(newIngredientID)) {
            const index = shelfData.content.indexOf(newIngredientID);
            shelfData.content.splice(index, 1);
            const data = await shelfData.save();
            res.send(data);
        } else {
            res.status(500).send({message: "No ingredient in bar shelf..."});
        }
    } catch (error) {
        res.status(500).send(error);
    }
}

async function findPossibleRecipes (req, res) {
    try {   
        const ingredientIDFromShelf = (await shelfModel.find().exec())[0].content;
        let ingredientNameFromShelf = [];
        for (const ingredientID of ingredientIDFromShelf) {
            ingredientNameFromShelf.push((await ingredientController.listIngredientDetail(ingredientID)).name);
        }
        console.log("Name of the ingredients from bar shelf extracted"); 
        console.log(ingredientNameFromShelf);
        
        const allRecipesData = await recipeModel.find().exec();
        const possibleRecipes = [];
        const impossibleRecipes = [];
        for (const recipeEntry of allRecipesData) {
            if (recipeEntry.ingredient.every(ingredient => ingredientNameFromShelf.includes(ingredient))) {
                possibleRecipes.push({ name: recipeEntry.name, id: recipeEntry._id });
            } else {
                impossibleRecipes.push({ name: recipeEntry.name, id: recipeEntry._id });
            }
        }
        res.json({ "Possible recipes": possibleRecipes, "Impossible recipes:" : impossibleRecipes});
    } catch (error) {
       res.status(500).send(error);
    }
}


module.exports = {
    listAll,
    listShelf,
    createShelf,
    updateShelf,
    deleteShelf,
    addIngredient,
    deleteIngredient,
    findPossibleRecipes
}