const express = require('express');
const session = require('express-session');
const path = require('path');
const http = require('http');
const fs = require('fs');
const socketIo = require('socket.io');
const { error } = require('console');
const app = express();
const server = http.createServer(app)
const io = socketIo(server)
const PORT = process.env.PORT || 3000;
const jwt = require('jsonwebtoken'); 
const db = require('./db'); //importa el modulo de acceso a datos
const { comparePassword, hashPassword } = require ('./utils/authUtils');
const cors = require('cors');
require('dotenv').config();

// Rutas relativas al backend/src
const PEDIDOS_FILE = path.join(__dirname, 'pedidos.json');

// Carpeta frontend raíz y src
const FRONTEND_ROOT = path.join(__dirname, '..', '..', 'frontend');
const FRONTEND_SRC = path.join(FRONTEND_ROOT, 'src');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie:{
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24 // 24 horas de duracion de sesion
  }
}));

// Servir archivos estáticos desde frontend/src
app.use('/CSS', express.static(path.join(FRONTEND_SRC, 'CSS')));           
app.use('/JS', express.static(path.join(FRONTEND_SRC, 'JS')));
app.use('/Audio', express.static(path.join(FRONTEND_SRC, 'Audio')));
app.use('/Img', express.static(path.join(FRONTEND_SRC, 'Img')));

// Para servir el index.html directamente
app.get('/', (req, res) => {
  res.sendFile(path.join(FRONTEND_ROOT, 'index.html'));
});
app.get('/main', (req, res) => {
  res.sendFile(path.join(FRONTEND_SRC, 'pages', 'main.html'));
});
app.get('/ticket', (req, res) => {
  res.sendFile(path.join(FRONTEND_SRC, 'pages', 'ticket.html'));
});
app.get('/main/pedidos/:sucursal', (req, res) => {
  res.sendFile(path.join(FRONTEND_SRC, 'pages', 'main.html'));
});

// --  Endpoint para el inicio de sesión

app.post('/api/login', async (req, res) => {
    const {email, password} = req.body; //obtenemos las variables del body de la peticion

    if (!email || !password){
      return res.status(400).json({success: false, error: `Se requiere email y contraseña`});
    }

    try {
      //vamos a buscar al usuario en la base de datos por el email

      const queryText = 'SELECT * FROM usuarios WHERE email = $1';
      const values = [email];
      const result = await db.query(queryText, values);

      if (result.rowCount === 0){
        console.log(`Email: ${email} no encontrado`);
        return res.status(401).json({success: false, error: 'Email o contraseña incorrectos'});
      }

      const user = result.rows[0];

      //vamos a comparar la contraseña ingresada con el hash almacenado

      const passwordMatch = await comparePassword(password, user.password_hash);

      if (!passwordMatch){
        console.log(`Contraseña incorrecta o correo incorrecto`);
        return res.status(401).json({success: false, error: 'Email o contraseña incorrectos'});
      }

      // si la contraseña coincide, el usuario está autenticado
      //vamos a almacenar la informacion relevante dle usuario en el objeto de sesión (req.session.user)

      req.session.user = {
        email: user.email,
        role: user.role,
        sucursal: user.sucursal //cuando un usuario sea admin va a ser null 
      }

      //y por ultimo con todo lo anterior completado enviarmos la informacion al frontend

      //generamos el token
      const token = jwt.sign({
        email: user.email,
        role: user.role,
        sucursal:user.sucursal
      },
      JWT_SECRET,
      {expiresIn: '4h'}
      );

      console.log(`Login exitoso para usuario ${user.email} - ${user.role}`);

      res.json({
        success: true,
        email: user.email,
        role: user.role,
        sucursal: user.sucursal,
        token: token
      });

    } catch (error) {
      // si ocurre algun error vamos a capturarlo

      console.error(`Error durante el proceso del login. -- ERROR: ${error}`);
      res.status(500).json({succes: false, message: 'Error interno del servidor'});
    }
});

// - Endpoint para el registro de Restauranteros (admin de un restaurante)

