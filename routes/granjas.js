const express = require('express');
const router = express.Router();
const granjas = require('../services/granjas');


router.get('/', async function(req, res, next) {
  try {
    res.json(await granjas.getMultiple(req.query.page));
  } catch (err) {
    console.error(`Error al traer las granjas `, err.message);
    next(err);
  }
});


router.post('/', async function(req, res, next) {
    try {
      res.json(await granjas.create(req.body));
    } catch (err) {
      console.error(`Error creando la granja`, err.message);
      next(err);
    }
  });


router.put('/:id', async function(req, res, next) {
    try {
      res.json(await granjas.update(req.params.id, req.body));
    } catch (err) {
      console.error(`Error al actualizar la granja`, err.message);
      next(err);
    }
});


router.delete('/:id', async function(req, res, next) {
    try {
      res.json(await granjas.remove(req.params.id));
    } catch (err) {
      console.error(`Error al borrar la granja`, err.message);
      next(err);
    }
  });

module.exports = router;