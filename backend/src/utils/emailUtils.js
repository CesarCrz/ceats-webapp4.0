const nodemailer = require('nodemailer');

// Configurar transporter de Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

// Función para enviar email de verificación
async function sendVerificationEmail(email, verificationCode, nombre) {
  try {
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'cEats - Verificación de Email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">🍽️ cEats</h1>
            <p style="color: white; margin: 5px 0 0 0;">Sistema de Gestión de Restaurantes</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; text-align: center;">¡Bienvenido a cEats!</h2>
            
            <p style="color: #666; line-height: 1.6;">
              Hola <strong>${nombre}</strong>,<br><br>
              Gracias por registrarte en cEats. Para completar tu registro, necesitamos verificar tu dirección de email.
            </p>
            
            <div style="background: #fff; border: 2px solid #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
              <h3 style="color: #333; margin: 0 0 10px 0;">Tu código de verificación es:</h3>
              <div style="background: #667eea; color: white; font-size: 32px; font-weight: bold; padding: 15px; border-radius: 8px; letter-spacing: 5px; font-family: monospace;">
                ${verificationCode}
              </div>
            </div>
            
            <p style="color: #666; line-height: 1.6; text-align: center;">
              <strong>Este código expira en 24 horas.</strong><br><br>
              Si no solicitaste este registro, puedes ignorar este email.
            </p>
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #999; font-size: 12px;">
                © 2024 cEats. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`Email de verificación enviado a ${email}:`, result.messageId);
    return true;
  } catch (error) {
    console.error('Error enviando email de verificación:', error);
    return false;
  }
}

// Función para enviar email de bienvenida
async function sendWelcomeEmail(email, nombre, nombreRestaurante) {
  try {
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'cEats - ¡Registro Completado!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">🍽️ cEats</h1>
            <p style="color: white; margin: 5px 0 0 0;">Sistema de Gestión de Restaurantes</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; text-align: center;">¡Registro Completado!</h2>
            
            <p style="color: #666; line-height: 1.6;">
              ¡Felicidades <strong>${nombre}</strong>!<br><br>
              Tu restaurante <strong>${nombreRestaurante}</strong> ha sido registrado exitosamente en cEats.
            </p>
            
            <div style="background: #fff; border: 2px solid #4CAF50; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
              <h3 style="color: #333; margin: 0 0 10px 0;">✅ Verificación Completada</h3>
              <p style="color: #4CAF50; font-weight: bold; margin: 0;">
                Tu cuenta está activa y lista para usar
              </p>
            </div>
            
            <p style="color: #666; line-height: 1.6;">
              Ahora puedes:
            </p>
            <ul style="color: #666; line-height: 1.6;">
              <li>Iniciar sesión en tu cuenta</li>
              <li>Gestionar sucursales</li>
              <li>Crear usuarios para tu equipo</li>
              <li>Recibir y gestionar pedidos</li>
            </ul>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="http://localhost:3001/login" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Iniciar Sesión
              </a>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #999; font-size: 12px;">
                © 2024 cEats. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`Email de bienvenida enviado a ${email}:`, result.messageId);
    return true;
  } catch (error) {
    console.error('Error enviando email de bienvenida:', error);
    return false;
  }
}

module.exports = {
  sendVerificationEmail,
  sendWelcomeEmail
};