app.post('/api/register-restaurantero', async (req, res) =>{
  //recibir y validar los datos del cuerpo de la solicitud
  const {
    nombreRestaurante,
    nombreContactoLegal,
    apellidosContactoLegal,
    emailContactoLegal,
    password,
    telefonoContactolegal,
    direccionFiscal,
    fechaNacimientoContactoLegal
  } = req.body;

  // agreggamos validaciones basicas 
  if (!nombreRestaurante || !nombreContactoLegal || !apellidosContactoLegal || !emailContactoLegal || !password || !telefonoContactolegal || !direccionFiscal || !fechaNacimientoContactoLegal){
    return res.status(400).json({success: false, message: 'No se puede completar el registro hacen falta datos esenciales.'});
  }

  //validar el formato basico del email 
  if (!/\S+@\S+\.\S+/.test(emailContactoLegal)){
    return res.status(400).json({success: false, message: 'El formato del email es incorrecto'});
  }

  // vamos a declarar client para asegurarnos poder usarlo en el finally

  let client;

  try {
    // INICIAR
    client = await db.pool.connect();
    await client.query('BEGIN');

    // hashear la contraseña del usuario admin
    const hashedPassword = await hashPassword(password)

    // convertir fechaNacimiento a date
    const fechaNacimientoDate = new Date(fechaNacimientoContactoLegal);
    if (isNaN(fechaNacimientoDate.getTime())){
      // si la fecha no es valida 
      await client.query('ROLLBACK');
      return res.status(400).json({success: false, message: 'Formato de la fecha invalida'});
    }

    const fechaNacimientoDB = fechaNacimientoDate.toISOString().split('T')[0]; // Convertir a 'YYYY-MM-DD'

    //insertar una nueva fila en la tabla 'restaurantes'
    const insertRestauranteQuery = `
    INSERT INTO restaurantes (nombre, nombre_contacto_legal, email_contacto_legal, telefono_contacto_legal, direccion_fiscal, terminos_aceptados_at)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING restaurante_id; -- Recuperar el ID UUID del restaurante recién creado
    `;

    const now = new Date();

    const restaurantVal = [
      nombreRestaurante,
      nombreContactoLegal,
      emailContactoLegal,
      telefonoContactolegal,
      direccionFiscal,
      now
    ];

    const restaurantResult = await client.query(insertRestauranteQuery, restaurantVal);
    const nuevoRestauranteId = restaurantResult.rows[0].restaurante_id;
    // Insertar una nueva fila en la tabla 'usuarios' para el administrador
    // Incluimos todos los campos definidos en la tabla usuarios
    const insertUsuarioQuery = `
        INSERT INTO usuarios (
            email, password_hash, role, restaurante_id,
            nombre, apellidos, fecha_nacimiento, telefono, fecha_registro,
            is_email_verified, verification_code, verification_code_expires_at, is_active
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING usuario_id; -- Opcional: recuperar ID UUID del usuario
    `;

    // Generar pin y expiración para verificación de email
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString(); // Pin de 6 dígitos
    const verificationCodeExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // Válido por 24 horas

    const usuarioValues = [
        emailContactoLegal,
        hashedPassword,
        'admin', // Rol de administrador para este usuario
        nuevoRestauranteId, // Vincular al restaurante recién creado
        nombreContactoLegal,
        apellidosContactoLegal,
        fechaNacimientoDB, // Usamos la fecha parseada
        telefonoContactolegal,
        now, // Fecha de registro del usuario
        false, // is_email_verified inicialmente false
        verificationCode,
        verificationCodeExpiresAt,
        true // is_active inicialmente true
    ];

    const usuarioResult = await client.query(insertUsuarioQuery, usuarioValues);
    const nuevoUsuarioId = usuarioResult.rows[0].usuario_id; // Puedes usar este ID si lo necesitas

    await client.query('COMMIT');

    // Responder al frontend con éxito
    // NOTA: Aquí es donde idealmente se activaría el envío del email de verificación
    // con el pin al emailContactoLegal.
    console.log(`Restaurante "${nombreRestaurante}" (${nuevoRestauranteId}) y Administrador "${emailContactoLegal}" (${nuevoUsuarioId}) registrados con éxito. Pin de verificación: ${verificationCode}`); // Loggear pin en desarrollo (QUITAR EN PRODUCCIÓN!)

    res.status(201).json({
      success: true,
      message: 'Restaurante y usuario administrador registrado con exito. Por favor, verifique su correo electrónico con el pin enviado',
      restauranteID: nuevoRestauranteId,
      usuarioId: nuevoUsuarioId
    })

 
  } catch (error) {
    //hacemos rollback si hay agun error
    if (client){
      await client.query('ROLLBACK');
    }
    console.error(`Error durante el registro del restaurante -- ERROR: ${error}`);

    //manejar error de duplicidad de email
    if (error.code === '23505'){
      return res.status(409).json({success: false, error: 'Error interno del servidor durante el registro'});
    }

  }finally{
    //liberar al cliente de Db
    if (client){
      client.release();
    }
  }
});


/*function cargarPedidos() {
  if (!fs.existsSync(PEDIDOS_FILE)) return []
  const raw = fs.readFileSync(PEDIDOS_FILE, 'utf-8');
  return JSON.parse(raw);
}

function guardarPedidos(pedidos) {
  fs.writeFileSync(PEDIDOS_FILE, JSON.stringify(pedidos, null, 2), 'utf-8');
}*/

