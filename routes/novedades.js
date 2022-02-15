const express = require('express');
const router = express.Router();
const novedades = require('../services/novedades');


router.get('/', async function(req, res, next) {
  try {
    res.json(await novedades.getMultiple(req.query.page));
  } catch (err) {
    console.error(`Error al traer las novedades`, err.message);
    next(err);
  }
});


router.post('/', async function(req, res, next) {
    try {
      res.json(await novedades.create(req.body));
    } catch (err) {
      console.error(`Error registrando la novedad`, err.message);
      next(err);
    }
  });


router.put('/:id', async function(req, res, next) {
    try {
      res.json(await novedades.update(req.params.id, req.body));
    } catch (err) {
      console.error(`Error al actualizar la novedad`, err.message);
      next(err);
    }
});


router.delete('/:id', async function(req, res, next) {
    try {
      res.json(await novedades.remove(req.params.id));
    } catch (err) {
      console.error(`Error al borrar la novedad`, err.message);
      next(err);
    }
  });

  /* Solución de errores por no ingresar el identificador de busqueda*/

  router.put('/', async function(req, res, next) {
    try {
      res.status(400).json({'message':"No se puede actualizar la novedad sin su identificador" });
    } catch (err) {  
      console.error(`Error de la novedad por falta del identificador`, err);  
        next(err);
    }
});

  router.delete('/', async function(req, res, next) {
    try {
      res.status(400).json({'message':"No se puede eliminar la novedad sin su identificador" });
    } catch (err) {  
      console.error(`Error de la novedad por falta del identificador`, err);  
        next(err);
    }
});


module.exports = router;