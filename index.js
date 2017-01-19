'use strict';
const express = require('express');
const app = express();
const compression = require('compression');
const bodyParser = require('body-parser');
const router = express.Router();
const mongoose = require('mongoose');

console.log('something');

mongoose.connect(`mongodb://${process.env.db}/dynamic-api`, {});

const dynamicModel =  require('./dynamic.model');

app.use(compression());
app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());

router.get('/', function (req, res) {
  res.status(200).json({message:'api is working!'});
});

router.get('/:collectionName', function (req, res) {
  let queryDb = {};
  
  if (req.query) {
    queryDb = req.query;
  }
  
  console.log(queryDb);
  
  if (queryDb.product) {
    queryDb.product = parseInt(req.query.product);
  }
  
  
  let limit = 100;
  let skip = 0;
  let fields = {};
  let sort = {};
  
  if (queryDb.limit && parseInt(queryDb.limit) <= 100) {
    limit = parseInt(queryDb.limit)
    delete queryDb.limit;
  }
  
  if (queryDb.skip && parseInt(queryDb.skip) >= 0) {
    skip = parseInt(queryDb.skip);
    delete queryDb.skip;
  }
  
  if (queryDb.sort) {
    sort = queryDb.sort;
    delete queryDb.sort;
  }
  
  console.log('limit', limit);
  console.log('skip', skip);
  console.log('fields', fields);
  console.log('sort', sort);
  
  dynamicModel(req.params.collectionName).count(queryDb, function (err1, count) {
    if (err1) {
      return res.status(500).json({
        status: 500,
        success: false,
        error: {message: 'error counting', err: err1}
      });
    }
    dynamicModel(req.params.collectionName).find(queryDb, fields)
      .limit(limit)
      .skip(skip)
      .sort(sort)
      .exec(function (err2, docs) {
        if (err2) {
          return res.status(500).json({
            status: 500,
            success: false,
            error: {message: 'error finding', err: err2}
          });
        }
        
        let result = {
          status: 200,
          success: true,
          error: null,
          data: docs
        };
        
        if(count > 0){
          result.total = count;
        }
        
        return res.status(200).json(result);
      });
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

app.listen(9000);
