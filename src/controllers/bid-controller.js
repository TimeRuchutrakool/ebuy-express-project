const prisma = require("../models/prisma");
const fs = require("fs/promises");
const { upload } = require("../utils/cloudinaryServices");
const dayjs = require('dayjs')
const duration = require('dayjs/plugin/duration')

const createError = require("../utils/create-error");



exports.createBidProducts = async(req,res,next) =>{
try {
    const sellerId = req.user.id;
    const data = req.body   //  data.timeDuration  จำนวน ชม ที่รับเข้ามา
    const files = req.files
    console.log(files.length)
    // console.log(data)
    // time start 20.00 
    // time bid  1 hr => 60 min => 60*60=  3600 second => 3600000 millisecond
    const changTimeDuration =(input)=> (input*60*60)*1000

    dayjs.extend(duration)
    const timeStart = dayjs('2023-11-10 20:00')  // data.startTime '2023-11-10 20:00' 
    
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
            startAt : timeStart,
            endAt : timeEnd,
        }
    })
    console.log(bidProduct)

    const urls = [];
    
    for (const file of files) {
      const { path } = file;
      const url = await upload(path);
      urls.push(url);
    
    }
    
    const images = [];
    for (const image of urls) {
      images.push({ imageUrl: image, bidProductId: bidProduct.id });
    }

    await prisma.productImage.createMany({
        data: images,
      });

    res.status(200).json({message: "OK"})
} catch (error) {
    next(error);
} finally {
    if (req.files) {
        for( let i = 0 ; i<req.files.length ; i++){
            fs.unlink(req.files[i].path)
        }
    }
  }
}