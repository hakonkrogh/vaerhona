import { getImagePath } from '../../../../isomorphic/api';

const loaded = [];

export default function preloadSnapshotImages ({ snapshots }) {
  
  snapshots.forEach(preload);

  function preload (snapshot) {
    if (snapshot && loaded.indexOf(snapshot.cuid) === -1) {
      
      const image = new Image();
      image.src = getImagePath({ snapshot });

      loaded.push(snapshot.cuid);
    }
  }
}
