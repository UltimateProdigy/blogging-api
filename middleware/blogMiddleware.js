function calculateReadingTime(text) {
    if (!text) return 1;

    const plainText = text.replace(/<[^>]*>/g, "");
    const wordCount = plainText
        .split(/\s+/)
        .filter((word) => word.length > 0).length;
    return Math.max(1, Math.ceil(wordCount / 200));
}

function preSaveBlog(next) {
    if (this.body) {
        this.reading_time = calculateReadingTime(this.body);
    }
    next();
}

function preUpdateBlog(next) {
    const update = this.getUpdate();
    if (update.body) {
        update.reading_time = calculateReadingTime(update.body);
    }
    next();
}

module.exports = {
    preSaveBlog,
    preUpdateBlog,
};
