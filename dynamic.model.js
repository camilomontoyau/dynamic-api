'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const dynamicSchema = Schema(
  {},
  {strict:false}
);


module.exports = function (collectionName) {
 return mongoose.model(collectionName, dynamicSchema);
};






 
