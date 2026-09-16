import mongoose from 'mongoose'

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI)
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`)
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`)
    // Do not terminate process in development so server can still serve mock responses if DB is not active yet
  }
}
