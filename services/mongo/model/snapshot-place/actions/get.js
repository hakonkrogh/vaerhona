import facade from '../facade';

export const getPlace = (req, res) => {
  facade
    .findOne({ name: req.params.name })
    .then(place => res.json(place))
    .catch(e => res.status(500).json(e));
};

export const getAllPublicPlaces = () => {
  facade.find({ isPublic: true }).then(places => res.json(places));
};
