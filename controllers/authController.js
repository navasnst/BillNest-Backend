const User = require("../models/User")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")


//REGISTER USER

exports.registerUser = async (req, res) => {
    try {
        const { name, email, password, businessName } = req.body

        const userExists = await User.findOne({ email })

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Please enter a valid email address" })
        }

        const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/

        if (!passwordRegex.test(password)) {
            return res.status(400).json({ message: "Password must be at least 8 characters and include at least one uppercase letter, one number, and one special character" })
        }

        if (userExists) {
            return res.status(400).json({ message: "User already exists" })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            businessName
        })

        const token = jwt.sign({ id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" })

        res.status(201).json({
            success: true, user: { id: user._id, name: user.name, email: user.email, businessName: user.businessName }, token
        })

    } catch (error) {
        res.status(500).json({ error: error.message })
    }

}


//LOGIN


exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body

        const user = await User.findOne({ email })

        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" })
        }

        const token = jwt.sign({ id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" })

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                businessName: user.businessName
            }
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}


//GET USER

exports.getUser = async (req, res) => {
    try {
        const { id } = req.params
        const user = await User.findById(id).select("-password")

        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        res.json(user)

    } catch (error) {
        res.status(500).json({ error: error.message })
    }

}

//UPDATE USER


exports.updateUser = async (req, res) => {
    try {

        const { id } = req.params
        const { name, email, password, businessName } = req.body

        const user = await User.findById(id)

        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        if (name) user.name = name
        if (email) user.email = email
        if (businessName) user.businessName = businessName

        if (password) {
            const salt = await bcrypt.genSalt(10)
            user.password = await bcrypt.hash(password, salt)
        }

        const updateUser = await user.save()

        res.json({
            message: "User updated successfully",
            user: updateUser
        })

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}



//DELETE USER


exports.deleteUser = async (req, res) => {
    try {

        const { id } = req.params

        const user = await User.findByIdAndDelete(id)

        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        res.json({ message: "User deleted successfully" })

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}