// -- Endpoint para obtener los pedidos filtrados por sucursal

app.get('/api/pedidos/sucursal/:sucursal', verifyToken, async (req, res)=>{
    //obtenemos el valor del del parametro ':sucursal' de la URL
    const sucursalSolicitada = req.params.sucursal; // Renombramos para mayor claridad

    // **** Lógica de Autorización: Verificar acceso basado en rol y sucursal ****
    const usuarioAutenticado = req.user; // Info del usuario del token

    // 1. Si no hay usuario o no tiene rol/sucursal, denegar acceso (aunque verifyToken ya lo haría, es buena práctica)
    if (!usuarioAutenticado || !usuarioAutenticado.role) {
         return res.status(403).json({ success: false, message: 'Acceso denegado: Información de usuario incompleta en el token.' });
    }

    // 2. Permitir acceso total a administradores
    if (usuarioAutenticado.role === 'admin') {
        // Los administradores pueden acceder a cualquier sucursal.
        // Continuar con la consulta usando la sucursal solicitada en la URL.
        console.log(`Admin ${usuarioAutenticado.email} accediendo a pedidos de sucursal ${sucursalSolicitada}`);
    } else if (usuarioAutenticado.role === 'empleado' || usuarioAutenticado.role === 'gerente') { // O cualquier otro rol no admin
        // 3. Restringir a usuarios no admin a su sucursal asignada
        if (!usuarioAutenticado.sucursal) {
             return res.status(403).json({ success: false, message: 'Acceso denegado: Su usuario no tiene una sucursal asignada.' });
        }

        if (usuarioAutenticado.sucursal !== sucursalSolicitada) {
            // Si el usuario intenta acceder a una sucursal que no es la suya
            console.warn(`Usuario ${usuarioAutenticado.email} (${usuarioAutenticado.role}) intentó acceder a pedidos de sucursal ${sucursalSolicitada} (Su sucursal es ${usuarioAutenticado.sucursal})`);
            return res.status(403).json({ success: false, message: `Acceso denegado: Solo puede acceder a pedidos de sucursal ${usuarioAutenticado.sucursal}.` });
        }
        // Si es su propia sucursal, permitir acceso.
         console.log(`Usuario ${usuarioAutenticado.email} (${usuarioAutenticado.role}) accediendo a pedidos de sucursal ${sucursalSolicitada}`);

    } else {
         // Si tiene otro rol no definido, denegar acceso por defecto
        return res.status(403).json({ success: false, message: `Acceso denegado: Rol de usuario desconocido (${usuarioAutenticado.role}).` });
    }
    // **************************************************************************


    // paso de validacion para asegurarnos  que se proporciono el nombre de la sucursal
    // Esta validación es útil si el admin pudiera omitir la sucursal, pero con el parámetro obligatorio, ya está cubierta por express.
    // if (!sucursalSolicitada) return res.status(400).json({ success: false, error: `Se requiere especificar la sucursal para obtener los pedidos`});

    try {
      // consulta SQL para obtener pedidos filtrador por Sucursal
      // seleccionamos todas las columnas ("*") de la tabla 'pedidos'
      // ordena los resultados por la columna 'time' de forma DESCENDENTE - ESC

      const queryText = 'SELECT * FROM pedidos WHERE sucursal = $1 ORDER BY hora DESC';
      //usamos placeholder
      const values = [sucursalSolicitada];

      const result = await db.query(queryText, values);

      const pedidosFiltrados = result.rows;

      res.json(pedidosFiltrados)

    } catch (error) {
      console.error(`Error al obtener los pedidos de la sucursal ${sucursalSolicitada} de la BD -- ERROR: ${error}`);
      res.status(500).json({success: false, error: 'Error interno del servidor al obtener los pedidos por sucursal'});
    }    

});

/*app.post('/api/pedidos/:codigo/estado', (req, res) => {
  const { codigo } = req.params;
  const { estado} = req.body;
  
  if (!estado) {
    return res.status(400).json({error: 'Falto el campo de estado'});
  }

  let pedidos = cargarPedidos();
  const idx = pedidos.findIndex(p => p.codigo === codigo || p.orderId === codigo);

  if (idx === -1) {
    return res.status(404).json({error: 'Pedido no encontrado'});
  }

  pedidos[idx].estado = estado;
  guardarPedidos(pedidos);

  io.emit('update_order', pedidos[idx]);

  res.json({ success: true, pedido: pedidos[idx] });
});*/

