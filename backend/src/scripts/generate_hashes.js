//vamos a importar la utilidad de hasheo desde el modulo authUtils.js

const { hashPassword } = require('../utils/authUtils');

/** 
 * Funcion par hashear una contraseña y mostrarla en consola
 * utiliza la utilidad de hashPassword
 * @param {string} password - Contraseña
 */

async function generateAndLogHash(password){
    try {
        const hash = await hashPasswords(password);
        console.log(`Contraseña: ${password} -> Hash: ${hash}`);
    } catch (error) {
        console.error(`Error al hashear la contraseña ${password}. -- ERROR: ${error}`);
    }
}



generateAndLogHash('ITESO');
generateAndLogHash('soruTesoro');
generateAndLogHash('admin');
generateAndLogHash('soru-secret-key');