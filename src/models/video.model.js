import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema({
    videoFile : {
        type: String,  // URL from cloudinary
        required: true,
    },
    videoFilePubId : {
        type: String,  // publicID of videoFile from cloudinary(for deletion)
    },
    owner : {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    thumbnail : {
        type: String,  // URL from cloudinary
        required: true,
    },
    thumbnailPubId : {
        type: String,  // publicID of thumbnail from cloudinary
    },
    title : {
        type: String,
        required: true,
    },
    description : {
        type: String,
        required: true,
    },
    views : {
        type: Number,
        default: 0 
    },
    duration : {
        type: Number, // provided by cloudinary
        required: true,
    },
    isPublished : {
        type: Boolean,
        default: true 
    }
}, {timestamps: true})

videoSchema.index({
    title: "text",
    description: "text"
})

videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video",videoSchema)