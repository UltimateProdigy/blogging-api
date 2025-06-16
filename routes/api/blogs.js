const express = require("express");
const router = express.Router();
const {
    getAllBlogs,
    getSingleBlog,
    createBlog,
    publishBlog,
    updateBlog,
    deleteBlog,
    getMyBlogs,
} = require("../../controllers/blogController");
const validateInput = require("../../middleware/validateInput");
const {
    createBlogSchema,
    updateBlogSchema,
} = require("../../utils/validators/blogValidator");
const { verifyJWT } = require("../../middleware/verifyJWT");

router.route("/").get(getAllBlogs);
router.route("/").post(verifyJWT, validateInput(createBlogSchema), createBlog);
router.route("/:id").get(getSingleBlog);
router
    .route("/:id")
    .put(verifyJWT, validateInput(updateBlogSchema), updateBlog);
router.route("/:id").delete(verifyJWT, deleteBlog);
router.route("/my-blogs").get(verifyJWT, getMyBlogs);
router.route("/:id/publish").post(verifyJWT, publishBlog);

module.exports = router;
