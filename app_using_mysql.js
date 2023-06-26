const express = require('express');
const { db } = require('./db'); // Import the db object from the provided code

const app = express();
const PORT = 3100;
app.use(express.json()); // Use the built-in express.json middleware instead of body-parser

app.get('/', (req, res) => {
    res.send('Welcome to Student Data Application');
});

app.post('/registerSchool', async (req, res) => {
    let data = req.body;
    // Get the current number of schools in the database
    const [rows] = await db.query('SELECT COUNT(*) as count FROM schools');
    const index = rows[0].count;
    // Insert a new school into the schools table
    const [result] = await db.query('INSERT INTO schools (schoolName, schoolId) VALUES (?, ?)', [data.schoolName, index + 1]);
    // Get the inserted school data
    const [schoolData] = await db.query('SELECT * FROM schools WHERE id = ?', [result.insertId]);

    res.send({
        result: schoolData[0]
    });
});

app.post('/addWebhookEvent', async (req, res) => {
    let data = req.body;
    // Find the school with the given schoolId
    const [schoolDetails] = await db.query('SELECT * FROM schools WHERE schoolId = ?', [data.schoolId]);
    if(schoolDetails.length > 0){
        let webhookDetails = JSON.parse(schoolDetails[0].webhookDetails);
        if(webhookDetails == null){
            webhookDetails =[];
        }
        webhookDetails.push({
            eventName: data.eventName,
            endpointUrl: data.endpointUrl
        });

        // Update the school with the new webhook event
        await db.query('UPDATE schools SET webhookDetails = ? WHERE schoolId = ?', [JSON.stringify(webhookDetails), data.schoolId]);
        res.send({
            result: webhookDetails
        });
    }else
    {
        console.log(" NO school")
        res.send({
            result: "No school found"
        });
    }
});

app.post('/addStudent', async (req, res) => {
    let data = req.body;
    let studentData ={};
    // Find the school with the given schoolId
    const [schoolDetails] = await db.query('SELECT * FROM schools WHERE schoolId = ?', [data.schoolId]);
    if(schoolDetails.length > 0){
        // Insert a new student into the students table
        const [result] = await db.query('INSERT INTO students (name, age, schoolId) VALUES (?, ?, ?)', [data.name, data.age, data.schoolId]);
        // Get the inserted student data
        const [student] = await db.query('SELECT * FROM students WHERE id = ?', [result.insertId]);
        studentData = student[0];

        let webhookUrl ="";
        let webhookDetails = JSON.parse(schoolDetails[0].webhookDetails);
        for(let i=0; i<webhookDetails.length; i++){
            if(webhookDetails[i].eventName == "newStudentAdd")
            webhookUrl = webhookDetails[i].endpointUrl;
        }
        if(webhookUrl != null && webhookUrl.length>0){
            // Send a POST request to the webhook URL with the student data as the request body
            console.log("Sending POST request to " + webhookUrl);
            console.log(studentData);
            console.log("Webhook data sent");
        }
    }else
    {
        console.log(" NO school")
    }

    res.send({
        result:"added successfully: "+studentData.name
    });
});

app.listen(PORT, () => {
    console.log(`Server running at: http://localhost:${PORT}/`);
});
