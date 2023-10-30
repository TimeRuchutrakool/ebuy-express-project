const createError = require('../utils/create-error');
const jwt = require('jsonwebtoken')
const prisma = require('../models/prisma')

// จัดการเรื่อง authenticated token ของ user

module.exports = async (req,res,next)=>{
    try {
        const authorization =req.headers.authorization;
        if(!authorization || !authorization.startsWith('Bearer '))
        {
            return next(createError('unauthenticated',401))
        }
         // Bearer xxxxxxxxx 
        // index[0] Bearer
        // index[1] token
        const token = authorization.split(' ')[1] // ค่า token
        // นำ token ที่ได้จากการ ถอดรหัส ใน authorization มาเช็คเพื่อหาค่า userId
        // เมื่อได้ userid ให้นำไปหาใน table user ว่ามีค่าไหม
        const payload = jwt.verify(token,process.env.JWT_SECRET_KEY || 'qwerasdfzxc')
        const user = await prisma.user.findUnique({
            where : {
                id : payload.userId
            }
        })

        if(!user)
        {
            return next(createError('unautheticated',401))
        }

        delete user.password // delete password before send data to user
        req.user = user
        next();
    } catch (error) {
        if(error.name === 'TokenExpireError' || error.name === 'JsonWebTokenError')
        {
            error.statusCode = 401;
        }
        next(error)
    }
}