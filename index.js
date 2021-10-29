require("dotenv").config();
const { MongoClient } = require("mongodb");
const express = require("express");
const cors = require("cors");

const ObjectId = require("mongodb").ObjectId;

const port = process.env.PORT || 8000;
const app = express();

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dafwp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

async function run() {
	try {
		await client.connect();
		const databse = client.db("traveller");
		const eventsCollection = databse.collection("events");
		const registerCollection = databse.collection("register");

		// list api [EVENT]
		app.get("/events", async (req, res) => {
			const cursor = eventsCollection.find({});
			const page = parseInt(req.query.page);
			const size = parseInt(req.query.size);
			const count = await cursor.count();
			let result;
			if (page) {
				result = await cursor
					.skip(page * size)
					.limit(size)
					.toArray();
			} else {
				result = await cursor.toArray();
			}
			res.send({ count, result });
		});

		// single api [EVENT]
		app.get("/event/:id", async (req, res) => {
			const _id = req.params.id;
			const query = { _id: ObjectId(_id) };
			const result = await eventsCollection.findOne(query);
			res.json(result);
		});

		// post api [EVENT]
		app.post("/events", async (req, res) => {
			const newEvent = req.body;
			const result = await eventsCollection.insertOne(newEvent);
			res.send(result);
		});

		// post api [REGISTER]
		app.post("/register", async (req, res) => {
			const newRegister = req.body;
			const result = await registerCollection.insertOne(newRegister);
			res.send(result);
		});
	} finally {
		// await client.close()
	}
}

run().catch(console.dir);

app.get("/", (req, res) => {
	res.send("hello World!");
});

app.listen(port, () => {
	console.log(`Application running on - http://localhost:${port}`);
});
