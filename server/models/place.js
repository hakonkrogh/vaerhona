import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const placeSchema = new Schema({
  cuid: { type: 'String', required: true },
  name: { type: 'String', required: true },
  isPublic: { type: 'Boolean', required: true, default: false }
});

export default mongoose.model('SnapshotPlace', placeSchema);
