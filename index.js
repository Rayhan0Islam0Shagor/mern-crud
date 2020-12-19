require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors')
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const fileUpload = require('express-fileupload');


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mj0am.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


const app = express();
const port = process.env.PORT || 5000

app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(fileUpload());

app.get('/', (req, res) => {
    res.send("Hello from server")
})


client.connect(err => {
    const actionCollection = client.db(`${process.env.DB_NAME}`).collection(`${process.env.DB_ACTION}`);

    // Get All Actions
    app.get('/allActions', (req, res) => {
        actionCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    // Add An Action
    app.post('/addAction', (req, res) => {
        const name = req.body.name;
        const time = req.body.time;
        const email = req.body.email;
        const title = req.body.title;
        const description = req.body.description;
        const file = req.files.image;
        const Img = file.data;
        const encImg = Img.toString('base64');
        const image = {
            contentType: req.files.image.mimetype,
            size: req.files.image.size,
            img: Buffer.from(encImg, 'base64')
        };

        actionCollection.insertOne({ name, time, email, title, description, image })
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })


    // Update Action
    app.get('/allActions/:id', (req, res) => {
        actionCollection.find({ _id: ObjectId(req.params.id) })
            .toArray((err, documents) => {
                res.send(documents[0]);
            })
    })

    app.patch('/updateAction/:id', (req, res) => {
        actionCollection.updateOne({ _id: ObjectId(req.params.id) },
            {
                $set: {
                    name: req.body.name,
                    email: req.body.email,
                    time: req.body.time,
                    description: req.body.description,
                    title: req.body.title
                }
            })
            .then(result => {
                res.send(result.modifiedCount > 0);
            })
    })

    // Delete Action
    app.delete('/deleteAction/:id', (req, res) => {
        actionCollection.deleteOne({ _id: ObjectId(req.params.id) })
            .then((err, result) => {
                res.send(result.deletedCount > 0);
            })
    })

});

app.listen(port);