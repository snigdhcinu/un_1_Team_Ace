require('dotenv').config();
const dialogflow = require('@google-cloud/dialogflow');
const uuid = require('uuid');
const express=require('express');
const bodyParser=require('body-parser');
const nodemailer=require('nodemailer');
const app=express();

const port=3000; // Add dynamic port no. ASAP, to avoid unexpected behaviour.



// A unique identifier for the given session
  const sessionId = uuid.v4();

app.use(bodyParser.urlencoded({
  extended:false
}));


app.use(function (req, res, next) {

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
  
    // Pass to next layer of middleware
    next();
  });

let authenticated = 0; // if OTP verified, then authenticated = 1
let inputOTP;

var otpGenerator = require('otp-generator')
let otp = otpGenerator.generate(6, { upperCase: false, specialChars: false });

let transporter;

app.post('/send-msg',(req,res)=>{

  // OTP Generator


// Nodemailer
  // Initializing stuff
   transporter = nodemailer.createTransport({
  service:'gmail',
    auth: {
      user:process.env.SENDER, // generated ethereal user
      pass:process.env.SENDER_PASSWORD , // generated ethereal password
    }
});
  


    // chatbot logic


  if(authenticated == 0){
    runSample1(req.body.MSG).then(data=>{
      console.log(data);
      
      if(data[1] == 'greet - getName - getEmail - getOtp'){
        // let inputOTP = JSON.stringify(result.parameters.fields.otp.stringValue)

        inputOTP = inputOTP.substring(1,inputOTP.length-1);

        if(otp == inputOTP){
          authenticated = 1;
          console.log('User Authentication successful.')
          res.send({Reply:{auth:'success', callback:data[0]}})
        }
      }

      res.send({Reply:data[0]})
    })
  }

  if(authenticated == 1){
    runSample2(req.body.MSG).then(data=>{
      // console.log(data);

      

      res.send({Reply:data})
    })
  }
})

  //  EXECUTION FUNCTIONS HERE.


async function runSample1(msg,projectId = 'jarvis-itwxkb') {

  // Create a new session
  const sessionClient = new dialogflow.SessionsClient({
    keyFilename: __dirname+"/Jarvis-e156e690921e.json"
  });
  const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);

  // The text query request.
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        // The query to send to the dialogflow agent
        text: msg,
        // The language used by the client (en-US)
        languageCode: 'en-US',
      },
    },
  };

  // Send request and log result

      // console.log('_________________________________')
  const responses = await sessionClient.detectIntent(request);
  // console.log('Detected intent');
  const result = responses[0].queryResult;
  // console.log(`  Query: ${result.queryText}`);
  if(result.intent){
    if(result.intent.displayName == 'greet - getName'){
      let detectedName = JSON.stringify(result.parameters.fields.uname.stringValue)
      // console.log(`detected name is ${detectedName}`)
    }

    if(result.intent.displayName == 'greet - getName - getEmail'){
      let detectedEmail = JSON.stringify(result.parameters.fields.uemail.stringValue)
      // console.log(`detected email is ${detectedEmail}`)
      // Sending mail

    let data={
      from:process.env.SENDER,

      // Receiver of email, given by chatbot.

      to:detectedEmail,
      subject:'Verification OTP',
      text:`Hi, your verification OTP is :- ${otp} please enter this into the chat, to verify yourself.`
    }
    transporter.sendMail(data, function(err,info){
      if(err){
        console.log(err)
      }
      else{
        console.log('Message was sent successfully');
        console.log(info)
      }
    })
    }

    if(result.intent.displayName == 'greet - getName - getEmail - getOtp'){
      inputOTP = JSON.stringify(result.parameters.fields.otp.stringValue)
      // console.log(`detected email is ${detectedEmail}`)
    }
}

  // console.log(`  Response: ${result.fulfillmentText}`);
  if (result.intent) {
    console.log(`  Intent: ${result.intent.displayName}`);
  } else {
    console.log(`  No intent matched.`);
  }
  // console.log('_________________________________')


 // 'Thanks, sending verification OTP to ron123@ymail.com, input that here.'

  return [result.fulfillmentText,result.intent.displayName];
}

async function runSample2(msg,projectId = 'jarvis-itwxkb') {

  // Create a new session
  const sessionClient = new dialogflow.SessionsClient({
    keyFilename: __dirname+"/Jarvis-e156e690921e.json"
  });
  const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);

  // The text query request.
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        // The query to send to the dialogflow agent
        text: msg,
        // The language used by the client (en-US)
        languageCode: 'en-US',
      },
    },
  };

  // Send request and log result

      // console.log('_________________________________')
  const responses = await sessionClient.detectIntent(request);
  // console.log('Detected intent');
  const result = responses[0].queryResult;
  // console.log(`  Query: ${result.queryText}`);
  
    if(result.intent.displayName == 'greet - getName'){
      let detectedName = JSON.stringify(result.parameters.fields.uname.stringValue)
      // console.log(`detected name is ${detectedName}`)
    }

    if(result.intent.displayName == 'greet - getName - getEmail'){
      let detectedEmail = JSON.stringify(result.parameters.fields.uemail.stringValue)
      // console.log(`detected email is ${detectedEmail}`)
    }

    if(result.intent.displayName == 'greet - getName - getEmail - getOtp'){
      inputOTP = JSON.stringify(result.parameters.fields.otp.stringValue)
      // console.log(`detected email is ${detectedEmail}`)
    }


  // console.log(`  Response: ${result.fulfillmentText}`);
  if (result.intent) {
    console.log(`  Intent: ${result.intent.displayName}`);
  } else {
    console.log(`  No intent matched.`);
  }
  // console.log('_________________________________')


 // 'Thanks, sending verification OTP to ron123@ymail.com, input that here.'

  return [result.fulfillmentText,result.intent.displayName];
}


app.listen(port,()=>{
  console.log('Bot running on port'+port);
})

// runSample()