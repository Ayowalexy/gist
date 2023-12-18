const express = require("express");
const router = express.Router();
const { protect } = require("../middleswares/authMiddlewares");
const {
  createPost,
  createComment,
  createReply,
  getAllPost,
  getOnePost,
  searchPost,
  getAllPostComment,
  like,
} = require("../controllers/postControllers");
const multer = require("multer");
const { storage } = require("../cloudinary");

const upload = multer({ storage: storage });

router
  .route("/")
  .post(protect, upload.array("images"), createPost)
  .get(protect, getAllPost);

router.route("/search").get(protect, searchPost);

router.route("/:id").get(protect, getOnePost);

router.route("/comment").post(protect, createComment);

router.route("/comment/:id").get(protect, getAllPostComment);

router.route("/reply").post(protect, createReply);

router.route("/like").post(protect, like)

module.exports = router;
