import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import imageSize from 'image-size';

import config from '../config';

const s3 = new S3Client({
  region: 'eu-west-1',
  credentials: {
    accessKeyId: process.env.VH_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.VH_AWS_SECRET_ACCESS_KEY,
  },
});

/**
 * Takes a base64 image string and stores the required images to a S3 bucket
 * @param snapshot
 * @param place
 * @returns Promise
 */
export function saveImageFromSnapshot({ snapshot, place, image }) {
  // Create buffer
  const imageBuffer = new Buffer.from(image, 'base64');

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
    type,
  };

  const command = new PutObjectCommand({
    Bucket: config.aws.s3BucketName,
    Key: getRelativePathForImage({
      place,
      snapshot,
      legacyExtension: false,
    }),
    Body: imageBuffer,
    Metadata,
  });

  return s3.send(command);
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
    snapshot,
  });

  const command = new GetObjectCommand({
    Bucket: config.aws.s3BucketName,
    Key,
  });

  return s3.send(command);
}

export const deleteObject = (Key) => {
  const command = new DeleteObjectCommand({
    Bucket: config.aws.s3BucketName,
    Key,
  });

  return s3.send(command);
};

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
  return `${placeName || place.name}/${date.getFullYear()}/${
    date.getMonth() + 1
  }/${snapshot.cuid}`;
};
