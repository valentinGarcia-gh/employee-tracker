// package dependencies 
const mysql = require("mysql");
const inquirer = require("inquirer");

// creates the db connection
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "employeeDB"
});

// starts the app
function mainMenu() {
    inquirer.prompt({
        name: "answers",
        type: "list",
        message: "Please choose an option below:",
        choices:
            [
                "Add Employee",
                "Add Department",
                "Add Role",
                "View All Employees",
                "View Roles",
                "View Departments",
                "Remove Employee",
                "Quit"
            ]
    })
        .then((response) => {
            switch (response.answers) {
                case "Add Employee":
                    addEmployee();
                    break;
                case "Add Department":
                    addDepartment();
                    break;
                case "Add Role":
                    addRole();
                    break;
                case "View All Employees":
                    viewEmps();
                    break;
                case "View Roles":
                    viewRoles();
                    break;
                case "View Departments":
                    viewDepts();
                    break;
                case "Remove Employee":
                    removeEmployee();
                    break;
                case "Quit":
                    connection.end();
                    break;
            }
        });
}

function addEmployee() {
    let managerId = 0;
    connection.query("select manager_id from employee;", function (err, res) {
        if (err) throw (err);
        for (let i = 0; i < res.length; i++) {
            if (res[i].manager_id != null && managerId < res[i].manager_id) {
                managerId = res[i].manager_id;
            }
        }
    });
    let roles = [];
    connection.query("select title from roles;", function (err, res) {
        if (err) throw (err);
        for (let i = 0; i < res.length; i++) {
            roles.push(res[i].title);
        }
    });
    // asks user for new hire info
    inquirer.prompt([
        {
            name: "first_name",
            type: "input",
            message: "Please enter the first name of the new hire.",
        },
        {
            name: "last_name",
            type: "input",
            message: "Please enter the last name of the new hire.",
        },
        {
            name: "role",
            type: "list",
            message: "What is the new hire's position?",
            choices: roles,
        },
        {
            name: "manager",
            type: "list",
            message: "Is the new hire a manager?",
            choices: ["No", "Yes"],
        }])
        .then((response) => {
            let roleId;
            connection.query("SELECT id, title FROM roles;", function (err, res) {
                if (err) throw (err);
                for (let i = 0; i < res.length; i++) {
                    if (res[i].title == response.role) {
                        roleId = res[i].id;
                    }
                }
                if (response.manager == "Yes") {
                    managerId++;
                    response.manager = managerId;
                } else {
                    response.manager = null;
                }
                connection.query("INSERT INTO employee SET ?",
                    {
                        first_name: response.first_name,
                        last_name: response.last_name,
                        role_id: roleId,
                        manager_id: response.manager,
                    },
                    function (err, res) {
                        if (err) throw (err);
                        console.log(`Added ${response.first_name}${" "}${response.last_name}!`);
                        mainMenu();
                    }
                );
            });
        });
}

function addDepartment() {
    inquirer.prompt(
        {
            name: "newDepartment",
            type: "input",
            message: "What is the new department you want to add?",
        })
        .then((response) => {
            connection.query("insert into department set ?",
                {
                    department: response.newDepartment,
                },
                function (err, res) {
                    if (err) throw (err);
                });
            console.log(`You have successfully added ${response.newDepartment}.`);
            mainMenu();
        });
}

function addRole() {
    let departments = [];
    connection.query("SELECT department FROM department;", function (err, res) {
        if (err) throw err;
        for (let i = 0; i < res.length; i++) {
            departments.push(res[i].department);
        }
        inquirer.prompt([
            {
                name: "deptId",
                type: "list",
                message: "What department will this role be in?",
                choices: departments,
            },
            {
                name: "newRole",
                type: "input",
                message: "What is the name of the new role you would like to add?",
            },
            {
                name: "salary",
                type: "input",
                message: "What is the salary for this new role?",
            },
        ])
            .then((response) => {
                connection.query(`SELECT id, department FROM department;`, function (err, res) {
                    if (err) throw err;
                    res.forEach((department) => {
                        if (department.department == response.deptId) {
                            response.deptId = department.id;
                        }
                    });
                    // creates a new role in db
                    connection.query(`INSERT INTO roles SET ?`,
                        {
                            title: response.newRole,
                            salary: response.salary,
                            department_id: response.deptId,
                        },
                        function (err, res) {
                            if (err) throw err;
                        }
                    );
                    console.log(`Successfully added ${response.newRole}!`);
                    mainMenu();
                });
            });
    });
}

function viewEmps() {
    connection.query(
        `SELECT employee.id, employee.first_name, employee.last_name, roles.title, department.department, roles.salary, employee.manager_id
         FROM employee INNER JOIN roles ON employee.role_id=roles.id INNER JOIN department ON department.id=roles.department_id
         ORDER BY employee.id asc;`,
        function (err, res) {
            if (err) throw err;
            console.table(res);
            mainMenu();
        }
    );
}

function viewDepts() {
    connection.query(`select * from department order by id asc;`,
        function (err, res) {
            if (err) throw err;
            console.table(res);
        });
    mainMenu();
}

function viewRoles() {
    connection.query(`select * from roles`,
        function (err, res) {
            if (err) throw err;
            console.table(res);
        });
    mainMenu();
}

function removeEmployee() {
    connection.query("SELECT id, concat(first_name, ' ', last_name) fullName FROM employee",
        function (err, res) {
            if (err) throw err;
            let employees = res.map((employee) => employee.fullName);
        inquirer.prompt({
            name: "employeeChoice",
            type: "list",
            message: "Which employee would you like to remove?",
            choices: employees,
        })
            .then((response) => {
                connection.query(
                    `delete from employee 
                      where id and concat(first_name, ' ', last_name) ="${response.employeeChoice}"`,
                    function (err, res) {
                        if (err) throw err;
                        console.log(`${response.employeeChoice} has been removed`);
                        mainMenu();
                    }
                );
            });
    }
    );
}

connection.connect(function (err) {
    if (err) throw (err);
    mainMenu();
});