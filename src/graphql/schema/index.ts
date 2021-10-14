import path from 'path'
import fs from 'fs'
import { DocumentNode } from 'graphql'
import { gql } from 'apollo-server'

const readGraphQLFile = (file: string): string => {
  const filePath = path.join(__dirname, file)
  return fs.readFileSync(filePath, 'utf-8')
}

const gqlWrapper = (...files: any): DocumentNode => {
  return gql`
    ${files}
  `
}

export const typeDefs = (): DocumentNode => {
  const filesContent = fs
    .readdirSync(__dirname)
    .filter((file) => path.extname(file) === '.graphql')
    .map(readGraphQLFile)
  return gqlWrapper(...filesContent)
}
