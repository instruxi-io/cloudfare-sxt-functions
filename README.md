CLOUDFARE SPACE AND TIME CONNECTOR

#To begin, make sure you have api access to Cloudfare.

#To develop, test, and deploy, you need to use the Wrangler Client to interact and test with cloudfare

- use $ npm install Wrangler@2.0.0
- if you are using a windows machine, Wrangler 2 is required because of http certificate bugs in Wrangler 3
- use $npm install dependencies, to install all necessary dependencies
- use $npx wrangler login to login via Oauth


WORKER.JS
- NAMESPACE = "spaceandtime"
- Worker.js is the main source of code to run these calls.
- The current steps are
1. requestChallenge (requests an auth code challenge from )
2. SignChallenge() signs challenge with your etheres private key 
3. requestToken() makes api request to sxt with auth code and signed auth code to get a token 
4. querySxT, queries SxT in whaever manner you want, currently getting totalAmount from IONI tables.
5. 
ADD A file named ".dev.vars" in the root of the directoryx, and add your ethers private key in this format PRIVATE_KEY=""

RUN npx wrangler secret put <KEY> spaceandtime
  
RUN npx wrangler dev <script> to test and run
