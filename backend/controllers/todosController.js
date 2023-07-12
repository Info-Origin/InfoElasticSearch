import db from "../db/database.js";


//CREATE DATABASE
// exports.createDB = (req, res) => {
//     let q = 'CREATE DATABASE todolist';
//     db.query(q, (err, result) => {
//         if (err) throw err;
//         return res.status(201).json("DB created");
//     })
// }

//CREATE TABLE
export function createTable(req, res) {
    let q = "CREATE TABLE todolist1(id int AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), email VARCHAR(255), Mobile VARCHAR(255), Experience TEXT(65530 ),skills VARCHAR(255),education TEXT(65530))";
    db.query(q, (err, result) => {
        if (err) throw err;
        return res.status(201).json("TABLE CREATED");
    });
}


//CREATE LIST
export function createList(req, res) {
    const q = "INSERT INTO todolist1 SET ?";

    const newRow = req.body;

    db.query(q, newRow, (err, result) => {
        if (err) return res.json(err);
        return res.status(200).json(result);
    });
}


//SHOW TODOS
export function showTodos(req, res) {
    const q = "SELECT * FROM todolist1";

    db.query(q, (err, result) => {
        if (err) return res.json(err);
        return res.status(200).json(result);
    });
}

//SHOW SINGLE TODO
export function singleTodo(req, res) {
    const q = `SELECT * FROM todolist1 where id=${req.params.id}`;

    db.query(q, (err, result) => {
        if (err) return res.json(err);
        return res.status(200).json(result[0]);
    });
}


//UPDATE TODO
export function updateTodo(req, res) {
 
    // const q = `UPDATE todolist1 SET firstName ='${firstName}' lastName ='${lastName}' where id=${req.params.id}`;
    const q = `UPDATE todolist1 SET ? where id=${req.params.id}`;

    db.query(q, req.body, (err, result) => {
        if (err) return res.json(err);
        return res.status(200).json(result);
    });
}
export function updateCheck(req, res) {
    const { text,is_checked  } = req.body;
    // const q = `UPDATE todolist1 SET firstName ='${firstName}' lastName ='${lastName}' where id=${req.params.id}`;
    const q = `UPDATE todolist1 SET ? where id=${req.params.id}`;

    db.query(q, { text,is_checked }, (err, result) => {
        if (err) return res.json(err);
        return res.status(200).json(result);
    });
}

//DELETE SINGLE TODO
export function deleteSingleTodo(req, res) {

    const q = `DELETE FROM todolist1  WHERE id=${req.params.id}`;

    db.query(q, (err, result) => {
        if (err) return res.json(err);
        return res.status(200).json({ data: "todo deleted" });
    });
}

export function deleteAll(req,res){
    const q = `TRUNCATE TABLE todolist1`;
    db.query(q, (err, result) => {
        if (err) return res.json(err);
        return res.status(200).json({ data: "All todo deleted" });
    });
}
export function deletedone(req,res){
   
    const q = `DELETE FROM todolist1  WHERE is_checked=${1}`;
    db.query(q, (err, result) => {
        if (err) return res.json(err);
        return res.status(200).json({ data: "Done todo deleted" });
    });
}






