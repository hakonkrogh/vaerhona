import AWS from 'aws-sdk';
import imageSize from 'image-size';

import config from '../config';

AWS.config.update({
  accessKeyId: process.env.VH_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.VH_AWS_SECRET_ACCESS_KEY,
  region: process.env.VH_AWS_REGION
});

const s3 = new AWS.S3();

/**
 * Takes a base64 image string and stores the required images to a S3 bucket
 * @param snapshot
 * @param place
 * @returns Promise
 */
export function saveImageFromSnapshot({ snapshot, place }) {
  if (!snapshot.image) {
    return Promise.reject({
      message: 'snapshot.image is undefined',
      snapshot
    });
  }

  // Create buffer
  const imageBuffer = new Buffer.from(snapshot.image, 'base64');

  return uploadSingleImage({ place, snapshot, imageBuffer });
}

/**
 * Stores a single image buffer to a S3 bucket
 * @param snapshot
 * @param place
 * @param imageBuffer
 * @returns Promise
 */
export function uploadSingleImage({ place, snapshot, imageBuffer }) {
  const { width, height, type } = imageSize(imageBuffer);

  const Metadata = {
    width: width.toString(),
    height: height.toString(),
    type
  };

  return s3
    .upload(
      {
        Bucket: config.aws.s3BucketName,
        Key: getRelativePathForImage({
          place,
          snapshot,
          legacyExtension: false
        }),
        Body: imageBuffer,
        Metadata
      },
      {}
    )
    .promise();
}

/**
 * Get a image
 * @param snapshot
 * @param place
 * @returns promise
 */
export function getImage({ placeName, snapshot }) {
  const Key = getRelativePathForImage({
    placeName,
    snapshot
  });

  return s3
    .getObject({
      Bucket: config.aws.s3BucketName,
      Key
    })
    .promise();
}

export const getAbsolutPathForImage = (...args) =>
  `${config.imageUrlBase}/${getRelativePathForImage(...args)}`;

export const deleteObject = Key =>
  s3
    .deleteObject({
      Bucket: config.aws.s3BucketName,
      Key
    })
    .promise();

/**
 * Returns the relative path for an image for a snapshot (ex: /test/1/30/cuid.jpg)
 * @param place
 * @param placeName
 * @param snapshot
 * @param legacyExtension
 * @returns string
 */
export const getRelativePathForImage = ({ place, placeName, snapshot }) => {
  const date = new Date(snapshot.dateAdded);
  return `${placeName || place.name}/${date.getFullYear()}/${date.getMonth() +
    1}/${snapshot.cuid}`;
};
