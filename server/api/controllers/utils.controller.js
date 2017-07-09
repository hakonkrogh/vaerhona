import config from '../config';

/**
 * Resolves a route to a component and metadata
 * @param req
 * @param res
 * @returns void
 */
export function getComponentAndMetadataFromRoute (req, res) {
  
    let { url } = req.query;

    url = decodeURIComponent(url);

    url = url.replace('http://localhost:3000/', '/');
        if (url[0] !== '/') {
        url = '/' + url;
    }

    let response;
    switch (url) {
        case '/':
            response = { match: true, hrefResolved: url, componentName: '', query: {} };
            break;
        case '/a':
        case '/aa':
            response = { match: true, hrefResolved: url, componentName: 'a', query: {} };
            break;
        case '/b':
        case '/bb':
            response = { match: true, hrefResolved: url, componentName: 'b', query: {} };
            break;
        default:
            response = { match: false };
    }

    res.json(response);
}
