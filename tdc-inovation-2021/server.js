// Load modules
var express = require('express');
var app = express();
var cors = require('cors')
var redis = require('redis')
var path = require('path');

const MongoClient = require('mongodb').MongoClient;

// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');

// Set region
AWS.config.update({region: 'us-west-1'});

// Config Redis
const client = redis.createClient('//localhost:6379');
//var elasticache = new AWS.ElastiCache();

// Configure app
app.use(cors())
app.use(express.static('public'));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Endpoints
app.get('/', function (req, res) {
  res.render('index');
});

app.get('/web', function (req, res) {
  res.render('web');
});

app.get('/sobre', function (req, res) {
  res.render("about", {title: "TDC inovation 2021", user: {name:"Lab 2021"}});
});

app.get('/erro', function (req, res) {
  res.render("erro", {title: "Erro"});
});

app.get('/status', function (req, res) {
  res.json({api: 'TESTE Data API', status: 'UP'});
});

app.get('/version', function (req, res) {
  res.json({api: 'TESTE Data API', version: 1.7});
});

// Sendind status data to MongoDB - Teste
app.get('/mongo', cors(), function (req, res) {
  mongo(req.query.id);
  res.send('Data sent to MB!');
});

// Sendind company data to MongoDB and SNS
app.get('/empresa', cors(), function (req, res) {
  if ( req.query.id == "TDC001") {
	console.log('[EMPRESA OK] : ' + req.query.cnpj + ',' + req.query.estado + ',' + req.query.situacao );
        mongoEmpresa(req.query.cnpj,req.query.estado,req.query.situacao);
	console.log("Dado enviado para Mongo");  
        snsEmpresa(req.query.cnpj,req.query.estado,req.query.situacao);
	console.log("Dado enviado para SNS");
        redisEmpresa(req.query.cnpj,req.query.estado,req.query.situacao);
	console.log("Dado enviado para Redis");
	console.log("");
        res.send('Company data sent!');
  } else {
        console.log('[EMPRESA NOK] : ' + req.query.cnpj + ',' + req.query.estado + ',' + req.query.situacao );
        res.send('Company API');
  }
});

// Sendind company data to MongoDB and SNS
app.post('/empresa', cors(), function (req, res) {
  if ( req.body.id == "TDC001") {
	console.log('[POST EMPRESA OK] : ' + req.body.cnpj + ',' + req.body.estado + ',' + req.body.situacao );
        mongoEmpresa(req.body.cnpj,req.body.estado,req.body.situacao);
	console.log("Dado enviado para Mongo");
        snsEmpresa(req.body.cnpj,req.body.estado,req.body.situacao);
	console.log("Dado enviado para SNS");
        redisEmpresa(req.body.cnpj,req.body.estado,req.body.situacao);
	console.log("Dado enviado para Redis");
        console.log("");
        res.send('POST Company data sent!');
  } else {
        console.log('[POST EMPRESA NOK] : ' + req.body.cnpj + ',' + req.body.estado + ',' + req.body.situacao );
        console.log(req.body);
        res.send('POST Company API');
  }
});

// Getting company Data from redis
app.get('/empresa/busca', cors(), function (req, res) {
  if ( req.query.id == "TDC001") {
        console.log('[EMPRESA BUSCA OK] : ' + req.query.cnpj );
        client.on("error", function(error) {
          console.error(error);
        });
          client.get(req.query.cnpj, function(err, reply) {
          res.send(reply);
        });

  } else {
        console.log('[EMPRESA BUSCA NOK] : ' + req.query.cnpj );
        res.send('Company API');
  }
});

// Getting company Data from redis
app.post('/empresa/busca', cors(), function (req, res) {
  if ( req.body.id == "TDC001") {
        console.log('[POST EMPRESA BUSCA OK] : ' + req.body.cnpj );
        client.on("error", function(error) {
          console.error(error);
        });
          client.get(req.body.cnpj, function(err, reply) {
          res.send(reply);
        });
  } else {
        console.log('[POST EMPRESA BUSCA NOK] : ' + req.body.cnpj );
        console.log(req.body);
        res.send('POST Company API');
  }
});

