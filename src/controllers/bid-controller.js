const prisma = require("../models/prisma");
const fs = require("fs/promises");
const { upload } = require("../utils/cloudinaryServices");
const dayjs = require('dayjs')
const duration = require('dayjs/plugin/duration')

const createError = require("../utils/create-error");



exports.createBidProducts = async (req,res,next) =>{
try {
    const sellerId = req.user.id;
    const data = req.body   //  data.timeDuration  จำนวน ชม ที่รับเข้ามา
    const files = req.files
    // console.log(files.length)
    console.log(data)
    // time start 20.00 
    // time bid  
    // 1 hr => 60 min 
    // 1 min = 60 second => 60*60=  3600 second => 3600000 millisecond
    
    const changTimeDuration =(input)=> (input*60*60)*1000

    dayjs.extend(duration)
    const timeStart = dayjs(data.startTime)  // data.startTime '2023-11-10 20:00' 
    const timeEnd =timeStart.add(dayjs.duration({'hour' : data.timeDuration})) //####
    const timeDuration = timeEnd.diff(timeStart) // ####

    console.log("timeDuration = ",timeDuration ,"millisecond") // ####
    
    console.log("start=",timeStart)
    console.log("end",timeEnd)

    if (!req.files) {
        next(createError("bid-product image is required", 400));
      }

    const bidProduct = await prisma.bidProduct.create({
        data :{
            name : data.name,
            description : data.description,
            initialPrice : data.price,
            sellerId : sellerId,
            startedAt : timeStart,
            duration : timeEnd,
        }
    })
    console.log(bidProduct)

    // const urls = [];
    
    // for (const file of files) {
    //   const { path } = file;
    //   const url = await upload(path);
    //   urls.push(url);
    
    // }
    
    // const images = [];
    // for (const image of urls) {
    //   images.push({ imageUrl: image, bidProductId: bidProduct.id });
    // }

    // await prisma.productImage.createMany({
    //     data: images,
    //   });

    res.status(200).json({message: "OK"})
} catch (err) {
    next(err);
} finally {
    if (req.files) {
        for( let i = 0 ; i<req.files.length ; i++){
            fs.unlink(req.files[i].path)
        }
    }
  }
}

exports.getBidProducts = async (req,res,next)=>{
  try {
        const userId = req.user.id
        console.log(userId)
        const findBidProduct = await prisma.bidProduct.findMany({
          where :{
            sellerId : userId
          },include : {
            ProductImage : true
          }
          
        })
        console.log(findBidProduct)
        // const timeDuration = findBidProduct[63].startAt.diff(findBidProduct[63].endAt) // ####
        const timeStart = dayjs(findBidProduct[63].startAt)
        const timeEnd = dayjs(findBidProduct[63].endAt)
        const timeDuration = timeEnd.diff(timeStart)
        console.log("timeDuration = ",timeDuration ,"millisecond")
        // const data = findBidProduct.map( (el)=> {
        //   return {
        //     id : el.id,
        //     name :el.name,
        //     description : el.description,
        //     price : el.initialPrice,
        //     timeStart :el.startAt,
        //     timeDuration : 
        //   }
        // })
    res.status(200).json({message:"ok"})
  } catch (err) {
    next(err)
  }
}