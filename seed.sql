USE employeeDB;

INSERT INTO department (department)
VALUES ('Sales'), ('Engineering'), ('Finance'), ('Legal');

INSERT INTO roles (title, salary, department_id)
VALUES 
    ('Sales Lead', 100000, 1),
    ('Salesperson', 80000, 1),
    ('Lead Engineer', 150000, 2),
    ('Software Engineer', 120000, 2),
    ('Accountant', 1250000, 3),
    ('Legal Team Lead', 2500000, 4),
    ('Lawyer', 190000, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
    ('Mickey', 'Mouse', 1, NULL),
    ('Minnie', 'Mouse', 2, 1),
    ('Donald', 'Duck', 3, NULL),
    ('Daisy', 'Duck', 4, 3),
    ('Goofy', 'Goof', 5, NULL),
    ('Max', 'Goof', 6, 5),
    ('Peter', 'Pete', 7, NULL),
    ('P.J.', 'Pete', 8, 7);