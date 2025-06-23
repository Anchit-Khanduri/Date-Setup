const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
let users = require('./USERS.json');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/'); 
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});


const upload = multer({ storage: storage });


app.get('/api/users', (req, res) => {
  res.json(users);
});




app.post('/api/users', upload.single('image'), (req, res) => {
  const body = req.body;
  console.log("Received POST data:", body); 

  
  if (!body.username || !body.place || !body.food || !body.date || !body.time) {
    console.error('Form data is incomplete.');
    return res.status(400).send('Bad Request: Missing fields');
  }

  
  let imageUrl = null;
  if (req.file) {
    imageUrl = req.file.filename;  
  }


  const newUser = { ...body, id: users.length + 1, image: imageUrl };
  users.push(newUser);

  fs.writeFile('./USERS.json', JSON.stringify(users, null, 2), (err) => {
    if (err) {
      console.error('Error writing USERS.json:', err);
      return res.status(500).send('Server error while saving user');
    }

    // console.log("User saved. Redirecting to /userData.html");
    return res.redirect('/userData.html');
  });
});


app.listen(3000, () => {
  console.log("Server started");
});
