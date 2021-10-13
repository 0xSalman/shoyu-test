import * as mongoose from 'mongoose'
import { dbConfig } from '@src/env'

let index: mongoose.Connection

export const connectDB = async (): Promise<void> => {
  if (index) {
    return
  }

  const uri = `mongodb://${dbConfig.host}:${dbConfig.port}`
  try {
    await mongoose.connect(uri, {
      autoCreate: true,
      autoIndex: true,
      dbName: dbConfig.database,
      user: dbConfig.username,
      pass: dbConfig.password,
    })
    index = mongoose.connection
    console.log('Connected to database :)!!')
  } catch (e) {
    console.log('Error connecting to database :(!')
  }
}

export const disconnectDB = (): unknown => {
  if (!index) {
    return
  }
  return mongoose.disconnect()
}
