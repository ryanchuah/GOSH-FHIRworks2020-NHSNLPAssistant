"use strict";
const express = require("express");
const router = express.Router();

const { WebhookClient } = require("dialogflow-fulfillment");
process.env.DEBUG = "dialogflow:debug"; // enables lib debugging statements
const fs = require("fs");
const path = require("path");
const Fuse = require("fuse.js");

router.post("/", (request, response) => {
    try {
        var agent = new WebhookClient({ request, response });
    } catch (err) {
        console.log("===AGENT ERROR===");
        console.log(err);
    }

    function handleSearchPatient(agent) {
        const parameters = request.body.queryResult.parameters;
        console.log(parameters);

        var patients = JSON.parse(
            fs.readFileSync(
                path.join(
                    __dirname,
                    "../",
                    "../",
                    "resources",
                    "patients.json"
                ),
                "utf8"
            )
        );

        var tempPatients = [];
        // extract every entry from every bundle then store in tempPatients
        for (let i = 0; i < patients.length; i++) {
            for (let j = 0; j < patients[i].entry.length; j++) {
                tempPatients.push(patients[i].entry[j]);
            }
        }
        patients = tempPatients;

        // filters to filter patients by
        const filterGender = patient =>
            parameters.gender === ""
                ? true  
                : patient.resource.gender === parameters.gender;

        const filterDate = patient =>
            parameters.date === ""
                ? true
                : patient.resource.birthDate ===
                  parameters.date.substring(0, 10);

        const filterLanguage = patient =>
            parameters.language === ""
                ? true
                : patient.resource.communication.some(commObj =>
                      commObj.language.coding.some(
                          codingObj => codingObj.display === parameters.language
                      )
                  );

        const filterCountry = patient =>
            parameters["geo-country-code"] === {}
                ? true
                : patient.resource.address.some(
                      addressObj =>
                          addressObj.country ===
                          parameters["geo-country-code"]["alpha-2"]
                  );

        const filterState = patient =>
            parameters["geo-state"] === ""
                ? true
                : patient.resource.address.some(
                      addressObj => addressObj.state === parameters["geo-state"]
                  );

        const filterCity = patient =>
            parameters["geo-city"] === ""
                ? true
                : patient.resource.address.some(
                      addressObj => addressObj.city === parameters["geo-city"]
                  );

        const filters = [
            filterGender,
            filterDate,
            filterLanguage,
            filterCountry,
            filterState,
            filterCity
        ];

        var result = filters
            .reduce( // apply filters
                (reducedData, currFilter) => reducedData.filter(currFilter),
                patients
            )
            .map(patient => {
                // append a user's full name or name field
                // this makes fuzzy search easier
                const newName = patient.resource.name.map(name => {
                    var givenNames = name.given.join(" ");
                    var familyName = name.family;
                    return {
                        ...name,
                        full: givenNames.concat(" ", familyName)
                    };
                });
                patient.resource.name = newName;
                return patient;
            });

        if (result.length > 1) {
            //perform fuzzy search on result

            var options = {
                shouldSort: true,
                threshold: 1,
                location: 0,
                distance: 100,
                maxPatternLength: 32,
                minMatchCharLength: 1,
                keys: ["resource.name.full"]
            };

            var fuse = new Fuse(result, options); 
            result = fuse.search(parameters.person.name);
        }
        
        if (result[0]) {
            agent.add(
                "The person found is " +
                    result[0].resource.name[0].full +
                    " " +
                    JSON.stringify(result[0])
            );
        } else {
            agent.add("There is no matching patient");
        }
    }

    // Run the proper function handler based on the matched Dialogflow intent name
    let intentMap = new Map();
    intentMap.set("Search Patient", handleSearchPatient);

    agent.handleRequest(intentMap);
});

module.exports = router;