app.post('/api/pedidos/:codigo/estado', verifyToken, async (req, res) =>{
    const codigoPedido = req.params.codigo; //obtiene el codigo de la URL
    const {estado: nuevoEstado} = req.body; //y obtiene el nuevo estado del pedido directo del body de la solicitud POST
    if (!nuevoEstado) return res.status(400).send('Se requiere el nuevo estado del pedido para poder actualizar');
    
    // **** Lógica de Autorización: Verificar permiso para actualizar estado ****
    const usuarioAutenticado = req.user; // Info del usuario del token

    // 1. Si no hay usuario o no tiene rol, denegar acceso
    if (!usuarioAutenticado || !usuarioAutenticado.role) {
         return res.status(403).json({ success: false, message: 'Acceso denegado: Información de usuario incompleta en el token.' });
    }

    // 2. Obtener la sucursal del pedido que se intenta actualizar
    try {
        const pedidoResult = await db.query('SELECT sucursal FROM pedidos WHERE codigo = $1', [codigoPedido]);

        if (pedidoResult.rowCount === 0) {
             // Si el pedido no existe, responde con 404 (no es un error de autorización per se, sino de recurso no encontrado)
            return res.status(404).json({ success: false, error: `Pedido con código ${codigoPedido} no encontrado en la BD.` });
        }

        const sucursalDelPedido = pedidoResult.rows[0].sucursal;

        // 3. Verificar permisos basados en rol y sucursal
        if (usuarioAutenticado.role !== 'admin') {
            // Si el usuario NO es administrador, debe ser un usuario con sucursal asignada y debe coincidir con la sucursal del pedido
            if (!usuarioAutenticado.sucursal) {
                return res.status(403).json({ success: false, message: 'Acceso denegado: Su usuario no tiene una sucursal asignada.' });
            }

            if (usuarioAutenticado.sucursal !== sucursalDelPedido) {
                // Si el usuario intenta actualizar un pedido de otra sucursal
                 console.warn(`Usuario ${usuarioAutenticado.email} (${usuarioAutenticado.role}) intentó actualizar estado de pedido ${codigoPedido} (sucursal ${sucursalDelPedido}) desde sucursal ${usuarioAutenticado.sucursal}`);
                 return res.status(403).json({ success: false, message: `Acceso denegado: No tiene permiso para actualizar pedidos de sucursal ${sucursalDelPedido}.` });
            }
             // Si es su propia sucursal, permitir continuar (después de esta comprobación)
             console.log(`Usuario ${usuarioAutenticado.email} (${usuarioAutenticado.role}) actualizando estado de pedido ${codigoPedido} de sucursal ${sucursalDelPedido}`);

        } else {
            // Si es administrador, permitir actualizar cualquier pedido
             console.log(`Admin ${usuarioAutenticado.email} actualizando estado de pedido ${codigoPedido} de sucursal ${sucursalDelPedido}`);
        }

    } catch (error) {
        console.error(`Error al obtener la sucursal del pedido ${codigoPedido} para autorización: --- ERROR: ${error}`);
        return res.status(500).json({ success: false, error: 'Error interno del servidor durante la autorización.' });
    }
    
    try {
      //Vamos a hacer una consulta SQL para actualizar el estado de un pedido especifico a traves de su código
      const queryText = `
          UPDATE pedidos
          SET estado = $1
          WHERE codigo = $2
      `
      const values = [nuevoEstado, codigoPedido];
      //primero mandamos a la base de datos...
      const result = await db.query(queryText, values); 
      
      //si las filas afectadas o result.rowCount son al menos 1 es que encontró el pedido con el codigo
      if (result.rowCount > 0 ){
          //mandamos a Google appscript pero sin añadir latencia ya que primero se ejecuta la ejecucion a la BD
          fetch('https://script.google.com/macros/s/AKfycbzhwNTB1cK11Y3Wm7uiuVrzNmu1HD1IlDTPlAJ37oUDgPIabCWbZqMZr-86mnUDK_JPBA/exec', {
            method: 'POST',
            body: JSON.stringify({
              action: 'actualizarEstadoPedido',
              codigo: codigoPedido,
              nuevoEstado: nuevoEstado
            }),
            headers: {'Cotent-Type': 'appliation/json'} 
          })
          .then(response => {
              console.log(`Google Sheets Api response status ${response.status}`);
              return response.json();
            })
          .then(gsData => console.log(`Google Sheets Api response data: ${gsData}`))
          .catch(gsError => console.error(`Error al llamar a la API de Google Sheets: --- ERROR: ${gsError}`));

          res.json({succes: true, mensaje: `Estado del pedido ${codigoPedido} actualizado a: ${nuevoEstado} en DB`});
        
      } else {
        res.status(404).json({succes: false, error: `Pedido con código ${codigoPedido} no encontrado en la BD`});
      }
    } catch (error) {
      console.error(`Error al actualziar le estado del pedido ${codigoPedido} en la BD`);
      res.status(500).json({success: false, error: 'Error interno del servidor al actualizar el estado del pedido'});
    }
});

