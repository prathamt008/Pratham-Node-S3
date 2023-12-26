const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const bcrypt = require("bcrypt");
const secretKey = require("../config/jwt-config");
const db = require("../database/connection");
const multer = require('multer');
const fs = require('fs');
const axios = require('axios');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); 
  },
  filename: function (req, file, cb) {
    const fileType = file.mimetype.split('/')[1]; 
    cb(null, file.fieldname + '-' + Date.now() + '.' + fileType);
  },
});

const upload = multer({ storage: storage });

//sign-up
router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;
  const query = `SELECT * FROM S3Users WHERE Username = '${username}' OR Email = '${email}'`;
  const result = await db.executeQuery(query);
  if (result.length > 0) {
    return res.status(400).json({ message: "User already exists" });
  }
 
  const hashedPassword = await bcrypt.hash(password, 10);

  const insertUserQuery = `INSERT INTO S3Users (Username, Email, Password)
      VALUES ('${username}','${email}','${hashedPassword}')`;

  const result1 = await db.executeQuery(insertUserQuery);
  if (result1 == null) {
    res.render('login')
  } else {
    alert("Unable to sign up!")
  }
});

router.get('/', (req, res) => {
  res.render('sign-up');
});

// Login
router.get('/login', (req, res) => {
  res.render('login');
});

router.get('/create-bucket', (req, res) => {
  res.render('create-bucket');
});

router.get('/get-bucket', (req, res) => {
  res.render('bucket-list');
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const getUserQuery = `SELECT * FROM S3Users WHERE username = '${username}'`;
  const result = await db.executeQuery(getUserQuery);

  if (result.length === 0) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  const user = result[0];

  const passwordMatch = await bcrypt.compare(password, user.Password);
  if (!passwordMatch) {
    return res.status(401).json({ message: "Invalid username or password" });
  }
    try {
  
    const token = jwt.sign(
      { userID: user.UserID, username: user.Username },
      secretKey,
      {
        expiresIn: "1h", // Token expiration time
      }
    );
    if(token){
     req.session.UserId = user.UserID
      let response = await axios({
        method: 'get',
        url: `http://localhost:8080/getbucket?UserID=${user.UserID}`,
      })
        
      let bucketList = response.data
      res.render('bucket-list', { bucketList });

    }
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch buckets" });
  }
});

router.post("/create-bucket", async (req, res) => {
  const userID  = req.session.UserId;
  let name = req.body.BucketName;

  if (!name) {
    return res.status(400).json({ message: "Bucket name is required" });
  }

  const insertUserQuery = `INSERT INTO S3Buckets (UserID, BucketName)
      VALUES ('${userID}','${name}')`;
  const insertedBucketData = await db.executeQuery(insertUserQuery);
  console.log(insertedBucketData);
  let response = await axios({
    method: 'get',
    url: `http://localhost:8080/getbucket?UserID=${userID}`,
  })
    
  let bucketList = response.data
  res.render('bucket-list', { bucketList });
});

router.get("/getbucket", async (req, res) => {
  const { UserID } = req.query;
  const getUserid = `SELECT * FROM S3Buckets WHERE UserID = ${UserID}`;
  const value = await db.executeQuery(getUserid);
  if (value.length > 0) {
    return res.status(200).json(value);
  }
  else{
    return res.status(200).json([]);
  }
});

// Route for file upload
router.post("/put-object", upload.single("file"), async (req, res) => {
  console.log(req.file, "file")
  const { BucketID, ObjectName} = req.body;
  const FilePath = req.file.path;
  const FileSize = req.file.size;
  const FileType = req.file.mimetype.split('/')[1];
  console.log(BucketID, ObjectName, FilePath, FileSize,FileType)
 
  if (!BucketID || !ObjectName || !FilePath || !FileSize || !FileType) {
    return res
      .status(400)
      .json({ message: "Incomplete file details or file not uploaded" });
  }

  const insertUserQuery = `INSERT INTO S3Objects (BucketID, ObjectName, FilePath, FileSize,FileType)
     VALUES (${BucketID},'${ObjectName}','${FilePath}','${FileSize}','${FileType}')`;
  const insertedBucketData = await db.executeQuery(insertUserQuery);
  console.log(insertedBucketData);
  res.status(201).json({ message: "File uploaded successfully" });
  
});

// Route for file download
router.get("/get-object", async (req, res) => {
  const { id } = req.query;
  const getObjectQuery = `SELECT * FROM S3Objects WHERE ObjectID = ${id}`;
  const object = await db.executeQuery(getObjectQuery);
  if (object.length === 0) {
    return res.status(404).json({ message: "Object not found" });
  }

  const file = `${__dirname}/../${object[0].FilePath}`;
  res.download(file);
});

router.get('/list-object',async(req,res)=>{
  const { id } = req.query;
  const getObjectQuery = `SELECT * FROM S3Objects WHERE BucketID = ${id}`;
  const object = await db.executeQuery(getObjectQuery);
  if (object.length === 0) {
    res.render('list-object',{object})
  }
    res.render('list-object',{object})
})

// Route for file delete
router.delete("/delete-object", async (req, res) => {
  const { id } = req.query;

  // Check if the object exists
  const getObjectQuery = `SELECT * FROM S3Objects WHERE ObjectID = ${id}`;
  const object = await db.executeQuery(getObjectQuery);
  if (object.length === 0) {
    return res.status(404).json({ message: "Object not found" });
  }

  // Delete the file
  const file = `${__dirname}/../${object[0].FilePath}`;
  fs.unlinkSync(file);

  // Delete the object from the database
  const deleteObjectQuery = `DELETE FROM S3Objects WHERE ObjectID = ${id}`;
  await db.executeQuery(deleteObjectQuery);
  res.status(200).json({ message: "Object deleted successfully" });
});

module.exports = router;
