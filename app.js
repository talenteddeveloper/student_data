// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const {schoolModel} = require('../student_data/models/schoolModel');
const {studentModel} = require('../student_data/models/studentModel');
const axios = require('axios');

// Create an Express application
const app = express();
// Set the port number for the server to listen on
const PORT = 3100;
// Use the body-parser middleware to parse incoming request bodies
app.use(bodyParser.json());

// Set the MongoDB connection URL
const dbUrl = "mongodb://localhost:27017/student_data";
// Connect to the MongoDB database using mongoose
mongoose.connect(dbUrl);

// Define a GET route at the root path that sends a welcome message
app.get('/', (req, res) => {
    res.send('Welcome to Student Data Application');
});

// Define a POST route at /registerSchool that allows users to register a school
app.post('/registerSchool', async (req, res) => {
    // Get the data from the request body
    let data = req.body;
    // Get the current number of schools in the database
    const index = await  schoolModel.find().count();
    // Create a new school document using the data from the request body
    const schoolDetails = new schoolModel({
        schoolName: data.schoolName,
        schoolId: index+ 1,
    });
    // Save the new school document to the database
    let schoolData = await schoolDetails.save();

    // Send back the saved school data in the response
    res.send({
        result:schoolData
    });
});


// Define a POST route at /addWebhookEvent that allows users to add a webhook event to a school
app.post('/addWebhookEvent', async (req, res) => {
    // Get the data from the request body
    let data = req.body;
    // Find the school document with the given schoolId
    let schoolDetails = await  schoolModel.findOne({"schoolId": data.schoolId});
    // Check if the school was found
    if(schoolDetails){
        // Check if the webhookDetails property is null
        if(schoolDetails.webhookDetails == null){
            // If it is, initialize it as an empty array
            schoolDetails.webhookDetails =[];
        }
        // Add the new webhook event to the webhookDetails array
        schoolDetails.webhookDetails.push({
            eventName: data.eventName,
            endpointUrl: data.endpointUrl
        });

        // Update the school document in the database with the new webhook event
        schoolDetails = await schoolModel.findOneAndUpdate(
            {"schoolId": schoolDetails.schoolId}, schoolDetails,{
                returnOriginal: false
            })
    }else
    {
        // If the school was not found, log a message to the console
        console.log(" NO school")
    }

    // Send back the updated school data in the response
    res.send({
        result:schoolDetails
    });
});

// Define a POST route at /addStudent that allows users to add a student to a school
app.post('/addStudent', async (req, res) => {
    // Get the data from the request body
    let data = req.body;
    // Initialize an empty object to store the student data
    let studentData ={};
    // Find the school document with the given schoolId
    let schoolDetails = await  schoolModel.findOne({"schoolId": data.schoolId});
    // Check if the school was found
    if(schoolDetails){
        // Create a new student document using the data from the request body
        const studentDetails = new studentModel({
            name: data.name,
            age:data.age,
            schoolId: data.schoolId,
        });
        // Save the new student document to the database
        studentData = await studentDetails.save();
        // Initialize a variable to store the webhook URL
        let webhookUrl ="";
        // Loop through the webhookDetails array of the school
        for(let i=0; i<schoolDetails.webhookDetails.length; i++){
            // Check if the eventName is "newStudentAdd"
            if(schoolDetails.webhookDetails[i].eventName == "newStudentAdd")
                // If it is, set the webhookUrl variable to the endpointUrl of the webhook event
                webhookUrl = schoolDetails.webhookDetails[i].endpointUrl;
        }
        // Check if the webhookUrl is not null and has a length greater than 0
        if(webhookUrl != null && webhookUrl.length>0){
            // If it does, send a POST request to the webhook URL with the student data as the request body
            let result = await axios.post(webhookUrl, studentData,{
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            // Log a message to the console indicating that the webhook data was sent
            console.log(" webhook data send")
        }
    }else
    {
        // If the school was not found, log a message to the console
        console.log(" NO school")
    }

    // Send back a success message in the response
    res.send({
        result:"added successfully: "+studentData.name
    });
});

// Start listening for incoming requests on the specified port number
app.listen(PORT, () => {
    console.log(`Server running at: http://localhost:${PORT}/`);
});

// Add an event listener for when mongoose successfully connects to the MongoDB database
mongoose.connection.on('connected', ()=>{
    console.log('Mongoose default connection open to ' + dbUrl );
})
