const Router = require('express').Router;
const config = require('./config');
const router = new Router();

router.route('/util/componentandmetadatafromroute')
    .get((req, res) => {
        let { url } = req.query;

        url = decodeURIComponent(url);

        url = url.replace(/http(s?):\/\/[^\/]*/, '');
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
                break;
        }

        res.json(response);
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


router.route('/snapshot/:id/image')
    .get(async (req, res) => {
        try {
            const browserSupportsWebp = req.get('Accept').indexOf('image/webp') !== -1;
            const response = await fetch(`${config.apiUri}/snapshot/${req.params.id}/image?webp=${browserSupportsWebp}`);
            const buffer = await response.buffer();

            res.set({
                'Content-type': res.headers.get('content-type'),
                'Cache-control': res.headers.get('cache-control'),
                'Etag': res.headers.get('Etag')
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