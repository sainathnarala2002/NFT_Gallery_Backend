// const jwt = require('jsonwebtoken');
// const User = require('../models/user');

// const authenticate = async (req, res, next) => {
//     try {
//         const token = req.headers["x-access-token"]
//         // check if token is received
//         if(!token){
//             return res.status(403).send("token is required for authentication")
//         }
//         // verify token with build-in function jwt.verify
//         const verifyToken = jwt.verify(token, process.env.SECRET_KEY);
//         // console.log(verifyToken)
//         // find rootUser
//         let rootUser = await User.findOne({_id: verifyToken._id})
//         if(!rootUser) {
//             rootUser = await admin.findOne({_id: verifyToken._id})
//         }
//         if(!rootUser){
//             throw new Error("USER NOT FOUND")
//         }
//         // assign token, rootUser and user_id their values in req object
//         req.token = token;
//         req.rootUser = rootUser;
//         req.userId = rootUser._id
    
//         next();
//     } catch (error) {
//         console.log(error)
//         res.status(401).send("unauthorized")
//     }
// }

// module.exports = authenticate;


const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(403).json({ message: "Token is required for authentication" });
        }

        const token = authHeader.split(' ')[1];
        console.log("Received Token: ", token);

        const verifyToken = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Token Verified: ", verifyToken);

        let rootUser = await User.findOne({ _id: verifyToken.user.id });
        if (!rootUser) {
            throw new Error("User not found");
        }

        req.token = token;
        req.rootUser = rootUser;
        req.userId = rootUser._id;

        next();
    } catch (error) {
        console.log("Authentication Error: ", error.message);
        return res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
    }
};

module.exports = authenticate;
