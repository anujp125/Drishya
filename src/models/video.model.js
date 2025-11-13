import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const { Schema } = mongoose;

const videoSchema = new Schema(
  {
    videoFile: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
      required: false,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    playlist: {
      type: Schema.Types.ObjectId,
      ref: "Playlist",
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Apply plugin before model creation
videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video", videoSchema);
