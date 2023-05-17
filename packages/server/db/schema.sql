-- Postgraphile RLS JWT SQL

-- DOWN MIGRATION

-- REVOKE ALL PRIVILEGES ON FUNCTION app.SIGNUP(email TEXT, password TEXT) FROM guest;
-- REVOKE ALL PRIVILEGES ON FUNCTION app.SIGNIN(email TEXT, password TEXT) FROM guest;
-- REVOKE ALL PRIVILEGES ON FUNCTION app.current_user_id FROM member;
-- REVOKE ALL PRIVILEGES ON FUNCTION app.me FROM member;

-- DROP POLICY IF EXISTS delete_user ON app.users;
-- DROP POLICY IF EXISTS update_user ON app.users;
-- DROP POLICY IF EXISTS select_user ON app.users;

-- DROP TRIGGER IF EXISTS updatePassword ON app.users;

-- DROP FUNCTION IF EXISTS CREATE_ROLE(rolename TEXT);
-- DROP FUNCTION IF EXISTS current_user_id();
-- DROP FUNCTION IF EXISTS me(OUT id uuid, OUT email text, OUT role text);
-- DROP FUNCTION IF EXISTS SIGNUP(email TEXT, password TEXT);
-- DROP FUNCTION IF EXISTS SIGNIN(email TEXT, password TEXT);
-- DROP FUNCTION IF EXISTS app.updatePassword() CASCADE;

-- REVOKE ALL ON app.users FROM member;
-- REVOKE ALL PRIVILEGES ON app.users FROM admin;
-- REVOKE ALL PRIVILEGES ON app.users FROM member;
-- REVOKE ALL PRIVILEGES ON app.users FROM guest;

-- DROP TYPE app.jwt_token CASCADE;

-- DROP TABLE IF EXISTS app.users;

-- DROP EXTENSION IF EXISTS pgcrypto;
-- DROP EXTENSION IF EXISTS "uuid-ossp";

-- UP MIGRATION

CREATE SCHEMA IF NOT EXISTS app;   
SET search_path TO app, public;
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM public;

-- We need the crypto!

CREATE EXTENSION IF NOT EXISTS pgcrypto schema public;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" schema public;

-- Create 3 users roles = guest, member and admin.
-- We are going to use roles to grant or restrict access to all users of a role.

CREATE OR REPLACE FUNCTION CREATE_ROLE(rolename TEXT) RETURNS void AS
$$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE  rolname =  rolename) 
    THEN CREATE ROLE rolename WITH NOLOGIN;
  END IF;
END
$$ LANGUAGE plpgsql;

SELECT CREATE_ROLE('guest');
SELECT CREATE_ROLE('member');
SELECT CREATE_ROLE('admin');

-- Create a jwt_token type containing the user role and user_id

DO $$ BEGIN
    CREATE TYPE app.jwt_token AS (
    role TEXT,
    user_id UUID
  );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;


-- SCHEMA --

-- Create the users table.

CREATE TABLE app.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v1mc(),
  email text NOT NULL UNIQUE,
  password text NOT NULL,
  role text default 'member',
  aws_access_key_id VARCHAR(63),
  aws_secret_access_key VARCHAR(63),
  aws_bucket_name VARCHAR(63),
  aws_region_name VARCHAR(12),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- FUNCTIONS --

-- Create current_user_id() function that extracts the user_id from the current_setting 'session'.

CREATE OR REPLACE FUNCTION current_user_id() returns uuid as $$
  SELECT nullif(current_setting('jwt.claims.user_id', true), '')::uuid;
$$ language sql stable;

-- Create me() function to 

CREATE OR REPLACE FUNCTION me(OUT id uuid, OUT email text, OUT role text, OUT aws_bucket_name TEXT, OUT aws_region_name TEXT) returns RECORD as $$
  SELECT id,email, role, aws_bucket_name, aws_region_name FROM app.users WHERE id = nullif(current_setting('jwt.claims.user_id', true), '')::uuid;
$$ language sql stable;

