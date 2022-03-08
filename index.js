const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const cors = require('cors');
require('dotenv').config();


const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3bc4k.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

console.log(uri);

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        console.log('connected to database');
        const database = client.db('foodSense');
        const productsCollection = database.collection('products');
        const orderCollection = database.collection('orders');

        //get api
        app.get('/products', async (req, res) => {
            const cursor = productsCollection.find({});
            const products = await cursor.toArray();
            res.send(products);
        })

        //get single product
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await productsCollection.findOne(query);
            res.json(product);
        })

        //Post api
        app.post('/products', async (req, res) => {
            const product = req.body;
            console.log('hit the post api', product);

            const result = await productsCollection.insertOne(product);

            console.log(result);
            res.json(result);
        })

        //Delete api
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productsCollection.deleteOne(query);
            res.json(result);
        })

        //add order api
        app.post('/orders', async (req, res) => {
            const order = req.body;
            console.log('hit the order api ', order);
            const result = await orderCollection.insertOne(order);
            res.json(result);

        });

        //for update manage order api
        app.put('/orders/:id', async (req, res) => {
            const updateOrder = req.body[0];
            const id = req.params.id;
            // console.log(updateOrder);
            const filter = { _id: ObjectId(id) };

            const options = { upsert: true };

            const updateDoc = {
                $set: {
                    name: updateOrder.name,
                    email: updateOrder.email,
                    price: updateOrder.price,
                    orderStatus: updateOrder.orderStatus,
                    address: updateOrder.address,
                    phone: updateOrder.phone,
                    title: updateOrder.title,
                }
            };
            const result = await orderCollection.updateOne(filter, updateDoc, options);
            console.log(result);
            res.send(result);
        });

        //get all order api
        app.get('/orders', async (req, res) => {
            const cursor = orderCollection.find({});
            const orders = await cursor.toArray();
            res.send(orders);
        });

        // get order api 
        app.get('/orders/:id', async (req, res) => {
            const id = req.params.id;
            console.log('getting specific oder', id);
            const query = { _id: ObjectId(id) };
            const singleOrder = await orderCollection.findOne(query);
            res.json(singleOrder);
        })

        //delete order API
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await orderCollection.deleteOne(query);
            res.json(result);
        })
    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Running foodSense server');
});

app.listen(port, () => {
    console.log('running foodSense on port', port);
});

