const config = require('../config');

async function getFrontpage () {
    const response = await fetch(`${config.apiUri}/frontpage`);
    return await response.json();
}

module.exports = {
    getFrontpage
};
