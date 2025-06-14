const Blog = require("../model/Blog");

const getAllBlogs = async (req, res) => {
    try {
        const { state, search, author } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const sortBy = req.query.sortBy || "timestamp";
        const sortOrder = req.query.order === "asc" ? 1 : -1;

        const skip = (page - 1) * limit;

        const filter = {};
        if (state && ["draft", "published"].includes(state)) {
            filter.state = state;
        }

        const searchConditions = [];
        if (search) {
            searchConditions.push(
                { title: { $regex: search, $options: "i" } },
                { tags: { $in: [new RegExp(search, "i")] } },
                { "author.name": { $regex: search, $options: "i" } }
            );
        }

        if (author) {
            if (author.match(/^[0-9a-fA-F]{24}$/)) {
                filter.author = author;
            } else {
                searchConditions.push({
                    "author.name": { $regex: author, $options: "i" },
                });
            }
        }
        if (searchConditions.length > 0) {
            filter.$or = searchConditions;
        }

        const sortOptions = {};
        const validSortFields = ["read_count", "reading_time", "timestamp"];
        if (validSortFields.includes(sortBy)) {
            const sortField = sortBy === "timestamp" ? "createdAt" : sortBy;
            sortOptions[sortField] = sortOrder;
        } else {
            sortOptions.createdAt = -1;
        }

        let query = Blog.find(filter);

        if (search || (author && !author.match(/^[0-9a-fA-F]{24}$/))) {
            query = query.populate("author", "name email");
        }

        const totalBlogs = await Blog.countDocuments(filter);

        const blogs = await Blog.find(filter)
            .populate("author", "first_name")
            .sort(sortOptions)
            .skip(skip)
            .limit(limit)
            .select("-__v");

        const totalPages = Math.ceil(totalBlogs / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        return res.status(200).json({
            success: true,
            message: "Blogs retrieved successfully",
            data: {
                blogs,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalBlogs,
                    limit,
                    hasNextPage,
                    hasPrevPage,
                    nextPage: hasNextPage ? page + 1 : null,
                    prevPage: hasPrevPage ? page - 1 : null,
                },
                filters: {
                    state: state || "all",
                    search: search || null,
                    author: author || null,
                    sortBy,
                    order: req.query.order || "desc",
                },
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error retrieving blogs",
            error: error.message,
        });
    }
};

const getMyBlogs = async (req, res) => {
    try {
        const { state } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const author = req.user.id || req.user._id;

        const filter = { author };
        if (state && ["draft", "published"].includes(state)) {
            filter.state = state;
        }

        const totalBlogs = await Blog.countDocuments(filter);

        const blogs = await Blog.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select("-__v -author");

        const totalPages = Math.ceil(totalBlogs / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        return res.status(200).json({
            success: true,
            message: "Your blogs retrieved successfully",
            data: {
                blogs,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalBlogs,
                    limit,
                    hasNextPage,
                    hasPrevPage,
                    nextPage: hasNextPage ? page + 1 : null,
                    prevPage: hasPrevPage ? page - 1 : null,
                },
                filters: {
                    state: state || "all",
                },
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error retrieving your blogs",
            error: error.message,
        });
    }
};

const getSingleBlog = async (req, res) => {
    const { id } = req.params;
    if (!id) return res.status(500).json({ message: "Blog ID is required" });
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
            success: false,
            message: "Invalid Blog ID format",
        });
    }
    try {
        const blog = await Blog.findByIdAndUpdate(
            id,
            { $inc: { read_count: 1 } },
            { new: true }
        ).populate("author", "first_name last_name");

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found",
            });
        }
        return res.status(200).json({
            success: true,
            data: blog,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error fetching blog",
            error: error.message,
        });
    }
};

const createBlog = async (req, res) => {
    try {
        const { title, body, description, tags } = req.body;
        const author = req.user.id || req.user._id;
        if (!author) return res.sendStatus(401);
        const existingBlog = await Blog.findOne({ title });
        if (existingBlog) {
            return res.status(400).json({
                success: false,
                message: "A blog with this title already exists",
            });
        }

        await Blog.create({
            title: title.trim(),
            body,
            description: description.trim(),
            tags: tags || [],
            author,
            state: "draft",
            read_count: 0,
        });

        return res.status(201).json({
            success: true,
            message: "Blog created successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error creating blog",
            error: error.message,
        });
    }
};

const publishBlog = async (req, res) => {
    const { id } = req.params;
    try {
        const blog = await Blog.findById(id);
        if (!blog)
            return res.status(404).json({ message: "Blog does not exist" });
        blog.state = "published";
        await blog.save();
        return res.status(200).json({
            success: true,
            message: "Blog published successfully",
        });
    } catch (e) {
        return res.status(500).json({
            success: false,
            message: "Error publishing blog",
            error: e.message,
        });
    }
};

const updateBlog = async (req, res) => {
    const { id } = req.params;
    const author = req.user.id || req.user._id;

    try {
        const blog = await Blog.findById(id);

        if (blog.author.toString() !== author.toString()) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized: You can only delete your own blogs",
            });
        }
        const result = await Blog.findOneAndUpdate(
            { _id: id },
            { $set: req.body },
            { new: true, runValidators: true }
        );

        if (!result) {
            return res.status(403).json({
                success: false,
                message: "Blog not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Blog updated successfully",
            blog: result,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Update failed",
            error: error.message,
        });
    }
};

const deleteBlog = async (req, res) => {
    const { id } = req.params;
    const author = req.user.id || req.user._id;

    try {
        const blog = await Blog.findById(id);

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found",
            });
        }

        if (blog.author.toString() !== author.toString()) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized: You can only delete your own blogs",
            });
        }

        await Blog.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Blog deleted successfully",
        });
    } catch (e) {
        return res.status(500).json({
            success: false,
            message: "Error deleting blog",
            error: e.message,
        });
    }
};

module.exports = {
    getAllBlogs,
    getSingleBlog,
    createBlog,
    publishBlog,
    updateBlog,
    deleteBlog,
    getMyBlogs,
};
