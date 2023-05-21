const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yssxwdf.mongodb.net/?retryWrites=true&w=majority`;


const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
    useNewUrlParser:true,
    useUnifiedTopology:true,
    maxPoolSize:10,
});

async function run() {
    try {
       
         client.connect((err) => {
            if (err){
                console.error(err);
                return;
            }
        });

        const toyCollection = client.db('toyDatabase').collection('toys');

        app.get('/alltoys', async (req, res) => {
            const cursor = toyCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get("/categorytoys/:text", async(req,res) => {
            console.log(req.params.text)
            if(req.params.text ==="dc" || req.params.text ==="transformer" || req.params.text ==="marvel" || req.params.text ==="pokemon"){
                const result = await toyCollection.find({category:req.params.text})
                .toArray();
                console.log(result);
                return res.send(result);
            }
            const result = await toyCollection.find({}).toArray();
            res.send(result);


        });

        app.get("/mytoys/:email", async(req,res) =>{
            console.log(req.params.email);
            const result = await toyCollection.find({email:req.params.email})
            .toArray();
            res.send(result);

        });

        app.get("/toybyname/:text", async(req,res) =>{

            if(req.params.text != "" || req.params.text != "undefined"){

            

            const text =req.params.text;
            const result = await toyCollection

            .find({
                $or: [
                    { toyName: { $regex: text, $options: "i" } },
                ],
            })
            .toArray();
            return res.send(result);
        }
        const result = await toyCollection.find({}).toArray();
        res.send(result);

        });



        app.post('/newtoy', async (req, res) => {
            const newCoffee = req.body;
            console.log(newCoffee);
            const result = await toyCollection.insertOne(newCoffee);
            res.send(result);
        })

  
        app.put("/updatetoy/:id", async (req, res) => {
            const id = req.params.id;
            const body = req.body;
            console.log(body);
            const filter = { _id: new ObjectId(id) };
            const updateDoc = {
              $set: {
                toyName: body.toyName,
                price: body.price,
                category: body.category,
                quantity: body.quantity,
                rating: body.rating,
                imageurl: body.imageurl,
                sname:body.sname,

              },
            };
            const result = await toyCollection.updateOne(filter, updateDoc);
            res.send(result);
          });

        app.delete('/deletetoy/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await toyCollection.deleteOne(query);
            res.send(result);
        })

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('server is running')
})

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`)
})