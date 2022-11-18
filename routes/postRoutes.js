const express = require('express');
const router = express.Router();
const { protect } = require('../middleswares/authMiddlewares')
const { 
    createPost, 
    createComment, 
    createReply,
    getAllPost,
    getOnePost,
    searchPost
 } = require('../controllers/postControllers')


router.route('/')
    .post(protect, createPost)
    .get(protect, getAllPost)

router.route('/search').get(protect, searchPost)

router.route('/:id')
    .get(protect, getOnePost)

router.route('/comment').post(protect, createComment);
router.route('/reply').post(protect, createReply)


module.exports = router