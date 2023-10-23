const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.edakn.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
try{
    await client.connect();
   const servicesPackageCollection = client.db('weddingPlanner').collection('servicesPackage');


   app.get('/servicesPackage', async(req, res) =>{
    const query = {};
    const options = await servicesPackageCollection.find(query).toArray();
    res.send(options);
   })
   /* ---------------- */

   app.get('/servicesPackage/:_id', async (req, res) => {
    const id = req.params._id;
    console.log('getting specific service', id);
    const query = { _id: (id) };
    console.log(query)
    const service = await servicesPackageCollection.findOne(query);
   console.log(service)

})

}
finally{

}
}
run().catch(console.dir);




app.get('/', async(req, res) =>{
    res.send('wedding app is running')
})

app.listen(port, () => console.log(`Wedding portal running ${port}`))