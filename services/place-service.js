import fetch from 'isomorphic-unfetch';
import querystring from 'querystring';

import config from '../config';

const useApi = config.graphqlSource === 'api';

export const PlaceService = {
  async getPlace({ placeName, from, to }) {
    if (useApi) {
      const response = await fetch(
        `${config.apiUri}/place/${placeName}?${querystring.stringify({
          from,
          to
        })}`
      );
      return response.json();
    }

    return {
      cuid: '1',
      name: 'Test'
    };
  },

  async getPlaces() {
    if (useApi) {
      const response = await fetch(`${config.apiUri}/place`);
      return response.json();
    }

    return [
      {
        cuid: '1',
        name: 'Test'
      }
    ];
  }
};
