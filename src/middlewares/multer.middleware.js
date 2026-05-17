import multer from "multer";

const storage = multer.diskStorage({        // string file iin temporary disk storage
    destination: function (request,file,callback){
        callback(null,"./public/temp")
    },
    filename: function(request,file,callback){
        callback(null,file.originalname)
    }
})

export const upload = multer({
    storage
})