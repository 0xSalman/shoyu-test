# Shoyu Test

## Getting Started

### 1. Requirements

1. Node.js version 14.18.1
2. Docker
3. Yarn

### 2. Build and Start

1. `yarn install`
2. `cp .env.sample .env`; modify this file if needs be
3. `docker-compose up -d`
4. `yarn dev`

GraphQL playground is available at `localhost:9080`.

Redis UI is available at `localhost:9060`.

Mongo UI is available at `localhost:9070`.

## Notes

1. I slightly updated the given GraphQL schema: `UserInput.username` is a required attribute. This seems very logically 
considering the smart contract implementation.
2. Smart contracts events fetching jobs run every minute

## TODOs

1. `getAddressFromSignature` function does not verify whether the correct message was signed. 
I could not figure out how to extract the message hash from the signature
2. When querying blockchain for contract events, it does not skip the previously processed events. Hence, I had to use 
Mongo's `upsert` functionality as a work around `user already exists`
3. I could not figure out how to decode/get the actual value of `username` from the contract event. At the moment, it stores
the returned hash
