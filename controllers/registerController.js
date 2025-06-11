const User = require("../model/User");
const bcrypt = require("bcrypt");

const handleCreateUser = async (req, res) => {
    const { email, password, first_name, last_name, address } = req.body;
    const userExists = await User.findOne({ email: email }).exec();
    if (userExists) return res.sendStatus(409);
    try {
        const hashedPwd = await bcrypt.hash(password, 10);
        const result = await User.create({
            email,
            password: hashedPwd,
            first_name,
            last_name,
            address,
        });
        res.status(201).json({
            message: `Account Successfully Created`,
            id: result.id,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { handleCreateUser };
