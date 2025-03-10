CREATE TABLE orders (
    id UUID PRIMARY KEY,
    customer_name VARCHAR(200) NOT NULL,
    order_date TIMESTAMP NOT NULL,
    positions UUID[] DEFAULT '{}'
);

CREATE TABLE products (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    stock_quantity INTEGER NOT NULL CHECK (stock_quantity >= 0)
);

CREATE TABLE positions (
    id UUID PRIMARY KEY,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    order_id UUID REFERENCES orders ON DELETE CASCADE,
    product_id UUID REFERENCES products
);

INSERT INTO products (id, name, stock_quantity) VALUES
    (gen_random_uuid(), 'Laptop', floor(random() * 50 + 20)::int),
    (gen_random_uuid(), 'Smartphone', floor(random() * 100 + 50)::int),
    (gen_random_uuid(), 'Tablet', floor(random() * 30 + 15)::int),
    (gen_random_uuid(), 'Monitor', floor(random() * 40 + 10)::int),
    (gen_random_uuid(), 'Keyboard', floor(random() * 200 + 100)::int),
    (gen_random_uuid(), 'Mouse', floor(random() * 300 + 150)::int);
