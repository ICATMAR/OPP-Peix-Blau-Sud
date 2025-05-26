-- Tabla principal
CREATE TABLE opp_forms (
    id SERIAL PRIMARY KEY,
    boat_name VARCHAR(100),
    initial_position VARCHAR(100),
    initial_datetime TIMESTAMP,
    position VARCHAR(100),
    timestamp TIMESTAMP
);

-- Tabla de pescas (muchas especies por formulario)
CREATE TABLE pescas (
    id SERIAL PRIMARY KEY,
    form_id INTEGER REFERENCES opp_forms(id) ON DELETE CASCADE,
    specie VARCHAR(50),
    kg NUMERIC,
    caliber VARCHAR(20)
);

-- Tabla de no pesca (si quieres guardar motivos por formulario)
CREATE TABLE no_pesca (
    id SERIAL PRIMARY KEY,
    form_id INTEGER REFERENCES opp_forms(id) ON DELETE CASCADE,
    reason VARCHAR(100)
);

-- Tabla de interacció tonyines
CREATE TABLE interaccio_tonyines (
    id SERIAL PRIMARY KEY,
    form_id INTEGER REFERENCES opp_forms(id) ON DELETE CASCADE,
    kg INTEGER,
    interaccion VARCHAR(100)
);