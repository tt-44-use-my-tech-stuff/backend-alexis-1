const router = require('express').Router();
const TechItem = require('./tech_items-model');
const { only } = require('../auth/auth-middleware');
const { checkTechItemBody, checkTechItemExists, checkBelongsToOwner } = require('./tech_items-middleware');

router.get('/', async (req, res, next) => {
  try {
    const tech_items = await TechItem.findAll();
    res.status(200).json(tech_items);
  } catch(err){
    next(err);
  }
});

router.get('/:tech_item_id', checkTechItemExists, async (req, res) => {
  res.status(200).json(req.tech_item);
});

router.post('/', only('owner'), checkTechItemBody, async (req, res, next) => {
  try {
    const newTechItem = await TechItem.create({ ...req.body, owner_id: req.decodedToken.subject });
    res.status(201).json(newTechItem);
  } catch(err) {
    next(err);
  }
});

router.put('/:tech_item_id/owners/:owner_id', only('owner'), checkTechItemBody, checkTechItemExists, checkBelongsToOwner, async (req, res, next) => {
  const { tech_item_id } = req.params;
  try {
    const newTechItem = await TechItem.update(tech_item_id, { ...req.body, owner_id: req.decodedToken.subject });
    res.status(200).json(newTechItem);
  } catch(err) {
    next(err);
  }
});

router.delete('/:tech_item_id/owners/:owner_id', only('owner'), checkTechItemExists, checkBelongsToOwner, async (req, res, next) => {
  const { tech_item_id } = req.params;
  try {
    const deletedTechItemId = await TechItem.deleteById(tech_item_id);
    res.status(200).json({ tech_item_id: deletedTechItemId });
  } catch (err) {
    next(err);
  }
});

router.use((err, req, res, next) => { //eslint-disable-line
  res.status(err.status || 500).json({ message: err.message, stack: err.stack });
});

module.exports = router;