const AWS = require('aws-sdk');
AWS.config.update({region: 'us-west-1'});

const sqs = new AWS.SQS({apiVersion: '2012-11-05'});

const accountId = '<id>';
const queueName = '<sqs>';

const params = {
  MessageBody: JSON.stringify({
    order_id: 1234,
    date: (new Date()).toISOString()
  }),
  QueueUrl: `https://sqs.us-west-1.amazonaws.com/${accountId}/${queueName}`
};

sqs.sendMessage(params, (err, data) => {
  if (err) {
    console.log("Error", err);
  } else {
    console.log("Successfully added message", data.MessageId);
  }
});