// Endpoint para que Google Apps Script mande nuevos pedidos
/*app.post('/api/pedidos/:sucursal', (req, res) => {
  const { sucursal } = req.params;
  const pedido = req.body;

  pedido.codigo = pedido.codigo || pedido.orderId;

  // Normaliza el pedido para que siempre tenga un array en pedido.pedido
  if (typeof pedido.productDetails === 'string') {
    try {
      pedido.pedido = JSON.parse(pedido.productDetails);
    } catch (e) {
      pedido.pedido = [];
    }
  } else if (Array.isArray(pedido.productDetails)) {
    pedido.pedido = pedido.productDetails;
  } else if (typeof pedido.pedido === 'string') {
    try {
      pedido.pedido = JSON.parse(pedido.pedido);
    } catch (e) {
      pedido.pedido = [];
    }
  } else if (Array.isArray(pedido.pedido)) {
    // Ya está bien
  } else {
    pedido.pedido = [];
  }

  console.log(`Pedido nuevo para ${sucursal}:`, pedido);
  let pedidos = cargarPedidos();

  const yaExiste = pedidos.some(p => p.codigo === pedido.codigo);
  if (!yaExiste) {
    pedidos.push(pedido);
    guardarPedidos(pedidos);
  }
  
  io.emit('new_order', pedido);

  res.sendStatus(201);
});*/


