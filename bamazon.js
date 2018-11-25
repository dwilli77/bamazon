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
    displayItems();
}

function displayItems(){
    let query = "SELECT * FROM products";
    connection.query(query, function (err, res){
        if (err) throw err;
        console.log(res);
    });
}