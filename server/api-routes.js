const Router = require('express').Router;
const config = require('./config');
const router = new Router();

const api = require('../isomorphic/api');

router.route('/util/componentandmetadatafromroute')
    .get((req, res) => {
        let { url } = req.query;

        url = decodeURIComponent(url);

        url = url.replace(/http(s?):\/\/[^\/]*/, '');
        if (url[0] !== '/') {
            url = '/' + url;
        }

        // Next routes
        if (url.startsWith('/_next')) {
            return res.json({ match: false });
        }

        // Front page
        if (url === '/') {
            return res.json({ match: true, hrefResolved: url, componentName: ''});
        }
        
        // Check for place page (/placeName)
        if (url.match(/\//g).length === 1) {
            const placeName = url.replace('/','');
            api
                .getPlace(placeName)
                .then((place) => {
                    if (place) {
                        res.json({ match: true, componentName: 'place', query: { placeName }})
                    } else {
                        res.json({ match: false });
                    }
                })
                .catch(() => res.json({ match: false }));
            return;
        }

        let response;
        switch (url) {
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
                break;
        }
        res.json(response);
    });

router.route('/frontpage')
    .get(async (req, res) => {
        try {
            const response = await fetch(`${config.apiUri}/frontpage`);
            const json = await response.json();
            res.json(json);
        } catch (error) {
            res.status(500).json({
                places: [],
                error
            });
        }
    });

router.route('/snapshots')
    .get(async (req, res) => {
        try {
            const response = await fetch(`${config.apiUri}/snapshot/?placeName=${req.query.placeName}`);
            const json = await response.json();
            res.json(json);
        } catch (error) {
            res.status(500).json({
                snapshots: [],
                error
            });
        }
    });

router.route('/place/:placeName')
    .get(async (req, res) => {
        try {
            const response = await fetch(`${config.apiUri}/place/${req.params.placeName}`);
            const json = await response.json();
            res.json(json);
        } catch (error) {
            res.status(500).json({
                error
            });
        }
    });


router.route('/place-and-snapshots/:placeName')
    .get(async (req, res) => {
        try {
            const { placeName } = req.params;
            const placeResponse = await fetch(`${config.apiUri}/place/${placeName}`);
            const place = await placeResponse.json();
            if (!place) {
                throw new Error('Place does not exist');
            }
            const snapshotsResponse = await fetch(`${config.apiUri}/snapshot/?placeName=${placeName}`);
            const snapshots = await snapshotsResponse.json();
            res.json({
                place,
                snapshots
            });
        } catch (error) {
            res.status(500).json({
                error
            });
        }
    });

router.route('/snapshot/:id/image')
    .get(async (req, res) => {
        try {
            const accept = req.headers['accept'];
            const browserSupportsWebp = accept === '*/*' || accept.indexOf('image/webp') !== -1;
            const response = await fetch(`${config.apiUri}/snapshot/${req.params.id}/image?webp=${browserSupportsWebp}`);
            const buffer = await response.buffer();

            res.set({
                'Content-type': response.headers.get('content-type'),
                'Cache-control': response.headers.get('cache-control'),
                'Etag': response.headers.get('Etag')
            });
            res.end(buffer, 'binary');
        } catch (error) {
            res.status(500).send(error);
        }
    });

router.route('/awesomedata')
    .get((req, res) => {
        setTimeout(() => {
            res.json({
                title: 'An awesome title',
                data: 123
            });
        }, 25);
    });

module.exports = router;