// --- FALTA COMPROBAR DEL ENVIO DESDE EL SERVIDOR DE WHATSAPP QUE SEA ACORDE A COMO SE RECIBEN AQUI LOS PARAMETROS EN pedidoParaDB
// -- Endpoint para meter nuevos pedidos 
app.post('/api/pedidos/:sucursal', verifyToken, async (req, res) =>{
    const { sucursal } = req.params; //Obtenemos la sucursal de la URL
    const datosEntrada = req.body; //Obtenemos los datos entrantes

    // -- logica de Normalización y Mapeo (Ajustado para ambos tipos de pedidos (recoger o domicilio) )
    
    const tipoPedido = datosEntrada.deliverOrRest ? datosEntrada.deliverOrRest: 'desconocido'; 
    //Vamos a mapear los campos de 'datosEntrada' a las propiedades esperadas en el objeto pedido y que coinciden con las columnas de la BD

    const pedidoParaDB = {
      codigo : datosEntrada.orderId,
      deliver_or_rest: tipoPedido,
      estado: datosEntrada.estado || 'Pendiente', //Estado 'Pendiente' por default
      nombre: datosEntrada.name,
      celular: datosEntrada.numero,
      sucursal: sucursal,
      pedido: datosEntrada.productDetails,
      instrucciones: datosEntrada.specs,
      entregar_a: tipoPedido === 'recoger' ? datosEntrada.deliverTo: datosEntrada.name,
      domicilio: tipoPedido === 'domicilio' ? datosEntrada.address: null,
      total: datosEntrada.total,
      currency: datosEntrada.currency,
      pago: tipoPedido === 'domicilio' ? datosEntrada.payMethod : null,
      // Generemos fecha y hora a partir de la hora mexicana 'America/Mexico_City'
      fecha: new Date().toLocaleDateString('es-MX', {timeZone: 'America/Mexico_City'}).split('/').reverse().join('-'),
      hora: new Date().toLocaleTimeString('es-MX', {timeZone: 'America/Mexico_City', hour12: false}), //se guarda en formato 24 horas (PREGUNTAR A DANI SI HAY PROBLEMA CON ESTO)
      tiempo: datosEntrada.tiempo ? datosEntrada.tiempo: '' 
    };

    if (typeof pedidoParaDB.pedido !== 'string'){
      console.error(`productDetails no es un JSON string válido, por lo tanto no puede ser procesado. \n---FORMATO ACTUAL: ${pedidoParaDB.pedido}`);
      return res.status(400).json({success: false, error: `El formato de 'productDetails' debe ser un string`});
    }

    if (!pedidoParaDB.codigo || !pedidoParaDB.deliver_or_rest || !pedidoParaDB.estado || !pedidoParaDB.nombre || !pedidoParaDB.celular || !pedidoParaDB.sucursal || !pedidoParaDB.pedido || !pedidoParaDB.total || !pedidoParaDB.currency || pedidoParaDB.pago === undefined || !pedidoParaDB.fecha || !pedidoParaDB.hora || pedidoParaDB.entregar_a === undefined) { // Validar campos clave
      console.error('Intento de crear pedido con datos faltantes (despues de mapeo):', pedidoParaDB);
      console.error('Datos recibidos:', datosEntrada);
      return res.status(400).json({ success: false, error: 'Faltan datos requeridos para crear el pedido (codigo, deliver_or_rest, estado, nombre, celular, sucursal, pedido, total, currency, pago, fecha, hora, entregar_a son minimos).' });
  }
  
    if (tipoPedido === 'domicilio' && !pedidoParaDB.domicilio) {
      console.error('Pedido a domicilio sin direccion:', pedidoParaDB);
      return res.status(400).json({ success: false, error: 'Se requiere domicilio para pedidos a domicilio.' });
  } 

    if (tipoPedido === 'recoger' && !pedidoParaDB.entregar_a){
      console.error(`El pedido: ${pedidoParaDB.codigo} a recoger debe incluir nombre de la persona a entregar:`);
      return res.status(400).json({ success: false, error: 'Se requiere nombre de la persona a entregar para pedidos a recoger'});
    }

    //Creamos la consulta SQL para insertar un nuevo pedido en la BD

    const queryText = `
      INSERT INTO pedidos (
        codigo, deliver_or_rest, estado, nombre, celular, sucursal,
        pedido, instrucciones, entregar_a, domicilio, total, currency,
        pago, fecha, hora, tiempo
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING codigo;
    `;

    const values = [
      pedidoParaDB.codigo,
      pedidoParaDB.deliver_or_rest,
      pedidoParaDB.estado,
      pedidoParaDB.nombre,
      pedidoParaDB.celular,
      pedidoParaDB.sucursal,
      pedidoParaDB.pedido,
      pedidoParaDB.instrucciones,
      pedidoParaDB.entregar_a,
      pedidoParaDB.domicilio,
      pedidoParaDB.total,
      pedidoParaDB.currency,
      pedidoParaDB.pago,
      pedidoParaDB.fecha,
      pedidoParaDB.hora,
      pedidoParaDB.tiempo
    ];

    try {
      //mandamos el pedido a la BD
      const result = await db.query(queryText, values);
      const codigoPedidoInsertado = result.rows[0].codigo;

      //Sincronizacion y Notificación despues de la inserción exitosa en la BD
      res.status(201).json({succes: true, codigo: codigoPedidoInsertado, mensaje: `Se ha insertado con exito el pedido: ${codigoPedidoInsertado} en la BD`});
    } catch (error) {
      console.error(`Error al insertar el pedido en la base de Datos ---ERROR: ${error}`);
      if (error.code === '23505'){
        return res.status(409).json({succes: false, error: `Ya existe un pedido para el codigo: ${pedidoParaDB.codigo}`});
      }
      res.status(500).json({succes: false, error: 'Error interno del servidor al crear el pedido'}); 
    }


});

/*app.get('/api/pedidos/:codigo', (req, res) => {
  const codigo = req.params.codigo;
  const pedidos = cargarPedidos();
  const pedido = pedidos.find(p => p.codigo === codigo || p.orderId === codigo);

  if (pedido) {
    res.json(pedido);
  } else {
    res.status(404).json({error: 'Pedido no encontrado'});
  }
});*/

app.get('/api/pedidos/:codigo', verifyToken, async (req, res) => {
    const codigo = req.params.codigo;
    if (!codigo){
      console.error('se requiere un codigo de pedido obligatoriamente');
      return res.status(400).send('Se requiere un codigo de pedido OBLIGATORIAMENTE');
   }
    try {
      // Consulta SQL para obtener un pedido por el codigo
      // Usamos placeholder $1 y pasamos [codiho] para evitar inyecciones SQL

      const queryText = 'SELECT * FROM pedidos WHERE codigo = $1';
      const values = [codigo];
      const result = await db.query(queryText, values);

      //si la consulta encontro al menos una fila....
      if (result.rows.length > 0 ){
        const pedido = result.rows[0]; //toma la primer fila (el pedido)
        res.json(pedido); // y envia el pedido
      } else {
        //si no encuentra ningun pedido con ese codigo, devuelve error con trazabilidad
        res.status(404).json({error: `Pedido con código ${codigo} no encontrado ne la BD`});
      } 
    } catch (error) {
      //en caso de error  al consultar la base de datos...
      console.error(`Error al obtener el pedido: ${codigo} de la BD`);
      res.status(500).send(`Error interno del servidor al obtener el pedido`);
    }    
});

