import * as path from 'path'
import * as fs from 'fs'
import { DocumentNode } from 'graphql'
import { gql } from 'apollo-server'

const schemaDir = __dirname

const readGraphQLFile = (file: string): string => {
  const filePath = path.join(schemaDir, file)
  return fs.readFileSync(filePath, 'utf-8')
}

const gqlWrapper = (...files: any): DocumentNode => {
  return gql`
    ${files}
  `
}

export const typeDefs = (): DocumentNode => {
  const filesContent = fs
    .readdirSync(schemaDir)
    .filter((file) => path.extname(file) === '.graphql')
    .map(readGraphQLFile)
  return gqlWrapper(...filesContent)
}
