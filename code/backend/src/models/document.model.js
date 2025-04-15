import mongoose from 'mongoose';

const DocumentSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
  },
  kpiUpdate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'KPIUpdate',
  },
  filename: {
    type: String,
    // required: true,
  },
  mimeType: String,
  metadata: mongoose.Schema.Types.Mixed,  // store the entire exif object
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Document = mongoose.models.Document || mongoose.model('Document', DocumentSchema);

export default Document;