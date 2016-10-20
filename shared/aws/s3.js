/**
 * Returns the relative path for an image for a snapshot (ex: /test/1/1/cuid.jpg)
 * @param place
 * @param snapshot
 * @returns string
*/
export function getRelativePathForImage ({ place, snapshot }) {
	
  let date = new Date(snapshot.dateAdded);

	return `${place.name}/${date.getFullYear()}/${date.getMonth() + 1}/${snapshot.cuid}.jpg`;
}