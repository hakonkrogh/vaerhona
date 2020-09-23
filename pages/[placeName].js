import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/react-hooks';
import upperFirst from 'upper-case-first';
import gql from 'graphql-tag';

import { graphDate } from 'core/date';
import { getClosestSnapshot } from 'core/utils';
import withApolloClient from '../apollo/with-apollo-client';
import Layout from 'modules/layout';
import { SnapshotsNavigator } from 'modules/snapshot';

const QUERY_PLACE = gql`
  query PLACE(
    $placeName: String!
    $from: String
    $to: String
    $compareTo: String
    $limit: Int
  ) {
    place(name: $placeName) {
      name
      firstSnapshot {
        date
      }
    }

    currentSnapshots: snapshots(
      place: $placeName
      from: $from
      to: $to
      limit: $limit
    ) {
      ...snap
    }

    compareSnapshots: snapshots(
      place: $placeName
      from: $from
      to: $compareTo
      limit: $limit
    ) {
      ...snap
    }
  }

  fragment snap on Snapshot {
    cuid
    date
    temperature
    humidity
    pressure
    image
    placeName
  }
`;

function bySnapshotDate(a, b) {
  return new Date(a.date) - new Date(b.date);
}

function onlyUniqueSnapshots(value, index, self) {
  return self.findIndex(v => v.cuid === value.cuid) === index;
}

function getInitialToDate() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date;
}

function getCompareSnapshot(currentSnapshot, compareSnapshots) {
  const dateToBeCloseTo = new Date(currentSnapshot.date);
  dateToBeCloseTo.setFullYear(dateToBeCloseTo.getFullYear() - 1);

  return getClosestSnapshot({ dateToBeCloseTo, snapshots: compareSnapshots });
}

let dateChangePending;

const PlacePage = ({ query }) => {
  const [to, setTo] = useState(getInitialToDate());
  const [limit, setLimit] = useState(24);
  const [currentSnapshot, setCurrentSnapshot] = useState(null);

  const compareTo = new Date(to.getTime());
  compareTo.setFullYear(compareTo.getFullYear() - 1);

  const variables = {
    placeName: query.placeName,
    limit,
    to: graphDate(to),
    compareTo: graphDate(compareTo)
  };
  const { data, loading, error, fetchMore } = useQuery(QUERY_PLACE, {
    variables
  });

  const { place, currentSnapshots: snapshots, compareSnapshots } = data || {};

  useEffect(() => {
    // Set initial current snapshot
    if (!currentSnapshot && snapshots) {
      setCurrentSnapshot(snapshots[snapshots.length - 1]);
    }

    // Select the current snapshot from the new date range
    if (!loading && !error && dateChangePending) {
      const newCurrent = getClosestSnapshot({
        dateToBeCloseTo: dateChangePending,
        snapshots
      });

      if (newCurrent) {
        setCurrentSnapshot(newCurrent);
      }
      dateChangePending = false;
    }
  }, [data]);

  if (loading || !currentSnapshot) {
    return <Layout loading title="Henter data..." />;
  }

  if (error) {
    return <Layout>Oisann</Layout>;
  }

  function onDateChange(date) {
    dateChangePending = new Date(date.getTime());

    // Load the day, the prev and the next
    date.setDate(date.getDate() + 1);
    setTo(date);
    setLimit(72);
    setCurrentSnapshot(null);
  }

  const loadMoreSnapshots = ({ from, to, limit }) => {
    let compareTo;
    if (to) {
      compareTo = new Date(to);
      compareTo.setFullYear(compareTo.getFullYear() - 1);
    }
    let compareFrom;
    if (from) {
      compareFrom = new Date(from);
      compareFrom.setFullYear(compareFrom.getFullYear() - 1);
    }

    return fetchMore({
      variables: {
        ...variables,
        from: graphDate(from),
        to: graphDate(to),
        compareFrom: graphDate(compareFrom),
        compareTo: graphDate(compareTo),
        limit
      },
      updateQuery: (previousResult, { fetchMoreResult }) => {
        function handleSnaps(name) {
          let arr;
          if (dateChangePending) {
            arr = fetchMoreResult[name];
          } else {
            arr = [...previousResult[name], ...fetchMoreResult[name]];
          }

          return arr.filter(onlyUniqueSnapshots).sort(bySnapshotDate);
        }

        return Object.assign({}, previousResult, {
          currentSnapshots: handleSnaps('currentSnapshots'),
          compareSnapshots: handleSnaps('compareSnapshots')
        });
      }
    });
  };

  const compareSnapshot = getCompareSnapshot(currentSnapshot, compareSnapshots);

  return (
    <Layout loading={loading} title={place && upperFirst(place.name)}>
      <SnapshotsNavigator
        place={place}
        snapshots={snapshots}
        currentSnapshot={currentSnapshot}
        setCurrentSnapshot={setCurrentSnapshot}
        compareSnapshot={compareSnapshot}
        compareSnapshots={compareSnapshots}
        loadMoreSnapshots={loadMoreSnapshots}
        onDateChange={onDateChange}
      />
    </Layout>
  );
};

PlacePage.getInitialProps = ({ query }) => ({ query });

export default withApolloClient(PlacePage);
