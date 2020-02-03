"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var prisma_lib_1 = require("prisma-client-lib");
var typeDefs = require("./prisma-schema").typeDefs;

var models = [
  {
    name: "Token",
    embedded: false
  },
  {
    name: "Challenge",
    embedded: false
  },
  {
    name: "Vote",
    embedded: false
  },
  {
    name: "User",
    embedded: false
  },
  {
    name: "Choice",
    embedded: false
  }
];
exports.Prisma = prisma_lib_1.makePrismaClientClass({
  typeDefs,
  models,
  endpoint: `https://eu1.prisma.sh/nevena-djaja/curation-starter/dev`
});
exports.prisma = new exports.Prisma();