// Sendind data to SNS - Teste
app.get('/send', function (req, res) {
  var valor = Math.random();
  var data = Date.now();
  // Create publish parameters
  var params = {
          Message: '{id: TDC-SNS, data:' + data + ', valor: ' + valor +  ', estado: ' + req.query.id + '}', /* required */
    TopicArn: '<arn:>'
  };
  // Create promise and SNS service object
  var publishTextPromise = new AWS.SNS({apiVersion: '2010-03-31'}).publish(params).promise();
  // Handle promise's fulfilled/rejected states
  publishTextPromise.then(
    function(data) {
      console.log();
      console.log(`[SEND] Message ${params.Message}`);
      console.log(`Sent to the topic ${params.TopicArn}`);
      console.log("MessageID is " + data.MessageId);
    }).catch(
      function(err) {
      console.error(err, err.stack);
    });
  res.send('SNS Message sent!');
});

/********************************************************************
 *   MongoDB Function                                               *
 ********************************************************************/
function mongo(ids) {
        console.log('Inserindo dados no mongo');
        var url = "<mongodb+srv:/>";

        console.log('[EMPRESA] Mongo dada sent!');
        MongoClient.connect(url,{ useUnifiedTopology: true }, function(err, db) {
          if (err) throw err;
          var dbo = db.db("tdc-data");
          var myobj = { name: "LabC Inc", address: "Sao Paulo" , id: ids, log : 'DUMPI-SNS CNPJ', data: Date.now() };
          dbo.collection("dados").insertOne(myobj, function(err, res) {
            if (err) throw err;
            console.log("1 document inserted");
            db.close();
          });
        });
}

function mongoEmpresa(cnpj, estado, situacao) {
        console.log('[MONGO-EMPRESA] Inserindo dados no mongo');
        var url = "<mongodb+srv>";

        MongoClient.connect(url,{ useUnifiedTopology: true }, function(err, db) {
          if (err) throw err;
          var dbo = db.db("tdc-data");
          var myobj = { name: "Lab course", log : 'DUMPI-SNS CNPJ', data: Date.now() , cnpj:cnpj, estado:estado, situacao:situacao };
          dbo.collection("dados").insertOne(myobj, function(err, res) {
            if (err) throw err;
            console.log("1 documento inserido");
            console.log("");
            db.close();
          });
        });
}

/********************************************************************
 *   SNS Function                                                   *
 ********************************************************************/
function snsEmpresa(cnpj, estado, situacao) {
  var valor = Math.random();
  var data = Date.now();
  // Create publish parameters
  var params = {
        Message: cnpj + ';' + estado + ';' + situacao ,
        // Message: '{id: DUMPI-SNS, data:' + data + ', valor: ' + valor +  ', cnpj: ' + cnpj + ', estado: ' + estado + ', situacao: ' + situacao + '}',
        TopicArn: '<arn>'
  };
  // Create promise and SNS service object
  var publishTextPromise = new AWS.SNS({apiVersion: '2010-03-31'}).publish(params).promise();
  // Handle promise's fulfilled/rejected states
  publishTextPromise.then(
    function(data) {
      console.log();
      console.log(`[EMPRESA SEND] Message ${params.Message}`);
      console.log(`Sent to the topic ${params.TopicArn}`);
      console.log("MessageID is " + data.MessageId);
    }).catch(
      function(err) {
      console.error(err, err.stack);
    });
  console.log('[EMPRESA] SNS Message sent!');
}

/********************************************************************
 *   Redis Cache Function                                           *
 ********************************************************************/
function redisEmpresa(cnpj, estado, situacao) {
        client.on("error", function(error) {
          console.error(error);
        });
        client.set(cnpj, estado + ':' + situacao, redis.print);
        console.log('[EMPRESA] CACHE Message sent!');
}

function redisGetEmpresa(cnpj) {
        client.on("error", function(error) {
          console.error(error);
        });
        var result = client.get(cnpj, redis.print);
        console.log('[EMPRESA] CACHE GET Message sent!');
        return result;
}

app.listen(3000, function () {
  console.log('App listening on port 3000!');
})
