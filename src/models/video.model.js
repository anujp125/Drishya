import mongoose from "mongoose"
const videoSchema =  new Schema(
  {
    videoFile : {
      type : String,
      required : true
    },
    thumbnail : {
      type : String,
    },
    title : {
      type : String,
    },
    description : {
      type : String,
    },
    duration : {
      type : Number,
    },
    views : {
      type : Number,
      default : true,
    },
    isPublished : {
      type : Boolean,
      default : true,
    },
    owner : {
      type : Schema.Types.ObjectId,
      ref : "User"
    }
  },
  {
    timestamps : true
  }
  )


  export const Video = mongoose.model("Video",videoSchema)