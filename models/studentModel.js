const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: String,
    age:Number,
    schoolId: Number,
});

const studentModel = mongoose.model('students', studentSchema);

exports.studentModel = studentModel;
