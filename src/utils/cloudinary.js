import {v2 as cloudinary} from "cloudinary";
import fs from "fs"   // file system

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET  // Click 'View API Keys' above to copy your API secret
});

const uploadOnCloudinary = async (filePath)=>{      // takes file path of temporary stored file from local storage
    try{
        if(!filePath) return null;
        const response = await cloudinary.uploader.upload(filePath,{    
            resource_type : "auto"
        })
        fs.unlinkSync(filePath)
        return response;
    }catch(error){
        fs.unlinkSync(filePath);  // file upload fail on cloudnary SO DELETE it synchronously from local storage also
        return null;
    }
}

export default uploadOnCloudinary;
