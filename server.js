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
            boat_name, initial_position, initial_datetime, fishing, no_fishing, tuna, position, timestamp, specie, kg, no_fishing_reason, caliber, num_individuals, interaccion
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    `;
    const values = [
        formData.boat_name,
        formData.initial_position,
        initialDatetime,
        !!formData.fishing, // Fishing
        !!formData.no_fishing, // NoFishing
        !!formData.tuna, // Tuna
        formData.position,
        formData.timestamp,
        formData.specie, // Specie
        formData.kg || null, // KG
        formData.no_fishing_reason, // NoFishingReason
        formData.caliber, // Caliber
        formData.num_individuals || null, // NumIndividuals
        formData.interaccion, // Interaccion
    ];

    try {
        await pool.query(query, values);
        console.log('Datos insertados correctamente en la base de datos.');
        res.send('Formulario enviado correctamente.');
    } catch (error) {
        console.error('Error al insertar datos en la base de datos:', error);
        res.status(500).send('Error al guardar los datos.', error);
    }
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