CREATE OR REPLACE FUNCTION SIGNUP(email TEXT, password TEXT) RETURNS app.jwt_token AS
$$
DECLARE
  token_information app.jwt_token;
BEGIN
  INSERT INTO app.users (email, password) VALUES ($1, $2);
    SELECT role, id AS user_id
      INTO token_information
      FROM app.users
      WHERE users.email = $1;
      RETURN token_information::app.jwt_token;
END;
$$ LANGUAGE PLPGSQL VOLATILE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION SIGNIN(email TEXT, password TEXT) RETURNS app.jwt_token AS
$$
DECLARE
  token_information app.jwt_token;
BEGIN
  SELECT role, id AS user_id
    INTO token_information
    FROM app.users
    WHERE users.email = $1
      AND users.password = crypt($2, users.password);
    if token_information::app.jwt_token is null
    then
      RAISE EXCEPTION 'Invalid credentials.'; 
    else
      RETURN token_information::app.jwt_token;
    end if;
END;
$$ LANGUAGE PLPGSQL VOLATILE STRICT SECURITY DEFINER;

CREATE OR REPLACE FUNCTION app.updatePassword() RETURNS trigger AS
$$
BEGIN
  IF (TG_OP = 'INSERT' OR (NEW.password != OLD.password)) THEN
    NEW.password = crypt(NEW.password, gen_salt('md5'));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE PLPGSQL VOLATILE STRICT SECURITY DEFINER;

CREATE TRIGGER "updatePassword" BEFORE INSERT OR UPDATE ON app.users FOR EACH ROW EXECUTE PROCEDURE app.updatePassword();


-- ACCESS CONTROL --

-- Must alter the table to enable ROW LEVEL SECURITY!

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM public;

GRANT ALL ON app.users to member;
GRANT ALL ON app.users to admin;

GRANT USAGE ON SCHEMA app TO guest;
GRANT USAGE ON SCHEMA app TO member;
GRANT USAGE ON SCHEMA app TO admin;

GRANT EXECUTE ON FUNCTION SIGNUP(email TEXT, password TEXT) TO guest;
GRANT EXECUTE ON FUNCTION SIGNIN(email TEXT, password TEXT) TO guest;
GRANT EXECUTE ON FUNCTION current_user_id() TO member;
GRANT EXECUTE ON FUNCTION me() TO member;

-- GRANT ALL ON users to member;

CREATE POLICY select_user ON USERS using (id = current_setting('jwt.claims.user_id')::uuid);
CREATE POLICY update_user on users FOR UPDATE to member using (id = nullif(current_setting('jwt.claims.user_id', true), '')::uuid);
CREATE POLICY delete_user on users FOR DELETE to member using (id = nullif(current_setting('jwt.claims.user_id', true), '')::uuid);

CREATE TABLE app.stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v1mc(),
  sub VARCHAR(255),
  host VARCHAR(255) NOT NULL,
  status INTEGER NOT NULL DEFAULT 200,
  method VARCHAR(6) NOT NULL DEFAULT 'GET',
  type VARCHAR(255) NOT NULL,
  path text NOT NULL,
  query text,
  rt INTEGER NOT NULL,
  kb FLOAT NOT NULL,
  message text,
  ip cidr NOT NULL,
  ref TEXT,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE app.components (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v1mc(),
  name CHARACTER VARYING(255) NOT NULL UNIQUE,
  path text NOT NULL,
  template text NOT NULL,
  meta jsonb DEFAULT '{}',
  components jsonb DEFAULT '{}',
  props jsonb DEFAULT '{}',
  data jsonb DEFAULT '{}',
  computed jsonb DEFAULT '{}',
  styles jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);


CREATE OR REPLACE FUNCTION INSERT_COMPONENT(name TEXT, path TEXT, template TEXT) RETURNS SETOF app.components AS
$$
BEGIN
  RETURN QUERY
  INSERT INTO app.components (name, path, template) VALUES ($1, $2, $3)
   RETURNING *;
END;
$$ LANGUAGE PLPGSQL VOLATILE STRICT SECURITY DEFINER;
