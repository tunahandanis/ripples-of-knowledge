import mongoose from "mongoose"

const connection = {}

async function dbConnect() {
  if (connection.isConnected) {
    return
  }

  // eslint-disable-next-line no-undef
  const mongoURI = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@ripples-of-knowledge.nqwtzmx.mongodb.net/?retryWrites=true&w=majority`

  const db = await mongoose.connect(mongoURI, {
    dbName: "ripples_of_knowledge",

    useNewUrlParser: true,
    useUnifiedTopology: true,
  })

  connection.isConnected = db.connections[0].readyState
}

export default dbConnect
