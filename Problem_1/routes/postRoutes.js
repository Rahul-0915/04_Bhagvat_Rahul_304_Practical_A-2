const express = require('express');
const router = express.Router();
const { auth, isAuthorOrAdmin } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const postController = require('../controllers/postController');

// Public route - get all published posts
router.get('/public', postController.getPublishedPosts);

// Protected routes
router.post('/', auth, postController.createPost);
router.get('/', auth, postController.getPosts);
router.get('/:id', auth, postController.getPost);
router.put('/:id', auth, isAuthorOrAdmin, postController.updatePost);
router.delete('/:id', auth, isAuthorOrAdmin, postController.deletePost);

//  Image upload route with Multer
router.post('/:id/image',
  auth,
  isAuthorOrAdmin,
  upload.single('image'),
  postController.uploadImage
);

module.exports = router;