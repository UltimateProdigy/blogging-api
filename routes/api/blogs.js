const express = require("express");
const router = express.Router();
const {
    getAllBlogs,
    getSingleBlog,
    createBlog,
    publishBlog,
    updateBlog,
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
router.route("/:id/publish").get(verifyJWT, publishBlog);
router
    .route("/:id")
    .put(verifyJWT, validateInput(updateBlogSchema), updateBlog);

module.exports = router;
