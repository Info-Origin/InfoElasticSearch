import  express from 'express';
import {  createTable, createList, showTodos, singleTodo, updateTodo, deleteSingleTodo,deletedone,deleteAll } from '../controllers/todosController.js';
const router = express.Router();


//jobs routes

// /api/job/create
// router.get('/create/database', createDB);
router.get('/create/table', createTable);
router.post('/create/list', createList);
router.get('/show/todos', showTodos);
router.get('/todo/:id', singleTodo);
router.put('/update/todo/:id', updateTodo);
router.delete('/delete/todo/:id', deleteSingleTodo);
router.delete('/delete/deletedone', deletedone);
router.delete('/delete/deleteall', deleteAll);



export default router;