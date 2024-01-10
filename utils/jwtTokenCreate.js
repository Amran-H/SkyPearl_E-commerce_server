const jwt = require("jsonwebtoken");

const jwtTokenCreate = async (data) => {
    const token = await jwt.sign(data, process.env.SECRET, { expiresIn: '24h' })

    return token
}

module.exports = { jwtTokenCreate };