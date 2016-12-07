'use strict';
const express = require('express');
const app = express();
const compression = require('compression');
const bodyParser = require('body-parser');
const router = express.Router();
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/salvador', {});

const dynamicModel =  require('./dynamic.model');

app.use(compression());
app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());

router.get('/', function (req, res) {
  res.status(200).json({message:'api is working!'});
});

router.get('/:collectionName', function (req, res) {
  let queryDb = {};
  
  if(req.query){
    queryDb = req.query;
  }
  
  dynamicModel(req.params.collectionName).find(queryDb, function (err, docs) {
    if(err) throw err;
    res.status(200).json(docs);
  });
});



app.use('/api/v1', router);

app.listen(3000);
