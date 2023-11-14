const Student = require('../models/studentModel');
const handlerFactory = require('./handlerFactory');

exports.getAllStudents = handlerFactory.getAll(Student);
exports.getStudent = handlerFactory.getOne(Student);
exports.createStudent = handlerFactory.createOne(Student);
exports.updateStudent = handlerFactory.updateOne(Student);
exports.deleteStudent = handlerFactory.deleteOne(Student);
