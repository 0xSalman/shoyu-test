import { FilterQuery } from 'mongoose'

import { UserDocument, UserModel } from './user.model'

export const create = async (newUser: Partial<UserDocument>): Promise<UserDocument> => {
  const user = new UserModel(newUser)
  return user.validate()
    .then( async () => user.save())
}

export const findById = async (id: string): Promise<UserDocument> => {
  return UserModel.findById(id)
}

export const findBy = async (filter: FilterQuery<UserDocument>): Promise<UserDocument> => {
  return UserModel.findOne(filter)
}

export const doesExist = async (filter: FilterQuery<UserDocument>): Promise<boolean> => {
  return UserModel.exists(filter)
}

export const updateById = async (
  id: string,
  user: Partial<UserDocument>,
  upsert = false,
): Promise<UserDocument> => {
  return UserModel.findByIdAndUpdate(id, user, { upsert })
}

export const deleteById = async (id: string): Promise<boolean> => {
  return UserModel.findByIdAndDelete(id)
    .then(() => true)
}
