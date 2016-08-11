import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const placeSchema = new Schema({
  cuid: { type: 'String', required: true },
  name: { type: 'String', required: true }
});

export default mongoose.model('SnapshotPlace', placeSchema);
