const express = require("express");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "todoApplication.db");
let db = null;

const startDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => console.log("Server Started!"));
  } catch (e) {
    console.log(`Db Error: ${e.message}`);
    process.exit(1);
  }
};

startDbAndServer();

const convertTodoDbObjectToResponseObject = (eachTodo) => {
  return {
    id: eachTodo.id,
    todo: eachTodo.todo,
    priority: eachTodo.priority,
    category: eachTodo.category,
    status: eachTodo.status,
    dueDate: eachTodo.due_date,
  };
};

app.post("/todos/", async (req, res) => {
  const { id, todo, priority, status, category, dueDate } = req.body;

  await db.run(`INSERT INTO
    todo (id, todo,priority,status,category,due_date)
    VALUES
    (${id},'${todo}','${priority}','${status}','${category}','${dueDate}')
    `);
  res.send(`Todo Successfully Added`);
});

app.get("/todos/", async (req, res) => {
  const {
    status = "",
    priority = "",
    search_q = "",
    category = "",
    dueDate = "",
  } = req.query;

  let todo,
    warningMsg = "None",
    statusList = ["TO DO", "IN PROGRESS", "DONE", undefined, ""],
    priorityList = ["HIGH", "MEDIUM", "LOW", undefined, ""],
    searchList = ["TO DO", "IN PROGRESS", "DONE", undefined, ""],
    categoryList = ["WORK", "HOME", "LEARNING", undefined, ""];

  if (
    status === "" &&
    priority === "" &&
    search_q === "" &&
    search_q === "" &&
    category === "" &&
    dueDate === ""
  ) {
    const todos = await db.all(`SELECT * FROM todo`);
    res.send(
      todos.map((eachTodo) => convertTodoDbObjectToResponseObject(eachTodo))
    );
  } else if (search_q !== "") {
    const searchResult = await db.all(
      `SELECT * FROM todo WHERE todo LIKE '%${search_q}%'`
    );
    res.status(200);
    res.send(
      searchResult.map((eachRes) =>
        convertTodoDbObjectToResponseObject(eachRes)
      )
    );
  } else if (!statusList.includes(status)) {
    console.log(status);
    warningMsg = "Invalid Todo Status";
    res.status(400);
    res.send(warningMsg);
  } else if (!priorityList.includes(priority)) {
    warningMsg = "Invalid Todo Priority";
    res.status(400);
    res.send(warningMsg);
  } else if (!priorityList.includes(priority)) {
    warningMsg = "Invalid Todo Priority";
    res.status(400);
    res.send(warningMsg);
  } else if (!categoryList.includes(category)) {
    warningMsg = "Invalid Todo Category";
    res.status(400);
    res.send(warningMsg);
  } else {
    console.log("in else");
    if (
      categoryList.includes(category) &&
      statusList.includes(status) &&
      status !== "" &&
      category !== ""
    ) {
      console.log("in cat sta");
      const qRes = await db.all(
        `SELECT * FROM todo WHERE category = '${category}'  and status = '${status}'`
      );
      res.status(200);
      res.send(qRes);
    } else if (
      categoryList.includes(category) &&
      priorityList.includes(priority) &&
      priority !== "" &&
      category !== ""
    ) {
      console.log("in cat pri");
      const qRes = await db.all(
        `SELECT * FROM todo WHERE category LIKE '${category}'  and priority LIKE '${priority}'`
      );
      res.status(200);
      res.send(qRes);
    } else if (categoryList.includes(category) && category !== "") {
      console.log("in cat");
      const qRes = await db.all(
        `SELECT * FROM todo WHERE category ='${category}'`
      );

      res.status(200);
      res.send(qRes);
    } else if (
      statusList.includes(status) &&
      status !== "" &&
      priority.includes(priority) &&
      priority !== ""
    ) {
      console.log("in pri &  status");
      const qRes = await db.all(
        `SELECT * FROM todo WHERE status ='${status}' AND priority ='${priority}'`
      );
      res.status(200);
      res.send(qRes);
    } else if (statusList.includes(status) && status !== "") {
      console.log("in ony status");
      const qRes = await db.all(`SELECT * FROM todo WHERE status ='${status}'`);
      res.status(200);
      res.send(qRes);
    } else if (priorityList.includes(priority)) {
      console.log("in ony priority");
      const qRes = await db.all(
        `SELECT * FROM todo WHERE priority ='${priority}'`
      );
      res.status(200);
      res.send(qRes);
    }
  }
});

// app.get("/todos/", async (req, res) => {
//   const {
//     status = "",
//     priority = "",
//     search_q = "",
//     category = "",
//     dueDate = "",
//   } = req.query;

//   let todo,
//     warning = "None";

