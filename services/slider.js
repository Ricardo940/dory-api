const db = require('./db');
const helper = require('../helper');
const config = require('../config');
var createError = require('http-errors');
const {validarToken} = require ('../middelware/auth');

/* ------------------------------------ObtenerSlid------------------------------------*/
async function obtenerSlid(){   
       const rows = await db.query(
        `SELECT * 
         FROM sliders`,            
       []
       ); 
       if(rows.length<1){
          let data = {
            slider:[],
            tiempo:0
          }
        return { data };
       }
       const time = await db.query(
        `SELECT ts.tiempo
         FROM tiempoSlider as ts`,            
       []
       );   
      const slider = helper.emptyOrRows(rows);
      let tiempo;
      console.log('Arreglo de Tiempo', time);
      if(time.length<1){
            tiempo=1000;  
      }else{
            tiempo= time[0].tiempo;    
      }
       let data={slider,tiempo}
       return { data };
      
}/* End obtenerSlid*/


/* ------------------------------------crearSlid------------------------------------*/
async function crearSlid(body,token){   
  try{
          if(token && validarToken(token)){
              let payload=helper.parseJwt(token);
              let rol= payload.rol; 
                if(rol!='Administrador'){
                        throw createError(401,"Usted no tiene autorización para registrar el slide");
                }
                if(body.url_imagen === undefined || 
                   body.url_enlace === undefined || 
                   body.titulo === undefined 
                )
                {
                    throw createError(400,"Debe enviar todos los parámetros del slide para su registro");
                }
                const result = await db.query(
                `INSERT INTO sliders (url_imagen,url_enlace,titulo) VALUES (?,?,?)`,                
                 [body.url_imagen,body.url_enlace,body.titulo] 
                );  
              let message = 'Error registrando el slide';  
              if (result.affectedRows) {
                message = 'Registro exitoso de Slide';
              }  
              return {message};
          }else{ 
              throw createError(401,"Usted no tiene autorización"); 
          }
      }catch(error){
          throw error;
      }
}/* End crearSlid*/

/* ------------------------------------actualizarSlid------------------------------------*/
async function actualizarSlid(idSlid,body,token){   
        try{
                if(token && validarToken(token)){
                    let payload=helper.parseJwt(token);
                    let rol= payload.rol; 
                      if(rol!='Administrador'){
                              throw createError(401,"Usted no tiene autorización para actualizar slide");
                      }
                      if(body.url_imagen === undefined || 
                         body.url_enlace === undefined || 
                         body.titulo === undefined 
                      )
                      {
                          throw createError(400,"Debe enviar todos los parámetros del slide para la actualización");
                      }
                      const result = await db.query(
                      `UPDATE sliders
                      SET url_imagen=?,
                          url_enlace=?,
                          titulo=?
                      WHERE id_slid=?`,
                      [
                        body.url_imagen,   
                        body.url_enlace, 
                        body.titulo,                               
                        idSlid
                      ] 
                    );  
                    let message = 'Error actualizando la información del slide';  
                    if (result.affectedRows) {
                      message = 'Actualización de Slide exitoso';
                    }  
                    return {message};
                }else{ 
                    throw createError(401,"Usted no tiene autorización"); 
                }
            }catch(error){
                throw error;
            }
}/* End actualizarSlid*/

/* ------------------------------------eliminarSlid------------------------------------*/
async function eliminarSlid(idSlid,token){   
     try{
          if(token && validarToken(token)){
              let payload=helper.parseJwt(token);
              let rol= payload.rol; 
                if(rol!='Administrador'){
                        throw createError(401,"Usted no tiene autorización para eliminar slide");
                }
                 const result = await db.query(
                 `DELETE from sliders where id_slid=?`,
                  [idSlid]
                  );   
                  let message='Error al eliminar slid';                  
                  if (result.affectedRows) {
                          message = 'Slide borrado exitosamente';
                  } 
                  return {message};                              
          }else{ 
              throw createError(401,"Usted no tiene autorización"); 
          }
      }catch(error){
          throw error;
      }
}/* End eliminarSlid*/



