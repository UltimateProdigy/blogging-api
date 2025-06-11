const bcrypt = require("bcrypt");
const User = require("../model/User");
const jwt = require("jsonwebtoken");

const handleLogin = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email }).exec();
    if (!user) return res.status(400).json({ message: "User does not exist" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (validPassword) {
        const accessToken = jwt.sign(
            {
                email: user.email,
                id: user.id,
            },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn: "1h",
            }
        );
        res.json({
            message: "User is logged in!",
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
            },
            accessToken,
        });
    } else {
        res.status(401).json({ message: "Incorrect Password" });
    }
};

module.exports = { handleLogin };
