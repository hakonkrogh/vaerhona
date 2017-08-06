import PropTypes from 'prop-types';

export const snapshot = PropTypes.shape({
    cuid: PropTypes.string.isRequired,
    placeCuid: PropTypes.string.isRequired,
    temperature: PropTypes.number.isRequired,
    humidity: PropTypes.number.isRequired,
    pressure: PropTypes.number.isRequired
});

export const place = PropTypes.shape({
    cuid: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    isPublic: PropTypes.bool.isRequired
});
