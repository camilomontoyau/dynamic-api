'use strict';
const express = require('express');
const app = express();
const compression = require('compression');
const bodyParser = require('body-parser');
const router = express.Router();
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/mydatabase', {});

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

router.get('/:collectionName/:documentId', function (req, res) {
  dynamicModel(req.params.collectionName).findById(req.params.documentId, function (err, doc) {
    if(err) throw err;
    if(!doc) return res.status(404).json({message:'Not found'});
    return res.status(200).json(doc);
  });
});

router.post('/:collectionName', function (req, res) {
  if(!req.body){
    return res.status(400).json({message:'No body found'});
  }
  
  let newModel = new dynamicModel(req.params.collectionName)(req.body);
  
  newModel.save(function (err, createdModel) {
    if(err) throw err;
    return res.status(201).json(createdModel);
  });
});

router.put('/:collectionName/:documentId', function (req, res) {
  if(!req.body){
    return res.status(400).json({message:'No body found'});
  }
  dynamicModel(req.params.collectionName).findOneAndUpdate({_id:req.params.documentId}, {$set: req.body}, {new: true}, function (err, createdModel) {
    if(err) throw err;
    return res.status(200).json(createdModel);
  });
});

router.delete('/:collectionName/:documentId', function (req, res) {
  dynamicModel(req.params.collectionName).find({_id:req.params.documentId}).remove().exec(function(err, data) {
    if(err) throw err;
    res.status(200).json(data);
  });
});



app.use('/api/v1', router);

app.listen(3000);
