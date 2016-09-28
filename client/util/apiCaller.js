import fetch from 'isomorphic-fetch';
import Config from '../../server/config';
import querystring from 'querystring';

export const API_URL = (typeof window === 'undefined' || process.env.NODE_ENV === 'test') ?
  process.env.BASE_URL || (`http://localhost:${process.env.PORT || Config.port}/api`) :
  '/api';

export default function callApi (endpoint, method = 'get', body, queryParameters) {
  let url = `${API_URL}/${endpoint}`;

  if (queryParameters) {
    url += `?${querystring.stringify(queryParameters)}`;
  }
  
  return fetch(url, {
    headers: { 'content-type': 'application/json' },
    method,
    body: JSON.stringify(body)
  })
  .then(response => response.json().then(json => ({ json, response })))
  .then(({ json, response }) => {
    if (!response.ok) {
      return Promise.reject(json);
    }

    return json;
  })
  .then(
    response => response,
    error => error
  );
}
