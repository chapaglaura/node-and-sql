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
  askManager();
});


function askManager() {
  inquirer.prompt({
    name: "menuOptions",
    type: "rawlist",
    message: "Choose an option:",
    choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"]
  })
    .then(function (answer) {
      switch (answer.menuOptions) {
        case 'View Products for Sale':
          showProducts();
          break;

        case 'View Low Inventory':
          showLowInventory();
          break;

        case 'Add to Inventory':
          addToInventory();
          break;

        case 'Add New Product':
          addProduct();
          break;
      }
    });
}

function showProducts() {
  console.log('Displaying all products...\n');
  connection.query('SELECT item_id, product_name, price, stock_quantity FROM products', function (err, res) {
    console.table(res);
    askManager();
  });
}

function showLowInventory() {
  console.log('Displaying low inventory items...');
  connection.query('SELECT * FROM products WHERE stock_quantity < 5', function (err, res) {
    console.table(res);
    askManager();
  });
}

function addToInventory() {
  console.log('Adding to inventory...');
  connection.query('SELECT item_id, product_name, price, stock_quantity FROM products', function (err, res) {
    var itemIDArray = [];
    console.log(res[0].item_id);
    for (var i = 0; i < res.length; i++) {
      itemIDArray.push('' + res[i].item_id);
    }
    console.table(res);

    inquirer.prompt([
      {
        name: 'itemID',
        type: 'input',
        message: 'Enter the product ID you would like to add inventory to:',
        validate: function (userInput) {
          if (itemIDArray.indexOf(userInput) === -1) {
            console.log('\nItem ID does not have a match.')
            return false;
          }
          else
            return true;
        }
      },
      {
        name: 'addedUnits',
        type: 'input',
        message: 'How many units would you like to add?'
      }
    ]).then(function (answer) {
      var itemSelected = answer.itemID;
      var unitsToAdd = answer.addedUnits;

      addUnits(itemSelected, unitsToAdd);
    })
  })
}

function addUnits(item, units) {
  connection.query('SELECT stock_quantity FROM products WHERE ?', { item_id: item }, function (err, res) {
    var stock = res[0].stock_quantity;
    var updatedStock = stock + parseInt(units);

    console.log(stock, updatedStock);
    connection.query('UPDATE products SET ? WHERE ?', [{ stock_quantity: updatedStock }, { item_id: item }], function (err, res) {
      console.log('Stock quantity updated.');
      askManager();
    })
  })
}

function addProduct() {
  console.log('Adding new product...');
  connection.query('SELECT item_id FROM products', function (err, res) {
    var itemIDArray = [];
    for (var i = 0; i < res.length; i++) {
      itemIDArray.push('' + res[i].item_id);
    }

    inquirer.prompt([
      {
        name: 'itemID',
        type: 'input',
        message: 'Product ID:',
        validate: function(userInput) {
          if (itemIDArray.indexOf(userInput) === -1) {
            return true;
          }
          else {
            console.log('\nItem ID already exists.');
            return false;
          }
        }
      },
      {
        name: 'productName',
        type: 'input',
        message: 'Product Name:'
      },
      {
        name: 'departmentName',
        type: 'input',
        message: 'Department Name:'
      },
      {
        name: 'price',
        type: 'input',
        message: 'Price:'
      },
      {
        name: 'stockQuantity',
        type: 'input',
        message: 'Stock Quantity:'
      }
    ]).then(function (answer) {
      var id = answer.itemID;
      var name = answer.productName;
      var department = answer.departmentName;
      var price = answer.price;
      var stock = answer.stockQuantity;

      connection.query('INSERT INTO products SET ?', { item_id: id, product_name: name, department_name: department, price: price, stock_quantity: stock }, function (err, res) {
        askManager();
      });
    });
  });
}
