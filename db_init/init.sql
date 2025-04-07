-- Deletar tabelas antigas
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS pages CASCADE;
DROP TABLE IF EXISTS items CASCADE;
DROP TABLE IF EXISTS page_items CASCADE;

-- Criar a tabela de usuários
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    picture_url VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    auth_provider VARCHAR(50) NOT NULL,
    external_provider_id VARCHAR(255),
    password_hash VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_auth_provider CHECK (auth_provider IN ('local', 'google', 'temp')),
    CONSTRAINT check_role CHECK (role IN ('user', 'admin'))
);

-- Criar a tabela de páginas
CREATE TABLE pages (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    domain VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'building',
    title TEXT,
    description TEXT,
    picture_url TEXT,
    publish_id VARCHAR(255),
    published_at TIMESTAMP,
    published_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_status CHECK (status IN ('building', 'published', 'overdue')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Criar a tabela de itens
CREATE TABLE items (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    page_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    payment_form VARCHAR(255) CHECK (payment_form IN ('pix', 'purchase-link', 'other', NULL)),
    payment_info VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Criar função para atualizar o campo updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar triggers para atualizar updated_at automaticamente nas tabelas
CREATE TRIGGER trigger_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trigger_pages_updated_at
BEFORE UPDATE ON pages
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trigger_items_updated_at
BEFORE UPDATE ON items
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trigger_page_items_updated_at
BEFORE UPDATE ON page_items
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();