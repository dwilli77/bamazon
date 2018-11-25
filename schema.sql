DROP DATABASE IF EXISTS bamazon_DB;

CREATE DATABASE bamazon_DB;

USE bamazon_DB;

CREATE TABLE products (
	item_id INTEGER AUTO_INCREMENT NOT NULL,
    product_name VARCHAR(50) NOT NULL,
    department_name VARCHAR(50) NOT NULL,
    price DECIMAL(7,2) NOT NULL,
    stock_quantity INTEGER NOT NULL,
    product_sales DECIMAL(7,2) DEFAULT 0,
    PRIMARY KEY (item_id)
);

INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES
	("coffee", "food", 6.99, 100),
    ("bread", "food", 3.50, 75),
    ("taco", "food", 1.25, 50),
    ("shirt", "clothing", 19.99, 30),
    ("pants", "clothing", 25.00, 15),
    ("socks", "clothing", 4.95, 45),
    ("laptop", "electronics", 1599.95, 10),
    ("desktop", "electronics", 1250.30, 4),
    ("tv", "electronics", 900.00, 6);

CREATE TABLE departments (
	department_id INTEGER AUTO_INCREMENT NOT NULL,
    department_name VARCHAR(50) NOT NULL,
    over_head_costs INTEGER NOT NULL,
    PRIMARY KEY (department_id)
);

INSERT INTO departments (department_name, over_head_costs) VALUES
	("food", 1500),
    ("clothing", 1000),
    ("electronics", 3000);

SELECT * FROM products;

SELECT * FROM departments;