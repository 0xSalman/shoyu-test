import { Schema , Document, model } from 'mongoose'

const userSchema = new Schema({
  _id: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  chainId: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
  },
  username: {
    type: String,
  },
  twitter: {
    type: String,
  },
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
})

interface User {
  address: string
  chainId: number
  name?: string
  username?: string
  twitter?: string
}

export interface UserDocument extends User, Document { }

export const UserModel = model<UserDocument>('user', userSchema)

