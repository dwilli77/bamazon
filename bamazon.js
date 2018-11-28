require('dotenv').config();

const inquirer = require('inquirer');

const mysql = require('mysql');

let connection = mysql.createConnection(
    {
        host: process.env.host,
        port: process.env.port,
        user: process.env.user,
        password: process.env.password,
        database: process.env.database
    }
);

connection.connect(function(err){
    if (err) throw err;
    userType();
});

function userType(){
    inquirer.prompt([
        {
            name: "user",
            message: "Select your access:",
            type: "list",
            choices: ["customer", "manager", "supervisor"]
        }
    ]).then(answer => {
        switch(answer.user){
            case "customer":
                customer();
                break;
            case "manager":
                manager();
                break;
            case "supervisor":
                supervisor();
                break;
            default:
                console.log('error...');
        };
    })
}

function customer(){
    inquirer.prompt([
        {
            name: 'action',
            message: "What would you like to do?",
            type: 'list',
            choices: ['Buy something!', 'Quit']
        }
    ]).then(answer => {
        if (answer.action === "Quit"){
            console.log("Goodbye!");
            connection.end();
        }else{
            displayItemsForCust();
        };
    })
}

function customerPrompt(){
    inquirer.prompt([
        {
            name: 'itemId',
            message: 'What is the ID of the item you\'d like to buy?',
            type: 'input',
            validate: function (name){
                if (isNaN(parseInt(name))){
                    return false;
                }else if(parseInt(name) < 1){
                    return false;
                }else{
                    return true;
                };
            }
        },
        {
            name: 'quantity',
            message: "How many would you like to buy?",
            type: 'input',
            validate: function (name){
                if (isNaN(parseInt(name))){
                    return false;
                }else if(parseInt(name) < 1){
                    return false;
                }else{
                    return true;
                };
            }
        }
    ]).then(answer => {
        buyItem(answer.itemId, answer.quantity);
    })
}

function displayItemsForCust(){
    let query = "SELECT * FROM products";
    connection.query(query, function (err, res){
        if (err) throw err;
        console.log("===========================================================");
        for (let i = 0; i < res.length; i++){
            console.log(`ITEM ID: ${res[i].item_id}   | PRODUCT: ${res[i].product_name}  | PRICE: $${parseFloat(res[i].price).toFixed(2)}`);
            console.log("-------------------------------------------------------")
        }
        console.log("===========================================================");
        customerPrompt();
    });
}

function buyItem(id, quantity){
    let query = "SELECT * FROM products WHERE ?";
    connection.query(query, {item_id: id},function(err,res){
        if (err) throw err;
        if (res.length === 0){
            console.log("Invalid item selected");
            customer();
        }else{
            let itemsLeft = res[0].stock_quantity;
            if (itemsLeft < quantity){
                console.log("Not enough inventory to complete transaction");
                customer();
            }else{
                itemsLeft -= parseInt(quantity);
                let total = parseInt(quantity) * parseFloat(res[0].price).toFixed(2);
                console.log(`You bought ${quantity} ${res[0].product_name}(s) for $${total.toFixed(2)}`);
                let updateQuery = "UPDATE products SET ?, ? WHERE ?";
                connection.query(updateQuery, [{stock_quantity: itemsLeft}, {product_sales: total}, {item_id: id}], function(err,res){
                    if (err) throw err;
                    customer();
                });
            };
        };
    });
}

function manager(){
    inquirer.prompt([
        {
            name: 'password',
            message: 'Please provide your manager password:',
            type: 'password'
        }
    ]).then(answer => {
        if (answer.password === 'manager'){
            managerPrompt();
        }else{
            console.log('Invalid password');
            userType();
        };
    });
}

function managerPrompt(){
    inquirer.prompt([
        {
            name: 'action',
            message: "What would you like to do?",
            type: 'list',
            choices: ['View Products for Sale', 'View Low Inventory', 'Add to Inventory', 'Add New Product', 'Quit']
        }
    ]).then(answers => {
        switch(answers.action){
            case 'Quit':
                console.log("Goodbye!");
                connection.end();
                break;
            case 'View Products for Sale':
                displayItemsForManager();
                break;
            case 'View Low Inventory':
                viewLowInv();
                break;
            case 'Add to Inventory':
                addToInv();
                break;
            case 'Add New Product':
                addProduct();
                break;
            default:
                console.log('error...');
                break;
        };
    });
}

