/**
 * Returns the relative path for an image for a snapshot (ex: /test/1/1/cuid.jpg)
 * @param place
 * @param snapshot
 * @returns string
*/
export function getRelativePathForImage ({ place, snapshot }) {
	let date = new Date(snapshot.dateAdded);
	return `${place.name}/${date.getFullYear()}/${date.getMonth() + 1}/${snapshot.cuid}.jpg`;
	//return `test/2016/8/ciriuyzff0000cavtwy2xjf58.jpg`;
}

/**
 * Returns the absolute path for an image for a snapshot (ex: http://some-domain/test/1/1/cuid.jpg)
 * @param place
 * @param snapshot
 * @returns string
*/
export function getAbsolutePathForImage ({ place, snapshot }) {
	return `${window.__APP_CONFIG__.imageUrlBase}/${getRelativePathForImage({ place, snapshot })}`;
}

