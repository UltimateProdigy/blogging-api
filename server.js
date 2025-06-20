require("dotenv").config();
const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
const { errorHandler } = require("./middleware/errorHandler");
const connectDb = require("./config/connectDb");

const PORT = process.env.PORT || 3500

connectDb();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());

app.use("/auth/register", require("./routes/auth/register"));
app.use("/auth/login", require("./routes/auth/login"));
app.use("/api/blogs", require("./routes/api/blogs"));

app.all("*", (req, res) => {
    res.status(404);
    if (req.accepts("html")) {
        res.sendFile(path.join(__dirname, "views", "404.html"));
    } else if (req.accepts("json")) {
        res.json({ error: "404 Not Found" });
    } else res.type("txt").send("404 Not Found");
});

app.use(errorHandler);

mongoose.connection.once("open", () => {
    if (process.env.NODE_ENV !== "test") {
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    }
});

module.exports = app;