//   if (
//     status !== "TO DO" &&
//     // status !== "IN PROGRESS" &&
//     // status !== "DONE" &&
//     status !== ""
//   ) {
//     warning = "Invalid Todo Status";
//     console.log(status);
//   } else if (
//     priority !== "HIGH" &&
//     priority !== "LOW" &&
//     priority !== "MEDIUM" &&
//     priority !== ""
//   ) {
//     warning = "Invalid Todo Priority";
//   } else if (
//     category !== "WORK" &&
//     category !== "HOME" &&
//     category !== "LEARNING" &&
//     category !== ""
//   ) {
//     warning = "Invalid Todo Category";
//   } else if (dueDate !== "") {
//     warning = "Invalid Due Date";
//   }

//   if (warning !== "None") {
//     res.status(400);
//     res.send(warning);
//   } else {
//     if (category !== "" && status !== "") {
//       todo = await db.all(
//         `SELECT * FROM todo WHERE category='${category}' and status ='${status}'`
//       );
//       res.send(
//         todo.map((eachTodo) => convertTodoDbObjectToResponseObject(eachTodo))
//       );
//     } else if (status !== "" && priority !== "") {
//       todo = await db.all(
//         `SELECT * FROM todo WHERE status='${status}' and priority='${priority}'`
//       );
//       res.send(
//         todo.map((eachTodo) => convertTodoDbObjectToResponseObject(eachTodo))
//       );
//     } else if (status !== "" && priority === "") {
//       todo = await db.all(`SELECT * FROM todo WHERE status='${status}'`);
//       res.send(
//         todo.map((eachTodo) => convertTodoDbObjectToResponseObject(eachTodo))
//       );
//     } else if (category !== "" && priority === "") {
//       todo = await db.all(`SELECT * FROM todo WHERE category='${category}'`);
//       res.send(
//         todo.map((eachTodo) => convertTodoDbObjectToResponseObject(eachTodo))
//       );
//     } else if (status === "" && priority !== "") {
//       todo = await db.all(`SELECT * FROM todo WHERE priority='${priority}'`);
//       res.send(
//         todo.map((eachTodo) => convertTodoDbObjectToResponseObject(eachTodo))
//       );
//     } else if (search_q !== "") {
//       todo = await db.all(`SELECT * FROM todo WHERE todo LIKE '%${search_q}%'`);
//       res.send(
//         todo.map((eachTodo) => convertTodoDbObjectToResponseObject(eachTodo))
//       );
//     } else if (category !== "") {
//       todo = await db.all(`SELECT * FROM todo WHERE category ='${category}'`);
//       res.send(
//         todo.map((eachTodo) => convertTodoDbObjectToResponseObject(eachTodo))
//       );
//     }
//   }
// });

app.get("/todos/:todoId/", async (req, res) => {
  const { todoId } = req.params;

  const todo = await db.get(`SELECT * FROM todo WHERE id=${todoId}`);
  res.send(convertTodoDbObjectToResponseObject(todo));
});

app.get("/agenda/", async (req, res) => {
  const { date } = req.query;
  if (date !== "" && date !== undefined) {
    const todo = await db.get(`SELECT * FROM todo WHERE due_date='${date}'`);
    res.send(convertTodoDbObjectToResponseObject(todo));
  } else {
    res.status(400);
    res.send("Invalid Due Date");
  }
});

app.delete("/todos/:todoId/", async (req, res) => {
  const { todoId } = req.params;

  await db.run(`DELETE FROM todo WHERE id=${todoId}`);
  res.send("Todo Deleted");
});

app.put("/todos/:todoId/", async (req, res) => {
  const { todoId } = req.params;
  const {
    status = "",
    priority = "",
    todo = "",
    category = "",
    dueDate = "",
  } = req.body;
  if (status !== "") {
    await db.run(`UPDATE todo SET status='${status}'
      WHERE
      id=${todoId}`);
    res.send("Status Updated");
  }
  if (priority !== "") {
    await db.run(`UPDATE todo SET priority='${priority}'
      WHERE
      id=${todoId}`);
    res.send("Priority Updated");
  }

  if (todo !== "") {
    await db.run(`UPDATE todo SET todo='${todo}'
      WHERE
      id=${todoId}`);
    res.send("Todo Updated");
  }

  if (category !== "") {
    await db.run(`UPDATE todo SET category='${category}'
      WHERE
      id=${todoId}`);
    res.send("Category Updated");
  }

  if (dueDate !== "" && dueDate !== undefined) {
    await db.run(`UPDATE todo SET due_date='${dueDate}'
      WHERE
      id=${todoId}`);
    res.send("Due Date Updated");
  }
});

module.exports = app;
