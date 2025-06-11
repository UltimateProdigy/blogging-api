const express = require("express");
const router = express.Router();
const {
    getAllBlogs,
    getSingleBlog,
    createBlog,
} = require("../../controllers/blogController");
const validateInput = require("../../middleware/validateInput")
const { createBlogSchema } = require("../../utils/validators/blogValidator")
const { verifyJwt } = require("../../middleware/verifyJWT");

router.route("/").get(getAllBlogs);
router.route("/").post(verifyJwt, validateInput(createBlogSchema), createBlog);
router.route("/:id").get(getSingleBlog);

module.exports = router;

//TODO: FIX CALLBACK CRASH