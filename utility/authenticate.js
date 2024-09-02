const jwt = require('jsonwebtoken');
const Users = require('../models/user');

const authenticate = async (req, res, next) => {
    try {
        const token = req.headers["x-access-token"]
        // check if token is received
        if(!token){
            return res.status(403).send("token is required for authentication")
        }
        // verify token with build-in function jwt.verify
        const verifyToken = jwt.verify(token, process.env.SECRET_KEY);
        // console.log(verifyToken)
        // find rootUser
        let rootUser = await Users.findOne({_id: verifyToken._id})
        if(!rootUser) {
            rootUser = await admin.findOne({_id: verifyToken._id})
        }
        if(!rootUser){
            throw new Error("USER NOT FOUND")
        }
        // assign token, rootUser and user_id their values in req object
        req.token = token;
        req.rootUser = rootUser;
        req.userId = rootUser._id
    
        next();
    } catch (error) {
        console.log(error)
        res.status(401).send("unauthorized")
    }
}

module.exports = authenticate;