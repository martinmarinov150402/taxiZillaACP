const http = require("http");
const fs = require('fs');
const mysql = require("mysql");
const { PassThrough } = require("stream");
const { parse } = require("querystring");
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const bcrypt = require("bcrypt");
const cryptr = require("cryptr");


const encrypter = new cryptr("pty469e33GnPq9B957aJEcLyFfc9q5");
let db = mysql.createConnection({
    host: "localhost",
    user: "taxiZilla",
    password: "VhCNrHnMEB3sE?9_",
    database: "taxiZilla",
})
db.query("SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'adminTokens';", function (err,result) {
    console.log("Result: "+result);
    if(result=="")
    {
        db.query("CREATE TABLE adminTokens (name VARCHAR(30), surname VARCHAR(30), token VARCHAR(100))", function (err,result)
        {
            if (err) throw err;
            console.log("Created table for Admin Tokens");
            
        });
    }
});
const urlencodedParser = bodyParser.urlencoded({extended:false});
app.get("/",function (req,res)
{
    res.writeHead(200,{'content-type': 'text/html'})
    fs.createReadStream('index.html').pipe(res);
});
app.get("/acpMain", async function(req, res)
{
    console.log("Header: "+ req.headers.authorization);
    if(!req.headers.authorization)
    {
        res.writeHead(200,{'content-type':'text/html'});
        return fs.createReadStream('index.html').pipe(res); 
        
    }  
    else
    {
        let token = req.headers.authorization;
        console.log("Token: "+token);
        let data;
        try
        {
            data = await encrypter.decrypt(token);
            console.log(data);
        }
        catch(ex)
        {
            res.writeHead(200,{'content-type':'text/html'});
            fs.createReadStream('index.html').pipe(res); 
        }

    } 
    res.writeHead(200,{'content-type':'text/html'});
    fs.createReadStream('acpMain.html').pipe(res);    
});
app.post("/getInfoFromAuthToken",urlencodedParser,async function (req,res)
{
    const token = req.body.token;
    let data;
    try
    {
        data = await encrypter.decrypt(token);
        console.log("Ko prashta tui: "+JSON.parse(data));
        res.send(data);
    }
    catch(ex)
    {
        res.send("No Information");
    }
});
app.post("/validateToken",urlencodedParser,async function (req,res)
{
    console.log(req.body);
    db.query("SELECT * FROM adminTokens WHERE token = "+mysql.escape(req.body.token)+";", async function(err,result){
        console.log(Object.values(JSON.parse(JSON.stringify(result))));
        let resData = Object.values(JSON.parse(JSON.stringify(result)));
        if(resData.length==0)
        {
            res.send("false");
        }
        else
        {
            delete resData[0].token;
            let encrypted = await encrypter.encrypt(resData[0]);
            res.send(encrypted);
        }
    });
});
app.listen(3000, () =>
{
    console.log("Admin server started");
});
//server.listen(3000);
// ZC11484-YP17-EEGU 