// IMPORTANTE: Debes instalar node-fetch (npm install node-fetch)
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

app.get('/api/obtenerPedidos', async (req, res) => {
  try {
    const sucursal = req.query.sucursal || 'ALL';

    const url = `https://script.google.com/macros/s/AKfycbzhwNTB1cK11Y3Wm7uiuVrzNmu1HD1IlDTPlAJ37oUDgPIabCWbZqMZr-86mnUDK_JPBA/exec?action=getPedidos&sucursal=${sucursal}`;

    const response = await fetch(url);
    const data = await response.json();

    res.json(data);
  } catch (err) {
    console.log("Error al obtener pedidos:", err);
    res.status(500).json({ error: 'Error al obtener pedidos.' });
  }
});

/*app.delete('/api/pedidos/:codigo', (req, res) => {
  const codigo = req.params.codigo;
  let pedidos =cargarPedidos();

  const idx = pedidos.findIndex(p => p.codigo === codigo || p.orderId === codigo);
  if (idx === -1) {
    return res.status(404).json({ success: false, error: 'Pedido no encontrado' });
  }

  const eliminado = pedidos.splice(idx, 1)[0];
  guardarPedidos(pedidos);

  io.emit('pedido_eliminado', eliminado);

  res.json({ success: true, pedido: eliminado });
})*/

app.delete('/api/pedidos/:codigo', verifyToken, async (req, res) => {
  //obtiene el valro del parametro :codigo de la URL
  const codigoPedido = req.params.codigo;

  //Lógica de Autorización: Solo permitir eliminar a roles autorizados
  const usuarioAutenticado = req.user; // Info del usuario del token

  // Define qué roles tienen permiso para eliminar
  const rolesAutorizadosParaEliminar = ['admin']; // Puedes ajustar esto

  if (!usuarioAutenticado || !usuarioAutenticado.role || !rolesAutorizadosParaEliminar.includes(usuarioAutenticado.role)) {
       return res.status(403).json({ success: false, message: 'Acceso denegado: No tiene permiso para eliminar pedidos.' });
  }

  if (!codigoPedido) return res.status(400).json({success: false, error: 'Se requiere un pedido para eliminar'});
  try {

    //consulta SQL para eliminar un pedido específico
    const queryText = 'DELETE FROM pedidos WHERE codigo = $1';
    const values = [codigoPedido];

    //EJECUTAMOS EL SQL CON SUS PARAMETROS
    const result = await db.query(queryText, values);

    if (result.rowCount > 0) {
      // si se eliminó al menos una fila
      console.log(`Pedido con codigo ${codigoPedido} elimiando con éxito de la BD`);
      res.json({success: true, mensaje: `Pedido con codigo ${codigoPedido} eliminado con éxito`});
    } else {
      //Si rowCount es 0 ningu pedido con ese codigo fue elimiando
      res.status(404).json({success: false, error: `Pedido con codigo ${codigoPedido} no encontrado para eliminar`});
    }

  } catch (error) {
    console.error(`Error al eliminar el pedido ${codigoPedido} --- Error: ${error}`);
    res.status(500).json({success: false, error: `Error interno del servidor`});
  }

});

app.post('/api/cancelarPedido', async (req, res) => {
  const { codigoPedido, motivo } = req.body;
  const WEBHOOK_URL = 'https://webhook.site/e45ed4d4-7a0b-4258-b03a-f4fa20a53a41';

  if (!codigoPedido || !motivo) {
    return res.status(400).json({ success: false, error: 'Faltan datos' });
  }

  try {
    await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        codigoPedido,
        motivo,
        timestamp: new Date().toISOString()
      })
    });

    const sheetsResp = await fetch('https://script.google.com/macros/s/AKfycbzhwNTB1cK11Y3Wm7uiuVrzNmu1HD1IlDTPlAJ37oUDgPIabCWbZqMZr-86mnUDK_JPBA/exec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `action=actualizarEstadoPedido&codigo=${encodeURIComponent(codigoPedido)}&nuevoEstado=Cancelado`
    });
    const sheetsData = await sheetsResp.json();
    if (sheetsData.estado !== 'ESTADO_ACTUALIZADO') {
      return res.status(500).json({ success: false, error: 'No se pudo actualizar el estado en Sheets.' });
    }

    let pedidos = cargarPedidos();
    const idx = pedidos.findIndex(p => p.codigo === codigoPedido || p.orderId === codigoPedido);
    if (idx === -1) {
      return res.status(404).json({ success: false, error: 'Pedido no encontrado' });
    }
    const eliminado = pedidos.splice(idx, 1)[0];
    guardarPedidos(pedidos);

    io.emit('pedido_eliminado', eliminado);

    res.json({ success: true });
  } catch (err) {
    console.error("Error en cancelarPedido:", err);
    res.status(500).json({ success: false, error: 'Error al cancelar el pedido.' });
  }
});