/* ------------------------------------actualizarCarruselSlid------------------------------------*/
async function actualizarCarruselSlid(body,token){   
          try{
                  if(token && validarToken(token)){
                      let payload=helper.parseJwt(token);
                      let rol= payload.rol; 
                        if(rol!='Administrador'){
                                throw createError(401,"Usted no tiene autorización para actualizar slider");
                        }
                        const conection= await db.newConnection(); /*conection of TRANSACTION */
                          try{                                  
                                  await conection.beginTransaction();
                                  var carrusel=body.arraySliders;
                                  let message = 'Actualización exitosa del slide';                                 
                                  await db.query(
                                    `DELETE FROM sliders`, 
                                    []
                                  );                                 
                                  for(var i=0;i<carrusel.length;i++){
                                      if(!(carrusel[i].url_imagen === undefined ||  carrusel[i].url_enlace === undefined || carrusel[i].titulo === undefined))
                                       {
                                          await db.query(
                                          `INSERT INTO sliders(url_imagen,url_enlace,titulo) VALUES (?,?,?)`,
                                                [carrusel[i].url_imagen, carrusel[i].url_enlace, carrusel[i].titulo]
                                          );
                                       }
                                  }
                                  await conection.commit(); 
                                  conection.release();
                                  return {message}; 
                            }catch(error){
                                    conection.rollback(); /*Si hay algún error  */ 
                                    conection.release();
                                    throw error;        
                            }
                  }else{ 
                      throw createError(401,"Usted no tiene autorización"); 
                  }
              }catch(error){
                  throw error;
              }
}/* End actualizarCarruselSlid*/

/*----------------------updateParcialSlid--------------------------------------*/
async function updateParcialSlid(idSlide, slide, token){
  
        if(token && validarToken(token))
        {
              const payload=helper.parseJwt(token);  
              const rol = payload.rol;
              if(rol !="Administrador"){
                throw createError('401', "Usted no esta autorizado para actualizar el slide.")
              }               
              var atributos = Object.keys(slide);
              if(atributos.length!=0)
              {    
                    var params = Object.values(slide);
                    var query = "update sliders set ";
                    params.push(idSlide);
                    for(var i=0; i < atributos.length; i++) {
                      query = query + atributos[i] + '=?,';
                    }
                    query = query.substring(0, query.length-1);/*eliminar la coma final*/ 
                    query = query +' '+'where id_slid=?'
                    const result = await db.query(query,params);              
                    let message = '';
                    if (result.affectedRows) {
                      message = 'Slide actualizado exitosamente';
                    }else{
                      throw createError(500,"No se pudo actualizar el registro del slide");    
                    }
                    return {message};
              }
              throw createError(400,"No hay parámetros para actualizar");
        }else{
          throw createError(401,"Usuario no autorizado");
        }
}/*End updateParcialSlid*/


/*----------------------updateTimeSlid--------------------------------------*/
async function updateTimeSlider(body, token){  
          if(token && validarToken(token))
          {
                const payload=helper.parseJwt(token);  
                const rol = payload.rol;
                if(rol !="Administrador"){
                  throw createError('401', "Usted no esta autorizado para actualizar el tiempo del Slide.")
                }    
                    if(body.tiempo === undefined){
                                throw createError(400,"Se requiere el tiempo");
                    } 
                    const result = await db.query(
                    `UPDATE tiempoSlider
                     SET tiempo=?
                     WHERE id=0`,
                     [body.tiempo] 
                    ); 
                      let message = '';
                      if (result.affectedRows) {
                        message = 'Slider actualizado exitosamente';
                      }else{
                        throw createError(500,"No se pudo actualizar el slider");    
                      }
                      return {message};                
          }else{
            throw createError(401,"Usuario no autorizado");
          }
}/*End updateTimeSlid*/

module.exports = {
  obtenerSlid,
  crearSlid,
  actualizarSlid,
  eliminarSlid,
  actualizarCarruselSlid,
  updateParcialSlid,
  updateTimeSlider
}
