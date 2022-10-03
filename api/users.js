const express = require('express');
const usersRouter = express.Router();
const { getAllUsers, getUserByUsername, createUser, getUserById, updateUser } = require('../db');
const { requireUser } = require('./utils')
const jwt = require('jsonwebtoken');

usersRouter.use((req, res, next) => {
  console.log("A request is being made to /users");

  next();
});

usersRouter.get('/', async (req, res) => {
    const users = await getAllUsers();

  res.send({
    users
    });
  });

  usersRouter.post('/login', async (req, res, next) => {
    const { username, password } = req.body;
  
    if (!username || !password) {
      next({
        name: "MissingCredentialsError",
        message: "Please supply both a username and password"
      });
    }
  
    try {
      const user = await getUserByUsername(username);
      const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET);
  
      if (user && user.password == password) {
        res.send({ message: "you're logged in!",
      token: token });
      } else {
        next({ 
          name: 'IncorrectCredentialsError', 
          message: 'Username or password is incorrect'
        });
      }
    } catch(error) {
      console.log(error);
      next(error);
    }
  });

  usersRouter.post('/register', async (req, res, next) => {
    const { username, password, name, location } = req.body;
  
    try {
      const _user = await getUserByUsername(username);
  
      if (_user) {
        next({
          name: 'UserExistsError',
          message: 'A user by that username already exists'
        });
      }
  
      const user = await createUser({
        username,
        password,
        name,
        location,
      });
  
      const token = jwt.sign({ 
        id: user.id, 
        username
      }, process.env.JWT_SECRET, {
        expiresIn: '1w'
      });
  
      res.send({ 
        message: "thank you for signing up",
        token 
      });
    } catch ({ name, message }) {
      next({ name, message })
    } 
  });

  usersRouter.delete('/:userId', requireUser, async (req, res, next) => {
    try {
      const user = await getUserById(req.params.userId)
      if (user.id === req.user.id) {
        const deletedUser = await updateUser(user.id, { active: false })
        res.send({result : deletedUser})
      } else {
        next(user ? {
          name : "UnauthorizedUserError",
          message : "You cannot delete a user that is not your own"
        } : {
          name : "UserNotFoundError", 
          message : "The user you are trying to delete does not exist"
        })
      }
    } catch ({ name, message }) {
      next({name, message})
    }
  })

  usersRouter.patch('/:usersId', requireUser, async (req, res, next) => {
    try {
      const user = await getUserById(req.params.usersId)
      if (user.id) {
        const reactivatedUser = await updateUser(user.id, { active: true })
        res.send({ result: reactivatedUser })
      } else {
        next(user ? {
          name : "UnauthorizedUserError",
          message : "You cannot reactivate a user that is not your own"
        } : {
          name : "UserNotFoundError", 
          message : "The user you are trying to reactivate does not exist"
        })
      }
    } catch ({ name, message }) {
      next({name, message})
    }
  })

module.exports = usersRouter;