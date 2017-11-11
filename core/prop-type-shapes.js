import PropTypes from 'prop-types';

export const snapshot = PropTypes.shape({
    cuid: PropTypes.string,
    placeCuid: PropTypes.string,
    temperature: PropTypes.number,
    humidity: PropTypes.number,
    pressure: PropTypes.number
});

export const place = PropTypes.shape({
    cuid: PropTypes.string,
    name: PropTypes.string,
    isPublic: PropTypes.bool
});
