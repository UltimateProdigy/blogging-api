const Blog = require("../model/Blog");

const getAllBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find({ state: "published" })
            .populate("author")
            .sort({ createdAt: -1 });

        if (!blogs || blogs.length === 0) {
            return res
                .status(404)
                .json({ message: "No published blogs found" });
        }
        res.status(200).json({
            success: true,
            count: blogs.length,
            data: blogs,
        });
    } catch (e) {
        res.status(500).json({
            success: false,
            message: "Error fetching blogs",
            error: e.message,
        });
    }
};

const getSingleBlog = async (req, res) => {
    const { id } = req.params;
    if (!id) return res.status(500).json({ message: "Blog ID is required" });
    try {
        const blog = Blog.findById(id).populate("author");
        if (!blog) {
            return res.status(404).json({ message: "No blog found" });
        }
        blog.read_count += 1;
        await blog.save();
        res.status(200).json({ success: true, data: blog });
    } catch (e) {
        res.status(500).json({
            success: false,
            message: "Error fetching blog",
            error: e.message,
        });
    }
};

const createBlog = async (req, res) => {
    try {
        const { title, body, description, tags, author } = req.body;

        const existingBlog = await Blog.findOne({ title });
        if (existingBlog) {
            return res.status(400).json({
                success: false,
                message: "A blog with this title already exists",
            });
        }

        const newBlog = await Blog.create({
            title: title.trim(),
            body,
            description: description.trim(),
            tags: tags || [],
            author,
            state: "draft",
            read_count: 0,
        });

        res.status(201).json({
            success: true,
            message: "Blog created successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error creating blog",
            error: error.message,
        });
    }
};

module.exports = { getAllBlogs, getSingleBlog, createBlog };
