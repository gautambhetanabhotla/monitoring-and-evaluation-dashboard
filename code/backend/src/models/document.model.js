import mongoose from 'mongoose';

const DocumentSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
  },
  kpiUpdateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'KPIUpdate',
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,  // store the JSON metadata
  },
  binaryData: {
    type: String,  // store the binary file data
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  createdBy : {
    type : mongoose.Schema.Types.ObjectId,
    ref : 'User',
    required : [true, 'Created by is required'],
  }
});

const Document = mongoose.models.Document || mongoose.model('Document', DocumentSchema);

export default Document;