"use strict";
const express = require("express");
const router = express.Router();

var fs = require("fs");
var path = require("path")

router.get("/", (req, res) => {
    console.log("GET Patients.js");
    
    var obj;
    fs.readFile(path.join(__dirname, "../", "../", "resources", "patients.json"), "utf8", function(err, data) {
        if (err) throw err;
        try {
            obj = JSON.parse(data);
            res.json(obj)
            
        } catch (e) {
            console.error(e);
        }
    });
});

module.exports = router