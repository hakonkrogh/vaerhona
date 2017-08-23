const Router = require('express').Router;
const router = new Router();

const PlaceService = require('./services/place-service');
const SnapshotService = require('./services/snapshot-service');
const FrontpageService = require('./services/frontpage-service');

router.route('/util/componentandmetadatafromroute')
    .get(async (req, res) => {
        let { url } = req.query;

        url = decodeURIComponent(url);

        url = url.replace(/http(s?):\/\/[^\/]*/, '');
        if (url[0] !== '/') {
            url = '/' + url;
        }

        if (url.startsWith('/_next')) return res.json({ match: false });
        if (url.startsWith('/static')) return res.json({ match: false });
        if (url.startsWith('/favico')) return res.json({ match: false });

        // Front page
        if (url === '/') {
            return res.json({ match: true, hrefResolved: url, componentName: ''});
        }

        // Check for place page (/:placeName)
        if (url.match(/\//g).length === 1) {
            const placeName = url.replace('/','');
            try {
                const place = await PlaceService.getPlace({ placeName });

                if (place && place.isPublic) {
                    return res.json({ match: true, componentName: 'place', query: { placeName }});
                }

                return res.json({ match: false });
            } catch (error) {
                return res.json({ match: false, error });
            }
        }

        res.json({ match: false });
    });

router.route('/frontpage')
    .get(async (req, res) => {
        try {
            const frontpage = await FrontpageService.getFrontpage();
            res.json(frontpage);
        } catch (error) {
            res.status(500).json({
                places: [],
                error
            });
        }
    });

router.route('/place/:placeName')
    .get(async (req, res) => {
        try {
            const place = await PlaceService.getPlace({ placeName });
            res.json(place);
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
            const { limit } = req.query;
            const place = await PlaceService.getPlace({ placeName });
            const snapshots = await SnapshotService.getSnapshots({ placeName, limit });
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

router.route('/snapshots')
    .get(async (req, res) => {
        try {
            const response = await SnapshotService.getSnapshots({ placeName: req.query });
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
            const accept = req.headers['accept'];
            const browserSupportsWebp = accept.indexOf('image/webp') !== -1;

            const image = await SnapshotService.getSnapshotImage({
                id: req.params.id,
                webp: browserSupportsWebp
            });

            res.set(image.headers);
            res.end(image.buffer, 'binary');
        } catch (error) {
            res.status(500).send(error);
        }
    });

module.exports = router;
