
const express = require('express');
const mongoose = require('mongoose');
const Blog = require('../models/Blog');
const auth = require('../middleware/auth');

const router = express.Router();

const validCategories = [
  'Technology',
  'Programming',
  'Lifestyle',
];

// GET: All blogs
router.get('/', async (req, res) => {
  try {
    const blogs = await Blog.find()
      .populate('author', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, blogs });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not fetch blogs',
    });
  }
});

// GET: One blog
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid blog ID',
      });
    }

    const blog = await Blog.findById(req.params.id)
      .populate('author', 'name');

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found',
      });
    }

    res.json({ success: true, blog });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not fetch blog',
    });
  }
});

// POST: Create blog (login required)
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, category = 'Technology' } = req.body;

    if (
      typeof title !== 'string' ||
      typeof description !== 'string' ||
      title.trim().length < 3 ||
      title.trim().length > 150 ||
      description.trim().length < 10 ||
      description.trim().length > 10000
    ) {
      return res.status(400).json({
        success: false,
        message: 'Enter a valid title and description',
      });
    }

    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category',
      });
    }

    const blog = await Blog.create({
      title: title.trim(),
      description: description.trim(),
      category,
      author: req.user.id,
    });

    const result = await blog.populate('author', 'name');

    res.status(201).json({
      success: true,
      message: 'Blog created successfully',
      blog: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not create blog',
    });
  }
});

// PUT: Update your own blog
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, category } = req.body;

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid blog ID',
      });
    }

    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found',
      });
    }

    if (blog.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own blogs',
      });
    }

    if (title !== undefined) {
      if (
        typeof title !== 'string' ||
        title.trim().length < 3 ||
        title.trim().length > 150
      ) {
        return res.status(400).json({
          success: false,
          message: 'Invalid title',
        });
      }
      blog.title = title.trim();
    }

    if (description !== undefined) {
      if (
        typeof description !== 'string' ||
        description.trim().length < 10 ||
        description.trim().length > 10000
      ) {
        return res.status(400).json({
          success: false,
          message: 'Invalid description',
        });
      }
      blog.description = description.trim();
    }

    if (category !== undefined) {
      if (!validCategories.includes(category)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category',
        });
      }
      blog.category = category;
    }

    await blog.save();
    await blog.populate('author', 'name');

    res.json({
      success: true,
      message: 'Blog updated successfully',
      blog,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not update blog',
    });
  }
});

// DELETE: Delete your own blog
router.delete('/:id', auth, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid blog ID',
      });
    }

    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found',
      });
    }

    if (blog.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own blogs',
      });
    }

    await blog.deleteOne();

    res.json({
      success: true,
      message: 'Blog deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not delete blog',
    });
  }
});

module.exports = router;
