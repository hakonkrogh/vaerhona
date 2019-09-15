import facade from './facade';
import { addSnapshot, addSnapshotLegacy } from './actions/add';
import {
  getSnapshots,
  getImage,
  getLatestSnapshotForPlace
} from './actions/get';

export default {
  facade,
  addSnapshot,
  addSnapshotLegacy,
  getSnapshots,
  getLatestSnapshotForPlace,
  getImage
};
