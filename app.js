import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import cors from "cors";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "secret",
  password: "satyam1012",
  port: 5432,
});
db.connect();

app.use(bodyParser.json());
app.use(express.static("public"));
app.use(cors());

app.get("/",async (req,res)=>{
  res.json("Hello all fine");
});

app.get("/data", async (req,res)=>{
  let items;
  try {
    const result = await db.query("SELECT * FROM post ORDER BY id ASC");
    items = result.rows;
    res.json(items);

  } catch (e) {
    console.log(e);
  }
})

app.post("/", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length > 0) {
      const storedPassword = result.rows[0].password;
      if (storedPassword === password) {
        res.json("exist");
      } else {
        res.json("Incorrect password");
      }
    } else {
      res.json("notexist");
    }
  } catch (e) {
    console.log(e);
    res.status(500).json("Server Error");
  }
});

app.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  try {
    const checkResult = await db.query("SELECT * FROM users WHERE email=$1", [email]);
    if (checkResult.rows.length > 0) {
      res.json("exist");
    } else {
      await db.query("INSERT INTO users (email, password) VALUES ($1, $2)", [email, password]);
      res.json("notexist");
    }
  } catch (e) {
    console.log(e);
    res.status(500).json("Server Error");
  }
});

app.post("/post", async (req,res)=>{
  const { title, content } = req.body;

  try{
      await db.query("INSERT INTO post (title, content) VALUES ($1,$2)", [title,content]);
      res.json("created");
  }
  catch(e){
    res.json("notcreated");
    console.log(e);
  }
});

app.post("/delete", async (req,res)=>{
  const {title} = req.body;

  try{
    await db.query("DELETE FROM post WHERE title = $1", [title]);
    res.json("deleted")
  }
  catch(e){
    res.json("notdeleted");
    console.log(e);
  }
})

app.listen(port, () => {
  console.log(`App is listening to the port ${port}`);
});
