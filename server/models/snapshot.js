import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const snapshotSchema = new Schema({
  cuid: { type: 'String', required: true },
  placeCuid: { type: 'String', required: true },
  temperature: { type: 'Number', required: true },
  humidity: { type: 'Number', required: true },
  pressure: { type: 'Number', required: true },
  dateAdded: { type: 'Date', default: Date.now, required: true },
});

export default mongoose.model('Snapshot', snapshotSchema);
