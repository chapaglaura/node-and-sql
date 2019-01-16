var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "udjrjmtt",
    database: "bamazon"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log('Connection OK.');
    askSupervisor();
});


function askSupervisor() {
    inquirer.prompt({
        name: "menuOptions",
        type: "rawlist",
        message: "Choose an option:",
        choices: ["View Product Sales by Department", "Create New Department"]
    })
        .then(function (answer) {
            switch (answer.menuOptions) {
                case 'View Product Sales by Department':
                    salesByDepartment();
                    break;

                case 'Create New Department':
                    createDepartment();
                    break;
            }
        });
}

function salesByDepartment() {
    connection.query('SELECT * FROM departments', function (err, res) {
        console.log('Displaying all departments...');
        var r = [...res];
        connection.query('SELECT product_sales FROM products', function(err, res) {
            for (var i = 0; i < r.length; i++) {
                r[i].product_sales = res[i].product_sales;
                r[i].total_profit = r[i].product_sales - r[i].over_head_costs ;

            }

            console.table(r);
        });
        connection.end();
    });
}
