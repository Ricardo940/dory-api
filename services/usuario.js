const db = require('./db');
const helper = require('../helper');
const config = require('../config');
var createError = require('http-errors');
const bcrypt= require('bcrypt');
const nodemailer = require('nodemailer');
const {validarToken} = require ('../middelware/auth');

async function getUserId(page = 1, idUser){

  const offset = helper.getOffset(page, config.listPerPage);
  const rows = await db.query(
    `SELECT distinctrow   u.cedula,concat(u.nombres," ",u.apellidos) as nombre_completo,
                          u.celular,u.direccion,u.email,u.password,tu.id_tipo_usuario,tu.nombre_tipo_usuario as tipo_usuario,u.id_area_experticia,
                          (select a.nombre from areas_experticias a  where a.id_area=u.id_area_experticia) as area_experticia,u.nombre_negocio,u.foto,u.fecha_registro,u.fecha_nacimiento,
                          (select d.nombre_departamento from departamentos d  where d.id_departamento=u.id_departamento) as departamento,
                          (select m.nombre from municipios as m  where m.id_municipio=u.id_municipio) as municipio,
                          (select c.nombre from corregimientos as c  where c.id_corregimiento=u.id_corregimiento) as corregimiento,
                          (select v.nombre from veredas as v  where v.id_vereda=u.id_vereda) as vereda,
                          u.latitud,u.longitud,u.nombre_corregimiento,u.nombre_vereda,u.estaVerificado,u.otra_area_experticia,u.otra_area_experticia_descripcion,u.sobre_mi
      FROM tipos_usuarios as tu, usuarios as u
      WHERE u.id_tipo_usuario=tu.id_tipo_usuario and
            u.id=?
      LIMIT ?,?`, 
      [idUser, offset, config.listPerPage]
  );
  const data = helper.emptyOrRows(rows);
  const meta = {page};
  return {
    data,
    meta
  }
}/*End getUserId */

async function getMultiple(page = 1){
  const offset = helper.getOffset(page, config.listPerPage);
  const rows = await db.query(
    `SELECT u.id, u.cedula,u.nombres, u.apellidos,u.celular,u.direccion,u.email,u.id_tipo_usuario,u.id_area_experticia,
            u.nombre_negocio,u.foto,u.fecha_registro,u.fecha_nacimiento,
            u.id_departamento,u.id_municipio,u.id_corregimiento,u.id_vereda,
            u.latitud,u.longitud,u.nombre_corregimiento,u.nombre_vereda,u.estaVerificado,u.otra_area_experticia,u.otra_area_experticia_descripcion,u.sobre_mi
     FROM usuarios as u 
     LIMIT ?,?`, 
    [offset, config.listPerPage]
  );
  const data = helper.emptyOrRows(rows);
  const meta = {page};

  return {
    data,
    meta
  }
}/*End getMultiple*/

