import { getAbsolutePathForImage } from '../../../../../shared/image';

const loaded = [];

export default function PreloadSnapshotImages ({ place, snapshots }) {
  
  snapshots.forEach(preload);

  function preload (snapshot) {
    if (place && snapshot && loaded.indexOf(snapshot.cuid) === -1) {
      
      const image = new Image();
      image.src = getAbsolutePathForImage({ place, snapshot });

      loaded.push(snapshot.cuid);
    }
  }
}
