const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const port = 3000;

const moment = require('moment');

// Configuración de la conexión a PostgreSQL
// const pool = new Pool({
//     user: 'postgres', // Cambia esto por tu usuario de PostgreSQL
//     host: 'localhost',
//     database: 'OPP_Form', // Cambia esto por el nombre de tu base de datos
//     password: 'postgres', // Cambia esto por tu contraseña
//     port: 5432,
// });

// Configuracion para deployment
const pool = new Pool({
    user: 'sadmin', // Cambia esto por tu usuario de PostgreSQL
    host: 'opp_peix_blau_sud-psql-1',
    // host: '172.25.0.3',
    database: 'OPP_Form', // Cambia esto por el nombre de tu base de datos
    password: '4rb0lv3rDE', // Cambia esto por tu contraseña
    port: 5432,
});


// Middleware para analizar datos del formulario
app.use(bodyParser.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint para manejar el envío del formulario
app.post('/submit', async (req, res) => {
    console.log('POST /submit recibido');
    console.log('Datos recibidos:', JSON.stringify(req.body, null, 2));
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        // 1. Insertar en opp_forms
        const formResult = await client.query(
            `INSERT INTO opp_forms (boat_name, initial_position, initial_datetime, position, timestamp)
             VALUES ($1, $2, $3, $4, $5) RETURNING id`,
            [
                req.body.boat_name,
                req.body.initial_position,
                moment(req.body.initial_datetime, "D/M/YYYY, HH:mm:ss").format("YYYY-MM-DD HH:mm:ss"),
                req.body.position,
                req.body.timestamp
            ]
        );
        const formId = formResult.rows[0].id;

        // 2. Insertar especies en pescas si corresponde
        if (req.body.fishing === "true" && req.body.species) {
            let speciesArray = req.body.species;
            if (!Array.isArray(speciesArray)) {
                speciesArray = Object.values(speciesArray);
            }
            for (const s of speciesArray) {
                await client.query(
                    `INSERT INTO pescas (form_id, specie, kg, caliber)
                    VALUES ($1, $2, $3, $4)`,
                    [
                        formId,
                        s.name,
                        s.kg === "" ? null : s.kg, // <-- Aquí conviertes "" a null
                        s.caliber
                    ]
                );
            }
        }

        // 3. Insertar motivos en no_pesca si corresponde
        if (req.body.no_fishing_active === "true" && req.body.no_fishing) {
            let noFishingArray = req.body.no_fishing;
            if (!Array.isArray(noFishingArray)) {
                noFishingArray = Object.values(noFishingArray);
            }
            for (const n of noFishingArray) {
                await client.query(
                    `INSERT INTO no_pesca (form_id, reason)
                     VALUES ($1, $2)`,
                    [formId, n.reason]
                );
            }
        }

        // 4. Insertar interacciones en interaccio_tonyines si corresponde
        if (req.body.tuna_active === "true" && req.body.tuna) {
            let tunaArray = req.body.tuna;
            if (!Array.isArray(tunaArray)) {
                tunaArray = Object.values(tunaArray);
            }
            for (const t of tunaArray) {
                await client.query(
                    `INSERT INTO interaccio_tonyines (form_id, kg, interaccion)
                    VALUES ($1, $2, $3)`,
                    [
                        formId,
                        t.kg === "" ? null : t.kg, // <-- Aquí conviertes "" a null
                        t.interaccion
                    ]
                );
            }
        }

        await client.query('COMMIT');
        res.redirect('/result.html');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).send('Error al guardar');
    } finally {
        client.release();
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