/* ----------------------------------CREATE-----------------------------*/
async function create(usuario){
   
  let contentHtml=""; 
  let mensaje="Bienvenido(a), "+usuario.nombres+" "+"estamos emocionados de que te hayas registrado con nosotros, somos un equipo conformado por emprendedores y profesionales que trabajan día a día para promover la productividad y competitividad de la cadena piscícola del Departamento de Sucre, en alianza con los grupos de investigación, Gestión de la Producción y la Calidad y GINTEING, de la Universidad de Sucre y la Corporación Universitaria Antonio José de Sucre.";
  if(usuario.creadoCon && usuario.creadoCon=="google"){
        contentHtml = `<center>
        <img src="http://sharpyads.com/wp-content/uploads/2022/03/logo-no-name-320x320.png" width="100" height="100" />
        <h2 style='color:grey'>Bienvenido a la plataforma piscícola Dory</h2>
        <p style='color:grey; text-align:justify; margin-bottom:20px'>${mensaje}</p>
        <form>
        </center>
        </br>
        `;
  }else{              
        let mensaje2="Solo falta que verifiques tu cuenta.   Haz click en el siguiente enlace para verificar tu correo electrónico";
        let token=helper.createToken(usuario,4320);/*token de 3 días*/
        contentHtml = `<center>
        <img src="http://sharpyads.com/wp-content/uploads/2022/03/logo-no-name-320x320.png" width="100" height="100" />
        <h2 style='color:grey'>Bienvenido a la plataforma piscícola Dory</h2>
        <p style='color:grey; text-align:justify; margin-bottom:20px'>${mensaje}</p>
        <p style='color:grey; text-align:justify; margin-bottom:20px'>${mensaje2}</p> 
        <form>
        <a href="https://dory-web-app-tests.herokuapp.com/verify-account?token=${token}" style=" color:#ffffff; text-decoration:none;  border-radius:20px; border: 1px solid #19A3A6; background-color:#19A3A6; font-family:Arial,Helvetica,sans-serif; width: 205px;     margin-top: 20px; height: fit-content; padding:5px 40px; font-weight:normal;  font-size:12px;">Verificar cuenta de usuario </a></form>
        </center>
        </br>
        `;
 }
let message='Registro fallido';
  try {
    const saltRounds= 10;
    const salt= bcrypt.genSaltSync(saltRounds);//generate a salt
    const passwordHash= bcrypt.hashSync( usuario.password , salt);//generate a password Hash (salt+hash)
    usuario.password=passwordHash;//Re-assign hashed generate a salt version over original, plain text password 
    usuario.estaVerificado=0;   
  } catch  {
    throw createError(500,"Un problema al crear el usuario");
  }
    try{
      const result = await db.query(
        `INSERT INTO usuarios(cedula,nombres,apellidos,celular,direccion,id_tipo_usuario,email,password,id_area_experticia,nombre_negocio,foto,fecha_registro,fecha_nacimiento,id_departamento,id_municipio,id_corregimiento,id_vereda,latitud,longitud,estaVerificado) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, 
        [
          usuario.cedula,
          usuario.nombres, 
          usuario.apellidos,
          usuario.celular,
          usuario.direccion, 
          usuario.id_tipo_usuario,
          usuario.email,
          usuario.password, 
          usuario.id_area_experticia,
          usuario.nombre_negocio,
          usuario.foto, 
          usuario.fecha_registro,
          usuario.fecha_nacimiento,
          usuario.id_departamento,
          usuario.id_municipio,
          usuario.id_corregimiento,
          usuario.id_vereda,
          usuario.latitud,
          usuario.longitud,
          usuario.estaVerificado         
        ]
      );
      if (result.affectedRows) {
        message = 'Usuario registrado exitosamente';
        let mensaje="Bienvenido(a), "+usuario.nombres+" "+"estamos emocionados de que te hayas registrado con nosotros, somos un equipo conformado por emprendedores y profesionales que trabajan día a día para promover la productividad y competitividad de la cadena piscícola del Departamento de Sucre, en alianza con los grupos de investigación, Gestión de la Producción y la Calidad y GINTEING, de la Universidad de Sucre y la Corporación Universitaria Antonio José de Sucre.";
        let mensaje2="Solo falta que verifiques tu cuenta.   Haz click en el siguiente enlace para verificar tu correo electrónico";
        let token=helper.createToken(usuario,4320);/*token de 3 días*/
        let tema="Bienvenido a Dory";             
        helper.sendEmail(usuario.email,tema,contentHtml);
      }else {
        throw createError(500,"Ocurrió un problema al registrar un usuario");
      }

    }catch(err){
        throw err;
    }
    return {message};
  
}/*End create*/

/* ----------------------------------UPDATE-----------------------------*/

async function update(id, usuario){
      
  if (usuario.cedula!= undefined && 
    usuario.nombres!= undefined  && 
    usuario.apellidos!= undefined  &&
    usuario.celular!= undefined  &&
    usuario.direccion!= undefined  && 
    usuario.id_tipo_usuario!= undefined  &&
    usuario.email!= undefined  &&
    usuario.id_area_experticia!= undefined  &&
    usuario.nombre_negocio!= undefined  &&
    usuario.foto!= undefined  && 
    usuario.fecha_registro!= undefined  &&
    usuario.fecha_nacimiento!= undefined  &&
    usuario.id_departamento!= undefined &&
    usuario.id_municipio!= undefined  &&
    usuario.id_corregimiento!= undefined  &&
    usuario.id_vereda!= undefined  &&
    usuario.latitud!= undefined  &&
    usuario.longitud!= undefined ){

  const result = await db.query(
  `UPDATE usuarios
   SET  cedula=?,
        nombres=?, 
        apellidos=?,
        celular=?,
        direccion=?, 
        id_tipo_usuario=?,
        email=?,
        id_area_experticia=?,
        nombre_negocio=?,
        foto=?, 
        fecha_registro=?,
        fecha_nacimiento=?,
        id_departamento=?,
        id_municipio=?,
        id_corregimiento=?,
        id_vereda=?,
        latitud=?,
        longitud=?
   WHERE id=?`,
   [
    usuario.cedula,
    usuario.nombres, 
    usuario.apellidos,
    usuario.celular,
    usuario.direccion, 
    usuario.id_tipo_usuario,
    usuario.email,
    usuario.id_area_experticia,
    usuario.nombre_negocio,
    usuario.foto, 
    usuario.fecha_registro,
    usuario.fecha_nacimiento,
    usuario.id_departamento,
    usuario.id_municipio,
    usuario.id_corregimiento,
    usuario.id_vereda,
    usuario.latitud,
    usuario.longitud,
    id
   ] 
  );

  let message = 'Usuario no esta registrado';

  if (result.affectedRows) {
    message = 'Usuario actualizado exitosamente';
  }

  return {message};
}  
    throw createError(400,"Un problema con los parametros ingresados al actualizar"); 
   
}/*fin update*/


  /* ----------------------------------REMOVE-----------------------------*/

  async function remove(idUser){
    const result = await db.query(
      `DELETE FROM usuarios WHERE id=?`, 
      [idUser]
    );
  
    let message = 'Error borrando el registro del usuario';
  
    if (result.affectedRows) {
      message = 'Usuario borrado exitosamente';
    }
  
    return {message};
  }/*End Remove*/

  
/* ----------------------------------UPDATE PARCIAL DEL USUARIO-----------------------------*/
async function updateParcialUsuario(id, usuario){
  
      delete usuario.password; 
      var atributos=Object.keys(usuario); /*Arreglo de los keys del usuario*/ 

      if (atributos.length!=0){    
          var param=Object.values(usuario);
          var query = "UPDATE usuarios SET ";
          param.push(id);/*Agrego el id al final de los parametros*/ 

      for(var i=0; i<atributos.length;i++) {
        query= query+atributos[i]+'=?,';
      }
      query= query.substring(0, query.length-1);/*eliminar la coma final*/ 
      query= query+' '+'WHERE id=?'

      const result = await db.query(query,param);
    
      let message = 'Error actualizando el registro del usuario';
    
      if (result.affectedRows) {
        message = 'Usuario actualizado exitosamente';
      }
      return {message};
    }
   throw createError(400,"No hay parametros para actualizar");
 }/*End updateParcialUsuario*/

 /*-------------------------------------updatePassword---------------------------------*/  
async function updatePassword(datos){

  const{newPassword,token,}=datos;
  let message = 'Error al actualizar Password de usuario';
  const payload=helper.parseJwt(token);/*--saco la carga útil del token para averiguar el email del usuario----*/  
  const email=payload.email;
  
  if(email!=undefined && newPassword!=undefined)
   {   
     try{ 
          const saltRounds= 10;
          const salt= bcrypt.genSaltSync(saltRounds);//generate a salt 
          const passwordHash= bcrypt.hashSync( newPassword , salt);//generate a password Hash (salt+hash)          
           /*--------verificación de existencia de usuario--------*/                  
            const userbd = await db.query(
              `SELECT u.password,u.email,u.id,tu.nombre_tipo_usuario
              FROM usuarios as u, tipos_usuarios as tu
              WHERE u.id_tipo_usuario=tu.id_tipo_usuario and
                    u.email=? 
              `, 
              [email]
            );
         
          if((userbd[0].email==undefined))
          {
              return {message};
          }
          
        /*--------Actualización del password de usuario--------*/
            const result = await db.query(
              `UPDATE usuarios
              SET password=?
              WHERE email=?`,
              [
                passwordHash,
                email
              ] 
            );
                   if (result.affectedRows) {
                      message = 'Contraseña de Usuario actualizado exitosamente';
                    }          
     } catch {
              throw createError(500,"Actualización de password de usuario fallída");
             }            
            return {message};
   }     
      throw createError(400,"Email y Password requeridos!"); 
}/*End updatePassword*/

/*-------------------------------------recoverPassword---------------------------------*/
async function recoverPassword(datos){
    const{email,}=datos; 
     if(email){      
          const userbd = await db.query(
            `SELECT u.password,u.email,u.id,tu.nombre_tipo_usuario
            FROM usuarios as u, tipos_usuarios as tu
            WHERE u.id_tipo_usuario=tu.id_tipo_usuario and
                  u.email=? 
            `, 
            [email]
          );             
          if(userbd[0]){
                  const token=helper.createToken(userbd[0],15);
                  const mensaje="Hola, Nos acabas de informar que no recuerdas tu contraseña. Para volver a acceder a tu cuenta, haz click en actualizar contraseña.";
                  let tema="Recuperar Contraseña";
                  contentHtml = `<center> 
                  <img src="http://sharpyads.com/wp-content/uploads/2022/03/logo-no-name-320x320.png" width="100" height="100" />
                  <p>${mensaje}</p>   
                  <form>
                  <a href="https://dory-web-app-tests.herokuapp.com/reset-password?token=${token}" style=" color:#ffffff; text-decoration:none;  border-radius:20px; border: 1px solid #19A3A6; background-color:#19A3A6; font-family:Arial,Helvetica,sans-serif; width: 205px;     margin-top: 20px; height: fit-content; padding:5px 40px; font-weight:normal;  font-size:12px;">Actualizar Password </a></form>
                  </center>
                  </br>
                  `;
                  helper.sendEmail(email,tema,contentHtml);                  
          }else{
                throw createError(404,"El usuario no se encuentra registrado en la bd");
               }
    }else{
          throw createError(400,"Un problema con los parametros ingresados"); 
         }
}/* End recoverPassword*/

/*-------------------------------------changePassword---------------------------------*/  
async function changePassword(datos,token){

    const{antiguoPassword,newPassword,}=datos;
      if(antiguoPassword==newPassword){
          throw createError(400,"La  nueva contraseña no debe ser igual a la contraseña antigua"); 
      }
        if(token && validarToken(token)){
              const payload=helper.parseJwt(token);/*--saco la carga útil del token para averiguar el email del usuario----*/  
              const email=payload.email;        
            if(email!=undefined && newPassword!=undefined && antiguoPassword!=undefined)
            {   
                  try{
                      const saltRounds= 10;
                      const salt= bcrypt.genSaltSync(saltRounds);
                      const passwordHash= bcrypt.hashSync( newPassword , salt);                
                      /*--------verificación de existencia de usuario--------*/   
                        const existbd = await db.query(
                          `SELECT u.password
                          FROM usuarios as u
                          WHERE u.email=? 
                          `, 
                          [email]
                        );
                        if(existbd.length<1){
                          throw createError(401,"Usuario no existe ó contraseña antigua incorrecta"); 
                        }
                        let pass = existbd[0].password;                              
                        if(!( bcrypt.compareSync(antiguoPassword,pass))){
                            throw createError(401,"El usuario no existe ó la contraseña antigua es incorrecta"); 
                        }
                                          
                        const result = await db.query(
                          `UPDATE usuarios
                            SET password=?
                            WHERE email=?`,
                            [
                              passwordHash,
                              email
                            ] 
                        );
                        if (result.affectedRows) {
                            return{message : 'Contraseña de Usuario cambiada exitosamente'};
                        }else{
                            throw createError(500,"Un problema al cambiar la contraseña del usuario");
                        }
                    
                } catch (error) {
                        if(!(error.statusCode==401)){
                              throw createError(500,"Ocurrio un problema al cambiar la contraseña del usuario");
                        }else{
                              throw error; 
                        }
                }
            }else{
                throw createError(400,"Email, contraseña antigua y nuevo contraseña requeridos!"); 
            }  
        }else {
              throw createError(401,"Usted no tiene autorización"); 
        }
}/*End changePassword*/

async function verifyAccount(body){

    var token ="bearer"+" "+body.token;  
    if(token && validarToken(token)){
        const payload=helper.parseJwt(token);
        const email=payload.email; 
        let estaVerificado=1;       
        if(email!=undefined)
        {     
              const result = await db.query(
                `UPDATE usuarios
                  SET estaVerificado=?
                  WHERE email=?`,
                  [
                    estaVerificado,
                    email
                  ] 
              );
              if (result.affectedRows) {
                  return{message : 'Usuario verificado por email con éxito'};
              }else{
                  throw createError(500,"Un problema al verificar el usuario por su email");
              }
        }else{
            throw createError(400,"Email requerido!"); 
        }
    }else{
        throw createError(401,"Usted no tiene autorización"); 
    }
}/*End verifyAccount*/

async function misConsumos(token){
      if(token && validarToken(token)){
          const payload=helper.parseJwt(token);
          const id_user=payload.sub;
          const tipo_user=payload.rol;
          try{
               if(tipo_user!='Consumidor'){
                      throw createError(401,"Usted no esta autorizado por no ser consumidor");
               }
                const rows = await db.query(
                  `SELECT e.nombre, eu.cantidad_consumo
                  FROM especies_usuarios as eu left join especies e on (eu.id_especie_pk_fk=e.id_especie)
                  WHERE  eu.usuarios_id=?
                  `, 
                  [id_user]
                );
                if(rows.length<1){
                  throw createError(404,"Usted no tiene ningún consumo");
                }
                const data = helper.emptyOrRows(rows);  
                return {
                  data
                }
          }catch(err){
            throw err;
          }
    }else{
      throw createError(401,"Usted no tiene autorización"); 
    }
}/*End misConsumos*/

module.exports = {
  getUserId,
  getMultiple,
  create,
  update,
  remove,
  updateParcialUsuario,
  updatePassword,
  recoverPassword,
  changePassword,
  verifyAccount,
  misConsumos
}