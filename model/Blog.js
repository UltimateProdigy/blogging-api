const mongoose = require("mongoose");
const { Schema } = mongoose;
const { preSaveBlog, preUpdateBlog } = require("../middleware/blogMiddleware");

const blogSchema = new Schema(
    {
        title: {
            type: String,
            required: [true, "Title is required"],
            unique: true,
        },
        body: {
            type: String,
            required: [true, "Body is required"],
        },
        description: {
            type: String,
            required: [true, "Description is required"],
        },
        tags: {
            type: [String],
            default: [],
        },
        author: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        state: {
            type: String,
            enum: ["draft", "published"],
            default: "draft",
            required: true,
        },
        read_count: {
            type: Number,
            default: 0,
            min: 0,
        },
        reading_time: {
            type: Number,
        },
    },
    { timestamps: true }
);

blogSchema.pre("save", preSaveBlog);
blogSchema.pre("findOneAndUpdate", preUpdateBlog);

module.exports = mongoose.model("Blog", blogSchema);
