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
            setTimeout(customerPrompt, 100);
        };
    })
}

function customerPrompt(){
    // displayItems();
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
        setTimeout(customer, 200);
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
    });
}

function buyItem(id, quantity){
    let query = "SELECT * FROM products WHERE ?";
    connection.query(query, {item_id: id},function(err,res){
        if (err) throw err;
        if (res.length === 0){
            console.log("Invalid item selected");
        }else{
            let itemsLeft = res[0].stock_quantity;
            if (itemsLeft < quantity){
                console.log("Not enough inventory to complete transaction");
            }else{
                itemsLeft -= parseInt(quantity);
                let total = parseInt(quantity) * parseFloat(res[0].price).toFixed(2);
                console.log(`You bought ${quantity} ${res[0].product_name}(s) for $${total.toFixed(2)}`);
                let updateQuery = "UPDATE products SET ?, ? WHERE ?";
                connection.query(updateQuery, [{stock_quantity: itemsLeft}, {product_sales: total}, {item_id: id}], function(err,res){
                    if (err) throw err;
                });
            };
        };
    });
}