app.post('/api/verificarPassword', async (req, res) => {
  const { email, password } = req.body;
  try {
    const response = await fetch('https://script.google.com/macros/s/AKfycbzhwNTB1cK11Y3Wm7uiuVrzNmu1HD1IlDTPlAJ37oUDgPIabCWbZqMZr-86mnUDK_JPBA/exec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'verificarPassword',
        email,
        password
      })
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error al verificar la contraseña.' });
  }
});

app.post('/api/cambiarPassword', async (req, res) => {
  const { email, nuevaPassword} = req.body;

  try {
    const response = await fetch('https://script.google.com/macros/s/AKfycbzhwNTB1cK11Y3Wm7uiuVrzNmu1HD1IlDTPlAJ37oUDgPIabCWbZqMZr-86mnUDK_JPBA/exec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'cambiarPassword',
        email,
        nuevaPassword
      })
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error al cambiar la contraseña.' });
  }
});

app.get('/api/corte', async (req, res) => {
  const sucursal = req.query.sucursal;
  if (!sucursal) {
    return res.status(400).json({ error: 'Falta el parámetro de sucursal' });
  }

  try {
    // Cambia la URL a la de tu Apps Script
    const url = `https://script.google.com/macros/s/AKfycbzhwNTB1cK11Y3Wm7uiuVrzNmu1HD1IlDTPlAJ37oUDgPIabCWbZqMZr-86mnUDK_JPBA/exec?action=getPedidos&sucursal=${encodeURIComponent(sucursal)}&estados=liberado`;
    const response = await fetch(url);
    const data = await response.json();
    const pedidos = Array.isArray(data.pedidos) ? data.pedidos : [];

    let efectivo = 0, tarjeta = 0;
    pedidos.forEach(p => {
      const pago = (p.pago || p.payMethod || '').toLowerCase();
      const totalPedido = parseFloat(p.total) || 0;
      if (pago === 'efectivo') efectivo += totalPedido;
      else if (pago === 'tarjeta') tarjeta += totalPedido;
    });

    const total = efectivo + tarjeta;
    res.json({
      efectivo: efectivo.toFixed(2),
      tarjeta: tarjeta.toFixed(2),
      total: total.toFixed(2)
    });
  } catch (err) {
    console.error("Error en corte desde sheets:", err);
    res.status(500).json({ error: 'Error al obtener el corte desde Sheets.' });
  }
});;

// -- Endpoint para obtener todos los pedidos (como lo haría el rol "admin")
app.get('/api/pedidos.json', verifyToken, async (req, res) => {
  if (!req.user || req.user.role !== 'admin'){
    console.warn(`El usuario ${req.user} está intentando acceder a funciones de administrador. REVISAR LA SEGURIDAD DEL ENDPOINT`);
    return res.status(403).json({success: false, error: 'Acceso denegado: No cuentas con los permisos necesarios para acceder a esta función'});
  }
  try {
    //vamos a ejecutar una consulta SQL para obtener todos los pedidos ordenados por hora descendente
    const result = await db.query('SELECT * FROM pedidos ORDER BY hora DESC');

    const pedidos = result.rows; //'result.rows' contiene el array de pedidos (resultados)
    res.json(pedidos);
  } catch (error) {
    //si hay error al consultar la base de datos, registrarlo y responder un error al cliente
    console.error(`ERROR AL OBTENER PEDIDOS DE LA BASE DE DATOS --- ERROR: ${error}`);
    res.status(500).send('Error interno del servidor al obtener pedidos')
  }
});

/*app.get('/api/pedidos.json', async (req, res) => {
  const pedidos = cargarPedidos();
  res.json(pedidos);
});*/

// Middleware para verificar el token JWT
function verifyToken(req, res, next){
  //obtener el token del encabezado Authorization
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; //Divide el "Bearer" y toma unicamente el token

  if (token === null){
    // si no hay token denegar acceso
    return res.status(401).json({success: false, error: 'Acceso denegado: Token no proporcionado'});    
  }
  // verificar el token 
  jwt.verify(token, process.env.JWT_SECRET, (err, user) =>{
    if (err){
      console.error(`error al verificar el token JWT -- ERROR: ${error}`);
      return res.status(403).json({success: false, error: 'Acceso denegado: Token inválido o expirado'}); 
    }

    //si el token es válido, adjuntar la infomraicon del usuario codificada
      req.user = user;

      //continuar con el siguiente middleware / manejador de ruta
      next();

  });
}



server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
