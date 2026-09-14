const Post = require('../models/Post');
const { deleteFile } = require('../middleware/upload');
const path = require('path');

// Create Post
const createPost = async (req, res) => {
  try {
    const { title, content, tags, published } = req.body;

    const post = new Post({
      title,
      content,
      tags: tags || [],
      published: published || false,
      author: req.userId
    });

    await post.save();
    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post
    });
  } catch (error) {
    console.error('Create Post Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get All Posts
const getPosts = async (req, res) => {
  try {
    const posts = await Post.find({ author: req.userId })
      .sort({ createdAt: -1 });
    res.json({ success: true, posts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Single Post
const getPost = async (req, res) => {
  try {
    const post = await Post.findOne({
      _id: req.params.id,
      author: req.userId
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json({ success: true, post });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Post
const updatePost = async (req, res) => {
  try {
    const { title, content, tags, published } = req.body;
    const post = req.post;

    post.title = title || post.title;
    post.content = content || post.content;
    post.tags = tags || post.tags;
    post.published = published !== undefined ? published : post.published;

    await post.save();
    res.json({
      success: true,
      message: 'Post updated successfully',
      post
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete Post - WITH IMAGE DELETION
const deletePost = async (req, res) => {
  try {
    const post = req.post;

    // Delete featured image if exists
    if (post.featuredImage) {
      const filePath = path.join(__dirname, '..', post.featuredImage);
      deleteFile(filePath);
    }

    await Post.findByIdAndDelete(post._id);
    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Upload Image - WITH FILE DELETION ON REPLACE
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const post = req.post;
    const imagePath = req.file.path;

    // Delete old image if exists (replace)
    if (post.featuredImage) {
      const oldPath = path.join(__dirname, '..', post.featuredImage);
      deleteFile(oldPath);
    }

    post.featuredImage = imagePath;
    await post.save();

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      imageUrl: `/${imagePath}`
    });
  } catch (error) {
    // If upload fails, delete the uploaded file
    if (req.file) {
      deleteFile(req.file.path);
    }
    res.status(500).json({ error: error.message });
  }
};

// Get Published Posts
const getPublishedPosts = async (req, res) => {
  try {
    const posts = await Post.find({ published: true })
      .populate('author', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, posts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
  uploadImage,
  getPublishedPosts
};