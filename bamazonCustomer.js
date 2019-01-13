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
  showProducts();
});

function showProducts() {
  console.log('Displaying all products...\n');
  connection.query('SELECT item_id, product_name, price FROM products', function (err, res) {
    console.table(res);
    var itemIDArray = [];
    for (var i = 0; i < res.length; i++) {
      itemIDArray.push('' + res[i].item_id);
    }
    askUser(itemIDArray);
  })
}

function askUser(itemIDArray) {
  inquirer.prompt([
    {
      name: "itemID",
      type: "input",
      message: "Enter the product ID you would like to buy:",
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
      name: 'numberOfItems',
      type: 'input',
      message: 'How many units of this product would you like to buy?'
    }
  ])
    .then(function (answer) {
      var itemSelected = answer.itemID;
      var unitsSelected = answer.numberOfItems;

      checkStock(itemSelected, unitsSelected, itemIDArray);
    });
}

function checkStock(item, units, array) {
  console.log('Checking stock units...');
  connection.query('SELECT stock_quantity, price FROM products WHERE ?', { item_id: item }, function (err, res) {
    var stock = res[0].stock_quantity;
    var price = res[0].price;
    if (stock < units) {
      console.log('Insufficient quantity. Order cannot be processed, try again.');
      askUser(array);
    }
    else {
      var updatedStock = stock - units;
      connection.query('UPDATE products SET ? WHERE ?', [{ stock_quantity: updatedStock }, { item_id: item }], function (err, res) {
        var total = price * units;
        connection.query('SELECT product_sales FROM products WHERE ?', {item_id: item}, function (err, res) {
          var sales = res[0].product_sales;
          sales += total;
          connection.query('UPDATE products SET ? WHERE ?', [{product_sales: sales}, {item_id: item}], function(err, res) {
            console.log('Order complete.\nYour order total is: ' + total);
            connection.end();
          })
        });
      });
    }
  })
}
