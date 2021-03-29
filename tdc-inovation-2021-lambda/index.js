const request = require('request');

exports.handler = async function(event, context) {
 event.Records.forEach(record => {

 const { body } = record;
 var jsonBody = JSON.parse(body);
 var ids = "Dumpi-SNS";
 console.log(ids);
 console.log('Corpo JSON:', jsonBody.Message);
 console.log('Iniciando integracao');

 // HTTP request
 const request = require('request');
 var url = 'http://<server>';
 request(url, function (error, response, body) {
	 console.log('body:', body); // Print the HTML for the Google homepage.
 });

 // Load the AWS SDK for Node.js
 var AWS = require('aws-sdk');

 // Set region
 AWS.config.update({region: 'us-west-1'});
 var valor = Math.random();
 var data = Date.now();
 var texto = '{estado: SP, data: ' + data + ', valor: ' + valor + ', dado: ' + process.argv[2] + '}';
 console.log('');
 console.log('Entrada: ' + jsonBody.Message);
 console.log('Dado: ' + texto);
 console.log('');

 // Create publish parameters
 var params = {
 Records: [ /* required */
 	{
		Data: Buffer.from( jsonBody.Message + "\n") || 'K0000001' ,  PartitionKey: 'SP-DATA',  ExplicitHashKey: '232132199898546'
		//Data: Buffer.from('{log: LYMTEC, data: ' + data + ', valor: ' + valor + ', dado: ' + jsonBody.Message + '}\n') || 'K0000001' ,  PartitionKey: 'SP-DATA',  ExplicitHashKey: '232132199898546'
 	},
 	],
 	StreamName: '<input-data-kinesis>' /* required */
 };

 console.log('[Enviando para Kinesis]');
 
 var kinesis = new AWS.Kinesis();

 kinesis.putRecords(params, function(err, data) {
	 if (err) {
		 console.log("Erro no PUT"); // an error occurred
		 console.log(err, err.stack); // an error occurred
	 } else {
		 console.log("Record PUT"); // successful response
		 console.log(data); // successful response
	 }
 });

 console.log('[KINESIS OK]');

 });

 return {};
};
