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
                "View Employees by Role",
                "View Employees by Department",
                "Update Employee Role",
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
            case "View Employees by Role":
                viewRoles();
                break;
            case "View Employees by Department":
                viewDepts();
                break;
            case "Update Employee Role":
                updateRoles();
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
    let managerid = 0;
    connection.query("Select manager_id from employee;", function (err, res) {
        if (err) throw (err);
        for (let i = 0; i < res.length; i++) {
            if (res[i].managerid != null && managerid < res[i].managerid) {
                managerid = res[i].managerid;
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
            departments.push(res[i].name);
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
                //   change the department name to the department id
                connection.query(`SELECT id, department FROM department;`, function (
                    err,
                    res
                ) {
                    if (err) throw err;
                    res.forEach((department) => {
                        if (department.department == response.deptId) {
                            response.deptId = department.id;
                        }
                    });
                    // creates a new role in db
                    connection.query(`INSERT INTO role SET ?`,
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
         FROM employee INNER JOIN roles ON employee.role_id=roles.id INNER JOIN department ON department.id=roles.department_id;`,
        function (err, res) {
            if (err) throw err;
            // console.table(res);
            console.table(res);
            mainMenu();
        }
    );
}

function viewDepts() {
    let departments = [];
    // get all the names of the departments and store them in an array
    connection.query("select department from department;", function (err, res) {
        if (err) throw (err);
        for (let i = 0; i < res.length; i++) {
            departments.push(res[i].name);
        }
        // Ask the user which department
        inquirer.prompt({
            name: "department",
            type: "list",
            message: "Which department would you like to view?",
            choices: departments,
            })
            .then((response) => {
                connection.query(
                    `select employee.id, employee.first_name, employee.last_name, roles.title, department.department, roles.salary, 
                      concat(employee2.first_name, " ", employee2.last_name) manager 
                      FROM employee 
                      left join role ON employee.role_id=roles.id 
                      left join department ON department.id=roles.department_id 
                      left join employee employee2 ON employee.id=employee2.manager_id 
                      where name=?`,
                    response.department,
                    function (err, res) {
                        if (err) throw err;
                        // console.table(res);
                        console.table(res);
                        mainMenu();
                    }
                );
            });
    });
}

function viewRoles() {
    // get all of the role names and push them into an array
    let roles = [];
    connection.query("select title from roles;", function (err, res) {
        if (err) throw err;
        for (let i = 0; i < res.length; i++) {
            roles.push(res[i].title);
        }
        // Ask the user which role
        inquirer.prompt({
            name: "role",
            type: "list",
            message: "Which roles do you want to see?",
            choices: roles,
        })
            .then((response) => {
                connection.query(
                    `select employee.id, employee.first_name, employee.last_name, roles.title, department.department, roles.salary, 
                      concat(employee2.first_name, " ", employee2.last_name) manager FROM employee 
                      left join roles ON employee.role_id=roles.id 
                      left join department ON department.id=roles.department_id 
                      left join employee employee2 ON employee.id=employee2.manager_id 
                      where title=?`,
                    response.role,
                    function (err, res) {
                        if (err) throw err;
                        // console.table(res);
                        console.table(res);
                        mainMenu();
                    }
                );
            });
    });
}

function updateRoles() {
    connection.query("select id, concat(first_name, ' ', last_name) fullName from employee",
        function (err, results2) {
            if (err) throw err;
            let employees = results2.map((employee) => employee.id + " " + employee.fullName);

            inquirer.prompt({
                name: "employeeChoice",
                type: "list",
                message: "Which employee would you like to change?",
                choices: employees,
            })
                .then((response) => {
                    let employeeId = response.employeeChoice.split(" ")[0];
                    connection.query("SELECT id, title FROM roles;", function (err, res) {
                        if (err) throw err;
                        // loop through roles and push into array
                        let roles = res.map((roles) => roles.id + " " + roles.title);
                        inquirer.prompt({
                            name: "newRole",
                            type: "list",
                            message: "What is their new role?",
                            choices: roles,
                        })
                            .then((response2) => {
                                connection.query(`UPDATE employee SET role_id=${response2.newrole.split(" ")[0]} WHERE employee.id=${employeeId}`,
                                    function (err, res) {
                                        if (err) throw err;
                                    });
                                console.log("Roles have been update successfully!");
                                mainMenu();
                            });
                    });
                });
        });
}

function removeEmployee() {
    console.log("working");
    connection.query(
        "SELECT concat(first_name, ' ', last_name) fullName FROM employee",
        function (err, results3) {
            if (err) throw err;
            let employees = results3.map((employee) => employee.fullName);
            inquirer.prompt({
                name: "employeeChoice",
                type: "list",
                message: "Which employee would you like to remove?",
                choices: employees,
                })
                .then((response) => {
                    connection.query(
                        `delete from employee 
                         where concat(first_name, ' ', last_name) ="${response.employeeChoice}"`,
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