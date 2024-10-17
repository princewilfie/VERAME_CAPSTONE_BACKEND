const express = require('express');
const router = express.Router();
const validateRequest = require('_middleware/validate-request');
const Joi = require('joi');
const rewardService = require('./reward.service');
const authorize = require('_middleware/authorize');
const multer = require('_middleware/multer-config'); // Import multer for image handling

// Routes
router.post('/', authorize('Admin'), multer.single('reward_Image'), createSchema, create); // Add image upload
router.get('/', getAll);
router.get('/admin', authorize('Admin'), getAllForAdmin); // Admins see all rewards
router.get('/:id', getById);
router.put('/:id', authorize('Admin'), multer.single('reward_Image'), updateSchema, update); // Add image upload
router.delete('/:id', authorize('Admin'), _delete);
router.post('/redeem', redeem); // Now you don't need ':id' in the route

module.exports = router;

// Validation schemas
function createSchema(req, res, next) {
    const schema = Joi.object({
        reward_Name: Joi.string().required(),
        reward_Description: Joi.string().required(),
        reward_PointCost: Joi.number().required(),
        reward_Quantity: Joi.number().required(),
        // Make reward_Status optional
        reward_Status: Joi.string().valid('Active', 'Inactive').optional(), 
        // Make acc_id optional
        acc_id: Joi.number().optional() 
    });
    validateRequest(req, next, schema);
}

function updateSchema(req, res, next) {
    const schema = Joi.object({
        reward_Name: Joi.string().optional(),
        reward_Description: Joi.string().optional(),
        reward_PointCost: Joi.number().optional(),
        reward_Quantity: Joi.number().optional(),
        // Make reward_Status optional
        reward_Status: Joi.string().valid('Active', 'Inactive').optional(),
    });
    validateRequest(req, next, schema);
}

// Controller functions
function create(req, res, next) {
    rewardService.create(req.body, req.file) // Pass file info for image upload
        .then(reward => res.json(reward))
        .catch(next);
}

function getAll(req, res, next) {
    rewardService.getAll()
        .then(rewards => res.json(rewards))
        .catch(next);
}


function getAllForAdmin(req, res, next) {
    rewardService.getAllForAdmin()
        .then(rewards => res.json(rewards))
        .catch(next);
}

function getById(req, res, next) {
    rewardService.getById(req.params.id)
        .then(reward => res.json(reward))
        .catch(next);
}

function update(req, res, next) {
    rewardService.update(req.params.id, req.body, req.file) // Pass file info for image upload
        .then(reward => res.json(reward))
        .catch(next);
}

function _delete(req, res, next) {
    rewardService._delete(req.params.id)
        .then(() => res.json({ message: 'Reward deleted successfully' }))
        .catch(next);
}

function redeem(req, res, next) {
    const rewardId = req.body.reward_id; // Get reward ID from the request body
    const accountId = req.body.acc_id;   // Get account ID from the request body
    const address = req.body.address;    // Get address from the request body

    rewardService.redeem(rewardId, accountId, address)
        .then(() => res.json({ message: 'Reward redeemed successfully' }))
        .catch(next);
}