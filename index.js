const express = require('express')
const cors = require('cors')
const app = express()
require('dotenv').config()
const port = process.env.PORT || 5000

app.use(cors(["*"]))
app.use(express.json())

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.klq4o7m.mongodb.net/?retryWrites=true&w=majority`;

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
    // await client.connect();

    const viewCollection = client.db('postsDB').collection('pageView')
    const postCollection = client.db('postsDB').collection('posts')
    const categoriesCollection = client.db('postsDB').collection('categories')
    const usersCollection = client.db('postsDB').collection('users')

    app.get('/user-visited', async(req, res) => {
      const result = await viewCollection.find().toArray() 
      res.send(result)
    })

    app.get('/posts', async(req, res) => {
      const result = await postCollection.find().toArray()
      res.send(result)
    })

    app.get('/users', async(req, res) => {
      const result = await usersCollection.find().toArray()
      res.send(result)
    })

    app.get('/user-role/:email', async(req, res) => {
      const email = req.params.email
      const filter = {email: email}
      const result = await usersCollection.findOne(filter)
      res.send({role: result?.role})
    })
    
    app.get('/categories', async(req, res) => {
      const result = await categoriesCollection.find().toArray()
      res.send(result)
    })

    app.get('/categories/:id', async(req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await categoriesCollection.findOne(filter)
      res.send(result)
    })

    app.get('/:category', async (req, res) => {
      const category = req.params.category;
      const filter = { category: category }; 
      const result = await postCollection.find(filter).toArray();
      res.send(result);
    });

    app.get('/:category/:id', async(req, res) => {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)}
      const result = await postCollection.findOne(filter)
      res.send(result)
    })

    app.post('/user-visited', async(req, res) => {
      const view = req.body
      const result = await viewCollection.insertOne(view)
      res.send(result)
    })

    app.post('/posts', async(req, res) => {
      const post = req.body;
      const result = await postCollection.insertOne(post)
      res.send(result)
    })

    app.post('/categories', async(req, res) => {
      const post = req.body;
      const result = await categoriesCollection.insertOne(post)
      res.send(result)
    })

    app.post('/users', async(req, res) => {
      const user = req.body;
      const isUserHave = await usersCollection.findOne({email: user.email})
      if(isUserHave){
        res.send({status: 'false'}) 
      } else {
        const result = await usersCollection.insertOne(user)
        res.send(result)
      }
    })

    app.patch('/posts/:id', async(req, res) => {
      const id = req.params.id;
      const updatePost = req.body
      const filter = {_id: new ObjectId(id)}
      const post = {
        $set: {
          title: updatePost.title,
          category: updatePost.category,
          tags: updatePost.tags,
          image: updatePost.image,
          thumbnail: updatePost.thumbnail,
          post: updatePost.post,
          authorName: updatePost.authorName,
          authorImage: updatePost.authorImage
        }
      }
      const result = await postCollection.updateOne(filter, post)
      res.send(result)
    })

    app.patch('/users/:id', async(req, res) => {
      const id = req.params.id;
      const updateRole = req.body
      const filter = {_id: new ObjectId(id)}
      const role = {
        $set: {
          role: updateRole.role
        }
      }
      const result = await postCollection.updateOne(filter, role)
      res.send(result)
    })

    app.delete('/categories/:id', async(req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await categoriesCollection.deleteOne(filter);
      res.send(result);
    })

    app.delete('/users/:id', async(req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await usersCollection.deleteOne(filter);
      res.send(result);
    })

    app.delete('/posts/:id', async(req, res) => {
      const id = req.params.id
      const filter = { _id: new ObjectId(id) }
      const result = await postCollection.deleteOne(filter)
      res.send(result)
    })

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})