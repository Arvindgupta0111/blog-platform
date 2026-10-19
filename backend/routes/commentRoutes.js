
const express = require('express');
const mongoose = require('mongoose');
const Comment = require('../models/Comment');
const Blog = require('../models/Blog');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all comments for a blog
router.get('/blog/:blogId', async (req, res) => {
  try {
    const { blogId } = req.params;

    if (!mongoose.isValidObjectId(blogId)) {
      return res.status(400).json({ message: 'Invalid blog ID' });
    }

    const comments = await Comment.find({ blog: blogId })
      .populate('author', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, comments });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch comments' });
  }
});

// Add a comment
router.post('/blog/:blogId', auth, async (req, res) => {
  try {
    const { blogId } = req.params;
    const content = req.body?.content?.trim();

    if (!mongoose.isValidObjectId(blogId)) {
      return res.status(400).json({ message: 'Invalid blog ID' });
    }

    if (!content || content.length > 2000) {
      return res.status(400).json({
        message: 'Comment must contain 1–2000 characters',
      });
    }

    const blog = await Blog.findById(blogId);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const comment = await Comment.create({
      content,
      blog: blogId,
      author: req.user.id,
    });

    await comment.populate('author', 'name');

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      comment,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add comment' });
  }
});

// Delete your own comment
router.delete('/:id', auth, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid comment ID' });
    }

    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({
        message: 'You can delete only your own comments',
      });
    }

    await comment.deleteOne();

    res.json({
      success: true,
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete comment' });
  }
});

module.exports = router;
