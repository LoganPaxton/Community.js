const express = require('express');
const Post = require('../models/Post');
const { authenticate } = require('../middleware');

const router = express.Router();

router.post('/', authenticate, async (req, res, next) => {
    try {
        const { content } = req.body;
        const post = new Post({ content, author: req.user.id });
        await post.save();
        res.json({ message: 'Post created successfully.', post });
    } catch (err) {
        next(err);
    }
});

router.get('/', authenticate, async (req, res, next) => {
    try {
        const posts = await Post.find().populate('author', 'username');
        res.json(posts);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
