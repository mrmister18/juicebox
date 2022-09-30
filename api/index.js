const express = require('express');
const apiRouter = express.Router();

const usersRouter = require('./users');
const postsRouter = require('./posts');
const tagsRouter = require('./tags');
apiRouter.use('/posts', postsRouter);
apiRouter.use('/users', usersRouter);
apiRouter.use('/tags', tagsRouter);

module.exports = apiRouter;