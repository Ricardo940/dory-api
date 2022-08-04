const express = require('express');
const router = express.Router();
const usuario = require('../services/usuario');


router.get('/id/:idUser', async function(req, res, next) {
  try {
    res.json(await usuario.getUserId(req.query.page,req.params.idUser));
  } catch (err) {
    console.error(`Error al traer el usuario`, err.message);
    next(err);
  }
});

router.get('/all', async function(req, res, next) {
  try {
    res.json(await usuario.getMultiple(req.query.page));
  } catch (err) {
    console.error(`Error al traer los usuarios`, err.message);
    next(err);
  }
});/*De usuarios Múltiples */

router.post('/create', async function(req, res, next) {
  try {
    res.json(await usuario.create(req.body));
  } catch (err) {
    console.error(`Error al registrar el usuario`, err.message);
    next(err);
  }
});/*De usuarios create */

router.put('/total/:idUser', async function(req, res, next) {
  try {
    res.json(await usuario.update(req.params.idUser, req.body));
  } catch (err) {
    console.error(`Error al actualizar el usuario`, err.message);
    next(err);
  }
});/*De usuarios update */

router.put('/update/password', async function(req, res, next) {
  try {
    res.json(await usuario.updatePassword(req.body));
  } catch (err) {
    console.error(`Error al actualizar la contraseña del usuario`, err.message);
    next(err);
  }
});

router.post('/recover/password', async function(req, res, next) {
  try {
    res.json(await usuario.recoverPassword(req.body));
  } catch (err) {
    console.error(`Error al recuperar la contraseña del usuario`, err.message);
    next(err);
  }
});

router.put('/parcial/:idUser', async function(req, res, next) {
  try {
    res.json(await usuario.updateParcialUsuario(req.params.idUser, req.body));
  } catch (err) {
    console.error(`Error al actualizar el usuario`, err.message);
    next(err);
  }
});

router.put('/change/password', async function(req, res, next) {
  try {
        var token=req.headers.authorization;
        res.json(await usuario.changePassword(req.body,token));
  } catch (err) {
        console.error(`Error al modificar la contraseña del usuario`, err.message);
        next(err);
  }
});

router.put('/verify/account', async function(req, res, next) {
  try {
        res.json(await usuario.verifyAccount(req.body));
  } catch (err) {
        console.error(`Error al verificar el usuario por el email`, err.message);
        next(err);
  }
});

router.delete('/:idUser', async function(req, res, next) {
  try {
    res.json(await usuario.remove(req.params.idUser));
  } catch (err) {
    console.error(`Error al borrar el usuario`, err.message);
    next(err);
  }
});

router.get('/misconsumos', async function(req, res, next) {
  try {
        var token=req.headers.authorization;
        res.json(await usuario.misConsumos(token));
  } catch (err) {
        console.error(`Error al mostrar los consumos del usuario`, err.message);
        next(err);
  }
});

router.put('/update/misconsumos', async function(req, res, next) {
  try {
        var token=req.headers.authorization;
        res.json(await usuario.updateMisconsumos(req.body,token));
  } catch (err) {
        console.error(`Error al actualizar los consumos del usuario`, err.message);
        next(err);
  }
});

router.get('/pescador/asociacion/:nit', async function(req, res, next) {
  try {
        var token=req.headers.authorization;
        res.json(await usuario.getPescadoresAsociacion(req.params.nit,token));
  } catch (err) {
        console.error(`Error al retornar los pescadores de la asociación ingresada`, err.message);
        next(err);
  }
});

router.get('/piscicultor/asociacion/:nit', async function(req, res, next) {
  try {
        var token=req.headers.authorization;
        res.json(await usuario.getPiscicultoresAsociacion(req.params.nit,token));
  } catch (err) {
        console.error(`Error al retornar los piscicultores de la asociación ingresada`, err.message);
        next(err);
  }
});

router.get('/solicitudes/noaceptadas/porusuario', async function(req, res, next) {
  try {
        var token=req.headers.authorization;
        res.json(await usuario.getSolicitudesNoaceptadasPorUsuario(token));
  } catch (err) {
        console.error(`Error al retornar las solicitudes no aceptadas del usuario`, err.message);
        next(err);
  }
});

/*Envia todas las solicitudes de que le han llegado a todas las asociaciones que el representa*/
router.get('/solicitudes/noaceptadas/representante', async function(req, res, next) {
  try {
        var token=req.headers.authorization;
        res.json(await usuario.getSolicitudesNoAceptadasTodasAsociacionesRep(token));
  } catch (err) {
        console.error(`Error al retornar las solicitudes no aceptadas de las asociaciones del representante`, err.message);
        next(err);
  }
});

router.get('/proveedores/todos', async function(req, res, next) {
  try {
    res.json(await usuario.getUsersProveedores(req.query.page));
  } catch (err) {
    console.error(`Error al traer los usuarios de tipo proveedor`, err.message);
    next(err);
  }
});

router.get('/investigadores/todos', async function(req, res, next) {
  try {
    res.json(await usuario.getUsersInvestigadoresExpertos(req.query.page));
  } catch (err) {
    console.error(`Error al traer los usuarios de tipo investigador experto`, err.message);
    next(err);
  }
});

router.get('/transportadores/todos', async function(req, res, next) {
  try {
    res.json(await usuario.getUsersTransportadores(req.query.page));
  } catch (err) {
    console.error(`Error al traer los usuarios de tipo transportador`, err.message);
    next(err);
  }
});

router.get('/consumidores/todos', async function(req, res, next) {
  try {
    res.json(await usuario.getUsersConsumidores(req.query.page));
  } catch (err) {
    console.error(`Error al traer los usuarios de tipo consumidor`, err.message);
    next(err);
  }
});

router.get('/comerciantes/todos', async function(req, res, next) {
  try {
    res.json(await usuario.getUsersComerciantes(req.query.page));
  } catch (err) {
    console.error(`Error al traer los usuarios de tipo comerciante`, err.message);
    next(err);
  }
});

module.exports = router;