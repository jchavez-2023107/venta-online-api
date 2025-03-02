//Conexión a la BD
"use strict"; // Habilita el modo estricto para evitar errores comunes y mejorar seguridad

import mongoose from 'mongoose'; // ODM para interactuar con MongoDB.

//Reintentos máximos para conectar a MongoDB antes de cerrar la aplicación 
let retryCount = 0;
const maxRetries = 3;

/* 
 * 📌 Definir eventos del ciclo de vida de la conexión a MongoDB.
 * Estos eventos permiten monitorear el estado de la conexión.
 */
mongoose.connection.on("error", (err) => {
    console.error("❌ MongoDB | Error en la conexión: ", err);
    retryCount++;

    if(retryCount >= maxRetries) {
        console.error("❌ MongoDB | No se pudo conectar después de varios intentos. Cerrando aplicación...");
        process.exit(1);
    } else {
        console.warn(`⚠️ MongoDB | Reintentando conexión... (${retryCount}/${maxRetries})`);
        setTimeout(connectDB, 5000); //Esperar 5 segundos antes de intentar reconectar. 
    }
});

mongoose.connection.on("connecting", () => {
    console.log("🔄 MongoDB | Intentando conectar...");
});

mongoose.connection.on("connected", () => {
    console.log("🟢 MongoDB | Conectado con éxito");
});

mongoose.connection.once("open", () => {
    console.log("✅ MongoDB | Conexión establecida con la base de datos");
});

mongoose.connection.on("reconnected", () => {
    console.log("🔄 MongoDB | Re-conectado después de una desconexión");
});

mongoose.connection.on("disconnected", async () => {
    console.warn("⚠️ MongoDB | Desconectado, intentando reconectar...");
    if (retryCount < maxRetries) {
        setTimeout(async () => {
            if (mongoose.connection.readyState === 0) { // Solo reconectar si no está ya reconectado,
                                                        // o sea, si sigue desconectado.    
                await connectDB();
            }
        }, 5000);
    } else {
        console.error("❌ MongoDB | Conexión perdida permanentemente. Cerrando aplicación...");
        process.exit(1);
    }
});


/* 
 * 📌 Función para conectar a la base de datos MongoDB
 */
export const connectDB = async () => {
    try {
        const mongoURI = `${process.env.DB_SERVICE}://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;
        console.log("🔄 Conectando a MongoDB...");

        await mongoose.connect(mongoURI, {
            maxPoolSize: 100,
            serverSelectionTimeoutMS: 5000,
        });
        console.log("✅ Conexión exitosa a MongoDB"); 
        retryCount = 0; // Resetear contador de reintentos en caso de éxito.
    } catch (err) {
        console.error("❌ Error al conectar con MongoDB: ", err);

        retryCount++;
        if(retryCount >= maxRetries) {
            console.error("❌ MongoDB | No se pudo conectar después de varios intentos. Cerrando aplicación...")
            // Si la base de datos no se conecta, cerrar la aplicación
            process.exit(1);
        } else {
            console.warn(`⚠️ MongoDB | Reintentando conexión en 5 segundos... (${retryCount}/${maxRetries})`);
            // Esperar 5s antes de intentar reconectar
            setTimeout(async () => {
                await connectDB();
            }, 5000);             
        }    
    }
};

/* 
 * 📌 Función para cerrar la conexión a la base de datos.
 * Se debe llamar cuando la aplicación se detiene.
 */
export const closeDB = async() => {
    try {
        await mongoose.connection.close();
        console.log("🔴 Conexión a MongoDB cerrada correctamente");
    } catch (err) {
        console.error("⚠️ Error al cerrar la conexión a MongoDB: ", err);
    }
};