'use strict';

let fs = require('fs');

let secret = JSON.parse(fs.readFileSync('./secret.json'));

function to (destinationName) {

	let destination = secret.destinations[destinationName];

    if (!destination) {
    	throw Error("Destination name not valid");
    }

    var client = require('scp2');

    return new Promise ((resolve, reject) => {
	    client.scp('./dist', {
		    host: secret.host,
	        username: secret.username,
	        privateKey: fs.readFileSync(secret.keyFile),
		    path: destination
		}, err => {
			if (err) {
				reject(err);
			}
			else {
				resolve();
			}
		});
	});
}

module.exports = {
	to
};