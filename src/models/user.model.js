import mongoose,{Schema} from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const userSchema = new Schema({
    username : {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        unique: true,
        index: true    // for searching
    },
    email : {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        unique: true
    },
    fullName : {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    avatar : {
        type: String, // URL from cloudinary
        required: true
    },
    coverImage : {
        type: String, // URL from cloudinary
    },
    password : {
        type: String,
        required: [true,"Passwaord is required"]
    },
    refreshToken : {
        type: String,
    },
    watchHistory : [    // array of watched videos
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    ]
}, {timestamps: true})  // for createdAt & updatedAt

userSchema.pre("save", async function(next){              // using pre hook | *arrow function cant be use here 
    if(!this.isModified("password")) return next()   // only encrypt password if it is changed. NOT on each 'save'
    this.password = bcrypt.hash(this.password,8)
    next()
})

userSchema.methods.isPasswordCorrect = async function(password){      // custom method for password check in middleware
    return await bcrypt.compare(password,this.password)         // async/await bcz it takes time
}                                                               // password -> user, this.password -> database

userSchema.methods.generateAccessToken = function(){
    return jwt.sign({
        _id: this._id,    // _id stricly written in this way (from db)
        username: this.username,
        email: this.email,
        fullName: this.fullName
    },process.env.ACCESS_TOKEN_SECRET,{expiresIn: process.env.ACCESS_TOKEN_EXPIRY})
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign({
        _id: this._id
    },process.env.REFRESH_TOKEN_SECRET,{expiresIn: process.env.REFRESH_TOKEN_EXPIRY})
}
export const User = mongoose.model("User",userSchema)