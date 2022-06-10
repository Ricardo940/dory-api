const db = require('./db');
const helper = require('../helper');
const config = require('../config');
var createError = require('http-errors');
const {validarToken} = require ('../middelware/auth');
const dayjs = require('dayjs');

async function getAsociacionesDepartamento(page = 1, idDepartamento){
        const offset = helper.getOffset(page, config.listPerPage);
        const rows = await db.query(
      `SELECT distinctrow  m.id_municipio, m.nombre, m.poblacion,
          (SELECT count(*) 
          FROM municipios m1, asociaciones a1
          WHERE m1.id_municipio=a1.id_municipio and  m1.id_municipio=m.id_municipio ) as count_asociaciones
      FROM  asociaciones as a, municipios as m, corregimientos as c,veredas as v, departamentos as d
      WHERE ( m.id_departamento_fk=d.id_departamento) and 
            (m.id_municipio=a.id_municipio or c.id_municipio=a.id_municipio or v.id_municipio=a.id_municipio)  and
            d.id_departamento=?
            LIMIT ?,?`, 
          [idDepartamento, offset, config.listPerPage]
     );
        const data = helper.emptyOrRows(rows);
        const meta = {page};
        return {
          data,
          meta
        }
}/*End GetAsociacionesDepartamento*/

/*--------------------getMultiple-------------------------------------*/
async function getMultiple(page = 1){
  const offset = helper.getOffset(page, config.listPerPage);
  const rows = await db.query(
    `SELECT * FROM asociaciones LIMIT ?,?`, 
    [offset, config.listPerPage]
  );
  const data = helper.emptyOrRows(rows);
  const meta = {page};
  return {
    data,
    meta
  }
}/*End getMultiple*/

/*-------------------------create-----------------------*/
async function create(asociacion){
    const result = await db.query(
      `INSERT INTO asociaciones(nit, nombre,direccion,legalconstituida,fecha_renovacion_camarac,foto_camarac,id_tipo_asociacion_fk,id_departamento,id_municipio,id_corregimiento,id_vereda) VALUES (?,?,?,?,?,?,?,?,?,?,?)`, 
      [
        asociacion.nit,
        asociacion.nombre,
        asociacion.direccion,
        asociacion.legalconstituida,
        asociacion.fecha_renovacion_camarac,
        asociacion.foto_camarac,
        asociacion.id_tipo_asociacion_fk,
        asociacion.id_departamento,
        asociacion.id_municipio,
        asociacion.id_corregimiento,
        asociacion.id_vereda
      ]
    );  
    let message = 'Error creando asociacion';
    if (result.affectedRows) {
      message = {  insertId: result.insertId, message:'asociacion creada exitosamente'};
    }
    return {message};
  }/*End create*/

  /*_----------------------------------update--------------------------------*/
  async function update(nit, asociacion){
    const result = await db.query(
      `UPDATE asociaciones 
       SET nombre=?,
           direccion=?,
           legalconstituida=?,
           fecha_renovacion_camarac=?,
           foto_camarac=?,
           id_tipo_asociacion_fk=?,
           id_departamento=?, 
           id_municipio=?,
           id_corregimiento=?,
           id_vereda=?
       WHERE nit=?`,
       [
        asociacion.nombre,
        asociacion.direccion,
        asociacion.legalconstituida,
        asociacion.fecha_renovacion_camarac,
        asociacion.foto_camarac,
        asociacion.id_tipo_asociacion_fk,
        asociacion.id_departamento,
        asociacion.id_municipio,
        asociacion.id_corregimiento,
        asociacion.id_vereda,
        nit
       ] 
    );
    let message = 'Error actualizando asociación';
    if (result.affectedRows) {
      message = 'Asociacion actualizada exitosamente';
    }
    return {message};
  }/*End update*/
  
  /*----------------------------------------remove-------------------------------------------*/
  async function remove(nit){
    const result = await db.query(
      `DELETE FROM asociaciones WHERE nit=?`, 
      [nit]
    );
    let message = 'Error borrando asociacion';  
    if (result.affectedRows) {
      message = 'Asociación borrada exitosamente';
    }  
    return {message};
  }/*End remove*/

  /*------------------------------enviarSolicitudAdicion---------------------------------------------*/

  async function enviarSolicitudAdicion(nit, token){ console.log('fecha>>>>>>>', dayjs);
            if(token && validarToken(token)){
                      const payload=helper.parseJwt(token); 
                      const id_user= payload.sub;
                      const tipo_user= payload.rol;
               try{       
                      if(tipo_user!='Piscicultor' && tipo_user!='Pescador'){
                          throw createError(401,"Tipo de usuario no Válido");
                      }
                      const result = await conection.execute(
                        `INSERT INTO solicitudes (id_estado_fk,usuarios_id_fk,nit_asociacion_fk,fecha) VALUES (?,?,?,?)`, 
                        [
                          1,
                          id_user,
                          nit,
                          null
                        ]
                        );
                      if(result.affectedRows){
                        return {message:"Solicitud de adición enviada exitosamente"};
                      }
                     return {message:"Error al enviar la solicitud de adición a la asociación"};
                 }catch{
                     throw createError(400,"Error al enviar la solicitud de adición a la asociación"); 
                }            
            }else{
              throw createError(401,"Usted no tiene autorización"); 
            }
  }/*End enviarSolicitudAdicion*/

module.exports = {
  getAsociacionesDepartamento,
  getMultiple,
  create,
  update,
  remove,
  enviarSolicitudAdicion
}