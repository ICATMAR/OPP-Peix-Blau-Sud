# Readme

## Run Node

Install Node.js from nodejs.org.
Install dependencies:
```bash
    npm install express.
    npm install csv-writer
    npm install body-parser
    npm install moment
```
Run the server
```bash
    node server.js
```
Open your browser.
Go to http://localhost:3000.

## Deploy notes

Create dtabase like server.js code
```javascript
    user: 'postgres', 
    host: 'localhost', //select correcturl
    database: 'OPP_Form', 
    password: 'postgres', //change credentials
    port: 5432,
```

create table opp_forms using following query:
```SQL
-- Table: public.opp_forms

-- DROP TABLE IF EXISTS public.opp_forms;

CREATE TABLE IF NOT EXISTS public.opp_forms
(
    boat_name text COLLATE pg_catalog."default",
    initial_position text COLLATE pg_catalog."default",
    initial_datetime timestamp without time zone,
    fishing boolean,
    no_fishing boolean,
    tuna boolean,
    "position" text COLLATE pg_catalog."default",
    "timestamp" timestamp without time zone,
    specie text COLLATE pg_catalog."default",
    kg numeric,
    no_fishing_reason text COLLATE pg_catalog."default",
    caliber text COLLATE pg_catalog."default",
    num_individuals integer,
    interaccion text COLLATE pg_catalog."default"
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.opp_forms
    OWNER to postgres;
```
