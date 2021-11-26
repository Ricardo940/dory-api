const express = require('express');
const router = express.Router();
const categorias = require('../services/categorias');


router.get('/', async function(req, res, next) {
  try {
    res.json(await categorias.getMultiple(req.query.page));
  } catch (err) {
    console.error(`Error al traer las categorias `, err.message);
    next(err);
  }
});


router.post('/', async function(req, res, next) {
    try {
      res.json(await categorias.create(req.body));
    } catch (err) {
      console.error(`Error creando la categoria`, err.message);
      next(err);
    }
  });


router.put('/:id', async function(req, res, next) {
    try {
      res.json(await categorias.update(req.params.id, req.body));
    } catch (err) {
      console.error(`Error al actualizar la categoria`, err.message);
      next(err);
    }
});


router.delete('/:id', async function(req, res, next) {
    try {
      res.json(await categorias.remove(req.params.id));
    } catch (err) {
      console.error(`Error al borrar la categoria`, err.message);
      next(err);
    }
  });

module.exports = router;