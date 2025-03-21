const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const port = 3000;

const moment = require('moment');

// Configuración de la conexión a PostgreSQL
const pool = new Pool({
    user: 'postgres', // Cambia esto por tu usuario de PostgreSQL
    host: 'localhost',
    database: 'OPP_Form', // Cambia esto por el nombre de tu base de datos
    password: 'postgres', // Cambia esto por tu contraseña
    port: 5432,
});

// Middleware para analizar datos del formulario
app.use(bodyParser.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint para manejar el envío del formulario
app.post('/submit', async (req, res) => {
    const formData = req.body;
    console.log(formData);

    // Convertir initial_datetime al formato compatible con PostgreSQL
    const initialDatetime = moment(formData.initial_datetime, 'DD/MM/YYYY, HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');

    // Insertar los datos en la base de datos
    const query = `
        INSERT INTO opp_forms (
            boat_name, initial_position, initial_datetime, fishing, no_fishing, tuna, position, timestamp, specie, kg_catch, no_fishing_reason, caliber, kg_tuna, interaccion
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    `;
    const values = [
        formData.boat_name,
        formData.initial_position,
        initialDatetime,
        formData.fishing, // Fishing
        formData.no_fishing, // NoFishing
        formData.tuna, // Tuna
        formData.position || null, // Position
        formData.timestamp || null, // Timestamp
        formData.specie, // Specie
        formData.kg_catch || null, // KG
        formData.no_fishing_reason, // NoFishingReason
        formData.caliber, // Caliber
        formData.kg_tuna || null, // NumIndividuals
        formData.interaccion, // Interaccion
    ];

    try {
        await pool.query(query, values);
        console.log('Datos insertados correctamente en la base de datos.');
        res.redirect(`/result.html?boatName=${encodeURIComponent(formData.boat_name)}&initialPosition=${encodeURIComponent(formData.initial_position)}&initialDateTime=${encodeURIComponent(formData.initial_datetime)}`); // Redirigir a la página de resultado con los datos
    } catch (error) {
        console.error('Error al insertar datos en la base de datos:', error);

        // Redirigir a result.html con los datos y un mensaje de error
        const queryParams = new URLSearchParams({
            boatName: formData.boat_name,
            initialPosition: formData.initial_position,
            initialDateTime: formData.initial_datetime,
            error: 'db_connection_failed'
        }).toString();

        res.redirect(`/result.html?${queryParams}`);    }
});

app.listen(port, () => {
    console.log(`Servidor ejecutándose en http://localhost:${port}`);
});

// Endpoint para probar la conexión a la base de datos
app.get('/test-db', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()'); // Consulta simple para obtener la fecha y hora actuales
        res.send(`Conexión exitosa. Hora actual en la base de datos: ${result.rows[0].now}`);
    } catch (error) {
        console.error('Error al conectar con la base de datos:', error);
        res.status(500).send('Error al conectar con la base de datos.');
    }
});