import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const playlistSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    videos: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category"
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

playlistSchema.plugin(mongooseAggregatePaginate);

export const Playlist = mongoose.model("Playlist", playlistSchema);
