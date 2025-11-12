import mongoose, { Schema } from "mongoose";

const likeSchema = new Schema(
  {
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
    },
    playlist: {
      type: Schema.Types.ObjectId,
      ref: "Playlist",
    },
    comment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
    bit: {
      type: Schema.Types.ObjectId,
      ref: "Bit",
    },
    likedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Like = mongoose.model("Like", likeSchema);
