import React from 'react';
import Link from 'next/link';
import { upperFirst } from 'core/utils';

import { timeOrDate } from 'core/date';
import SnapshotImage from 'modules/snapshot-image';

import styles from './place-list.module.css';

const PlaceListItem = ({ name, lastSnapshot: snapshot, priority }) => (
  <li className={styles.item}>
    <Link href={`/${name}`}>
      <div className={styles.upper}>
        <h2 className={styles.placeName}>{upperFirst(name)}</h2>
        <div>
          <time className={styles.time}>{timeOrDate(snapshot.date)}</time>
        </div>
      </div>

      <figure className={styles.imageWrapper}>
        <SnapshotImage
          image={snapshot.image}
          date={snapshot.date}
          placeName={name}
          sizes="300px"
          priority={priority}
        />
      </figure>
    </Link>
  </li>
);

export default PlaceListItem;
