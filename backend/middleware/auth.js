import jwt from 'jsonwebtoken';


export const verifyToken = (req, res, next) => {
    
    const token = req.cookies.token;

    if (!token) {
        return res.status(403).json({ message: "No token provided. Access Forbidden." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Unauthorized/Invalid Token" });
    }
};



export const isSuperAdmin = (req, res, next) => {
    if (req.user.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ message: "Require Super Admin Role!" });
    }
    next();
};