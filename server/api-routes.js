const Router = require('express').Router;
const router = new Router();

router.route('/util/componentandmetadatafromroute')
    .get((req, res) => {
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
                break;
        }

        res.json(response);
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