import { UserDocument, UserModel } from './user.model'

export const create = async (newUser: Partial<UserDocument>): Promise<UserDocument> => {
  const user = new UserModel(newUser)
  return user.validate()
    .then( async () => user.save())
}

export const findById = async (id: string): Promise<UserDocument> => {
  return UserModel.findById(id)
}

export const updateById = async (
  id: string,
  user: Pick<UserDocument, 'username' | 'twitter' | 'name'>,
): Promise<UserDocument> => {
  return UserModel.findByIdAndUpdate(id, user)
}

export const deleteById = async (id: string): Promise<boolean> => {
  return UserModel.findByIdAndDelete(id)
    .then(() => true)
}
