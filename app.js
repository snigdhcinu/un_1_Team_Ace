const dialogflow = require('@google-cloud/dialogflow');
const uuid = require('uuid');
const express=require('express');
const bodyParser=require('body-parser')
const app=express();
const port=3000; // Add dynamic port no. ASAP, to avoid unexpected behaviour.

// OTP Generator
var otpGenerator = require('otp-generator')
 
let otp = otpGenerator.generate(6, { upperCase: false, specialChars: false });




