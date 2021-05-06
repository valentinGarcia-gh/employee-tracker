-- Drops the employee database if it is already been created
DROP DATABASE IF EXISTS employeeDB;

-- Creates the employee database
CREATE DATABASE employeeDB;

-- Targets the employee database to use
USE employeeDB;

-- Creates the department table and defines the columns, sets primary key
CREATE TABLE department (
id INT NOT NULL AUTO_INCREMENT,
department VARCHAR(30) UNIQUE NOT NULL,
PRIMARY KEY (id)
);

-- Creates roles table, defines columns, sets foreign and primary keys
CREATE TABLE roles (
id INT NOT NULL AUTO_INCREMENT,
title VARCHAR(30) NOT NULL,
salary DECIMAL(10,0) NOT NULL,
department_id INT NOT NULL,
PRIMARY KEY (id),
FOREIGN KEY (department_id) REFERENCES department(id)
);

-- Creates employee table, defines columns, sets foreign and primary keys
CREATE TABLE employee (
id INT NOT NULL AUTO_INCREMENT,
first_name VARCHAR(30) NOT NULL,
last_name VARCHAR(30) NOT NULL,
role_id INT NOT NULL,
manager_id INT NULL,
PRIMARY KEY (id),
FOREIGN KEY (role_id) REFERENCES roles(id),
FOREIGN KEY (manager_id) REFERENCES employee(id)
);