function displayItemsForManager(){
    let query = "SELECT * FROM products";
    connection.query(query, function (err, res){
        if (err) throw err;
        console.log("==============================================================");
        for (let i = 0; i < res.length; i++){
            console.log(`ID: ${res[i].item_id} | PRODUCT: ${res[i].product_name} | DEPT: ${res[i].department_name} | PRICE: $${parseFloat(res[i].price).toFixed(2)} | STOCK: ${res[i].stock_quantity}`);
            console.log("----------------------------------------------------------")
        }
        console.log("==============================================================");
        managerPrompt();
    });
}

function viewLowInv(){
    inquirer.prompt([
        {
            name: "num",
            message: "View items with less than __ units in inventory:",
            type: 'input',
            validate: function (name){
                if (isNaN(parseInt(name))){
                    return false;
                }else if(parseInt(name) < 0){
                    return false;
                }else{
                    return true;
                };
            }
        }
    ]).then(answer => {
        let query = "SELECT * FROM products WHERE stock_quantity < "+ parseInt(answer.num);
        connection.query(query, function(err,res){
            if (err) throw err;
            console.log("===========================================================");
            for (let i = 0; i < res.length; i++){
                console.log(`ITEM ID: ${res[i].item_id} | PRODUCT: ${res[i].product_name} | DEPT: ${res[i].department_name} | PRICE: $${parseFloat(res[i].price).toFixed(2)} | STOCK: ${res[i].stock_quantity}`);
            console.log("-------------------------------------------------------")
            };
            console.log("===========================================================");
            managerPrompt();
        });
    });
}

function addToInv(){
    inquirer.prompt([
        {
            name: 'item',
            message: "Which ID would you like to add inventory to? ",
            type: 'input',
            validate: function (name){
                if (isNaN(parseInt(name))){
                    return false;
                }else if(parseInt(name) < 1){
                    return false;
                }else{
                    return true;
                };
            }
        }
    ]).then(answers => {
        let query = 'SELECT stock_quantity FROM products WHERE ?';
        connection.query(query, {item_id: answers.item}, function(err, res){
            if (err) throw err;
            if (res.length === 0){
                console.log("Invalid item selected");
                managerPrompt();
            }else{
                let currentStock = res[0].stock_quantity;
                console.log(`# Items currently in inventory: ${currentStock}`);
                inquirer.prompt([
                    {
                        name: 'amount',
                        message: 'How many units would you like to add? ',
                        type: 'input',
                        validate: function (name){
                            if (isNaN(parseInt(name))){
                                return false;
                            }else if(parseInt(name) < 1){
                                return false;
                            }else{
                                return true;
                            };
                        }
                    }
                ]).then(answer => {
                    let totalStock = parseInt(answer.amount) + parseInt(currentStock);
                    let updateQuery = 'UPDATE products SET ? WHERE ?';
                    connection.query(updateQuery, [{stock_quantity: totalStock}, {item_id: answers.item}], function(err, res){
                        if (err) throw err;
                        console.log(`Stock quantity updated to ${totalStock} for item id # ${answers.item}`);
                        managerPrompt();
                    });
                });
            };
        });
    });
}

function addProduct(){
    inquirer.prompt([
        {
            name: 'product_name',
            message: '\n-----------------------\nAdd New Product\n-----------------------\n\n Product Name: ',
            type: 'input'
        },
        {
            name: 'department_name',
            message: 'Department: ',
            type: 'list',
            choices: ['food', 'clothing', 'electronics']
        },
        {
            name: 'price',
            message: 'Price per Unit: ',
            type: 'input',
            validate: function (name){
                if (isNaN(parseInt(name))){
                    return false;
                }else if(parseInt(name) < 0){
                    return false;
                }else{
                    return true;
                };
            }
        },
        {
            name: 'stock_quantity',
            message: 'Stock Quantity #: ',
            type: 'input',
            validate: function (name){
                if (isNaN(parseInt(name))){
                    return false;
                }else if(parseInt(name) < 1){
                    return false;
                }else{
                    return true;
                };
            }
        }
    ]).then(answers => {
        let query = 'INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES ("'+answers.product_name+'", "'+answers.department_name+'", '+parseFloat(answers.price).toFixed(2)+', '+parseInt(answers.stock_quantity)+')';
        connection.query(query, function(err,res){
            if (err) throw err;
            console.log('Product Sucessfully Added!');
            managerPrompt();
        });
    });
}

