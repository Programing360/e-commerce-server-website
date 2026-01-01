const express = require('express');
const app = express();
const cors = require('cors')
require('dotenv').config();
const port = process.env.PORT || 5000

app.use(express.json());
app.use(cors())

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3036qk8.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        const database = client.db("myProjectDB");
        const usersCollection = database.collection("userProduct");
        const cartCollection = database.collection("cart");
        const ordersCollection = database.collection("orders");



        app.get('/allProduct', async (req, res) => {
            const result = await usersCollection.find().toArray();
            res.send(result);
        })

        app.get("/allProduct/:id", async (req, res) => {
            try {
                const id = req.params.id;

                const query = { _id: new ObjectId(id) }

                const result = await usersCollection.findOne(query);
                // console.log(result)
                if (!result) {
                    return res.status(404).send({ message: 'Product not found' });
                }

                res.send(result);
            } catch (error) {
                res.status(500).send({ message: 'Invalid ID or server error' });
            }
        });

        app.get('/cart', async (req, res) => {
            const { email } = req.query;

            if (!email) {
                return res.status(400).send({ message: "Email is required" });
            }

            try {
                const cartItems = await cartCollection
                    .find({ "email": email })
                    .sort({ createdAt: -1 })
                    .toArray(); // convert cursor to array

                res.send(cartItems);
                // const cartItems = await cartCollection.find().toArray();
                // res.status(200).json(cartItems);
            } catch (err) {
                console.error(err);
                res.status(500).json({ message: 'Server error' });
            }
        });


        app.post('/allProduct', async (req, res) => {
            const product = req.body
            const result = await usersCollection.insertOne(product)
            res.send(result)
        })

        // place order

        app.get('/orderDetails', async (req, res) => {
            const result = await ordersCollection.find().toArray()
            res.send(result)
        })

        // GET orders by customer email
        app.get("/orders", async (req, res) => {
            const { email } = req.query;

            if (!email) {
                return res.status(400).send({ message: "Email is required" });
            }

            try {
                const orders = await ordersCollection
                    .find({ "customer.email": email })
                    .sort({ createdAt: -1 })
                    .toArray(); // convert cursor to array

                res.send(orders);
            } catch (err) {
                res.status(500).send({ message: "Server error", error: err.message });
            }

            res.send(orders);
        });

        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await ordersCollection.insertOne(order);
            res.send(result);
        });



        // Add to cart
        app.post('/cart/add', async (req, res) => {
            try {
                const { userId, productId, quantity, email, name, images,price } = req.body;
                const item = {
                    userId, productId, quantity, email, name, images,price
                }
                // console.log(productId)
                if (!item) {
                    return res.status(400).json({ message: 'All fields are required' });
                }

                // Check if product already in cart
                const existing = await cartCollection.findOne({ userId, productId });

                if (existing) {
                    // If exists, update quantity
                    await cartCollection.updateOne(
                        { _id: existing._id },
                        { $inc: { quantity: quantity } }
                    );
                } else {
                    // Insert new item
                    const result = await cartCollection.insertOne(item);
                    // console.log(cartCollection)
                    res.send(result)
                }


            } catch (err) {
                res.status(500).json({ message: 'Server error' });
            }
        });



        app.put('/cart/update/:productId', async (req, res) => {
            const item = req.body;
            console.log(item)
            const productId = req.params.productId;
            const filter = { _id: new ObjectId(productId) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    quantity: item.quantity
                },
            };
            const cartItems = await cartCollection.findOne(filter);

            if (!cartItems) {
                return res.status(404).send({ message: 'Item not found' });
            }


            res.send(await cartCollection.updateOne(filter, updateDoc, options));
        })

        app.patch('/cart/increase/:id', async (req, res) => {

            await cartCollection.updateOne(
                { _id: new ObjectId(req.params.id) },
                { $inc: { quantity: 1 } }
            );
            res.send({ success: true });
        });

        app.patch('/cart/decrease/:id', async (req, res) => {
            const cartItem = await cartCollection.findOne({ _id: new ObjectId(req.params.id) });
            if (cartItem.quantity > 1) {
                await cartCollection.updateOne(
                    { _id: new ObjectId(req.params.id) },
                    { $inc: { quantity: -1 } }
                );
                res.send({ success: true });
            } else {
                res.status(400).send({ message: 'Quantity cannot be less than 1' });
            }
        });

        // delete cart
        app.delete('/cart/delete/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await cartCollection.deleteOne(query);
            res.send(result);

        });


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('Server is running 🚀');
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
