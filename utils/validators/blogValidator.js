const Joi = require("joi");

const createBlogSchema = Joi.object({
    title: Joi.string().trim().min(3).max(200).required().messages({
        "string.empty": "Title is required",
        "string.min": "Title must be at least 3 characters long",
        "string.max": "Title cannot exceed 200 characters",
    }),

    body: Joi.string().trim().min(10).required().messages({
        "string.empty": "Body is required",
        "string.min": "Body must be at least 10 characters long",
    }),

    description: Joi.string().trim().min(10).max(500).required().messages({
        "string.empty": "Description is required",
        "string.min": "Description must be at least 10 characters long",
        "string.max": "Description cannot exceed 500 characters",
    }),

    tags: Joi.array()
        .items(Joi.string().trim().min(1).max(50))
        .max(10)
        .default([])
        .messages({
            "array.max": "Maximum 10 tags allowed",
            "string.max": "Each tag cannot exceed 50 characters",
        }),

    author: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
            "string.pattern.base": "Author must be a valid user ID",
        }),

    state: Joi.string().valid("draft", "published").default("draft").messages({
        "any.only": "State must be either draft or published",
    }),
});

const updateBlogSchema = Joi.object({
    title: Joi.string().trim().min(3).max(200).messages({
        "string.min": "Title must be at least 3 characters long",
        "string.max": "Title cannot exceed 200 characters",
    }),

    body: Joi.string().trim().min(10).messages({
        "string.min": "Body must be at least 10 characters long",
    }),

    description: Joi.string().trim().min(10).max(500).messages({
        "string.min": "Description must be at least 10 characters long",
        "string.max": "Description cannot exceed 500 characters",
    }),

    tags: Joi.array()
        .items(Joi.string().trim().min(1).max(50))
        .max(10)
        .messages({
            "array.max": "Maximum 10 tags allowed",
            "string.max": "Each tag cannot exceed 50 characters",
        }),

    state: Joi.string().valid("draft", "published").messages({
        "any.only": "State must be either draft or published",
    }),
});

module.exports = {
    createBlogSchema,
    updateBlogSchema,
};
