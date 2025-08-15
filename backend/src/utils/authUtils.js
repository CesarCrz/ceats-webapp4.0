const bcrypt = require('bcrypt');

//definimos el numero de rondas de salt para bcrypt
const saltrounds = 10;

   /**
     * Compara una contraseña de texto plano con un hash bcrypt existente de forma asincrona.
     * @param {string} password - La contraseña en texto plano a comparar.
     * @param {string} hash - El hash bcrypt almacenado (retornado).
     * @returns {Promise<boolean>} Una promesa que resuelve con true si la contraseña coincide con el hash, false en caso contrario.
     */

async function hashPassword(password){
    if (!password || typeof password !== 'string'){
        throw new Error ('La contraseña debe ser un string valido');
    }
    try {
        const hash = await bcrypt.hash(password, saltrounds);
        return hash;
    } catch (error) {
        console.error(`Error al hashear la contraseña. -- ERROR: ${error}`);
        throw new Error('No se ha po dido hashear la contraseña. ERROR');
    }
}


async function comparePassword(password, hash){
    if (!password || typeof password !== 'string' || !hash || typeof hash !== 'string'){
        return false; //retorna falso si no hay contraseña o si no hay hash o si cualquiera de estas anteriores son diferentes de string. basicamente si las entradas son diferentes a las entradas validas
    }
    try {
        const match  = await bcrypt.compare(password, hash);
        return match;
    } catch (error) {
        //ante cualquier errror durante la verifiacion logueamos el error
        console.error(`Error al comparar las contraseñas. -- ERROR: ${error}`);
        throw new Error('No se ha podido comparar las contraseñas. ERROR');
        return false;
    }
}


//exportamos las funciones para que puedan ser usadas en otros modulos

module.exports = {
    hashPassword,
    comparePassword,
};
