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
    (gen_random_uuid(), 'Graphics Card', floor(random() * 30 + 10)::int),
    (gen_random_uuid(), 'Gaming Chair', floor(random() * 50 + 15)::int),
    (gen_random_uuid(), 'Mechanical Keyboard', floor(random() * 100 + 20)::int),
    (gen_random_uuid(), 'Wireless Headset', floor(random() * 40 + 10)::int),
    (gen_random_uuid(), 'External SSD 1TB', floor(random() * 60 + 25)::int),
    (gen_random_uuid(), 'Curved Monitor 27"', floor(random() * 25 + 5)::int);

