const express = require('express');
const router = express.Router();
const proveedores = require('../services/proveedores');


router.get('/productos/userId/:id', async function(req, res, next) {
  try {
    res.json(await proveedores.getMultiple(req.query.page, req.params.id));
  } catch (err) {
    console.error(`Error al traer los productos del usuario proveedor ingresado`, err.message);
    next(err);
  }
});


router.post('/producto/', async function(req, res, next) {
    try {
              var token=req.headers.authorization;
              res.json(await proveedores.create(req.body,token));
    } catch (err) {
            console.error(`Error creando el producto del usuario`, err.message);
            next(err);
    }
  });


router.put('/producto/:codigo', async function(req, res, next) {
    try {
          var token=req.headers.authorization;
          res.json(await proveedores.update(req.params.codigo, req.body,token));
    } catch (err) {
          console.error(`Error al actualizar el producto del usuario`, err.message);
          next(err);
    }
});


router.delete('/producto/:id', async function(req, res, next) {
    try {
          var token=req.headers.authorization;
          res.json(await proveedores.remove(req.params.id,token));
    } catch (err) {
          console.error(`Error al borrar el producto del usuario`, err.message);
          next(err);
    }
  });

module.exports = router;