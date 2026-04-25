'use strict';

const { Router }   = require('express');
const controller   = require('../controllers/userController');
const validate     = require('../middleware/validate');

const router = Router();

/**
 * @route  GET  /api/v1/users
 * @route  POST /api/v1/users
 */
router
  .route('/')
  .get(controller.getAllUsers)
  .post(validate(['name', 'email']), controller.createUser);

/**
 * @route  GET    /api/v1/users/:id
 * @route  PUT    /api/v1/users/:id
 * @route  DELETE /api/v1/users/:id
 */
router
  .route('/:id')
  .get(controller.getUserById)
  .put(controller.updateUser)
  .delete(controller.deleteUser);

module.exports = router;
