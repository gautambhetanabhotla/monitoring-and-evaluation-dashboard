import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Image name is required"]
  },
  type: {
    type: String,
    required: [true, "Image MIME type is required"]
  },
  data: {
    type: String, // base64 encoded
    required: [true, "Image data is required"]
  }
}, { _id: false });

const successStorySchema = new mongoose.Schema({
  projectid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project ID is required']
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  text: {
    type: String,
  },
  images: {
    type: [imageSchema],
    default: []
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const SuccessStory = mongoose.model('SuccessStory', successStorySchema);

export default SuccessStory;
