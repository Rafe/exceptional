# Exceptional for node.js

Exceptional helps you track errors in your node.js apps!

This module posts exception data from your node.js apps to Exceptional <http://getexceptional.com>. When an exception occurs, data about the environment and backtrace of the exception are sent.

To use Exceptional for node.js you must have an account at <http://getexceptional.com>.

## Installation

Install from [NPM](http://npmjs.com):

```bash
npm install exceptional-node
```

```javascript
var Exceptional = require('exceptional-node');

Exceptional.API_KEY = **YOUR-API-KEY**;
```

## Usage

There a are multiple ways you can use exceptional with your node.js app.

* The process.uncaughtException event can be used to catch exceptions that bubble all the way up to the event loop.

```javascript
process.addListener('uncaughtException', function(err) {
  Exceptional.handle(err);
});
```

* You can send exception data to exceptional from inside your own try/catch blocks

```javascript
try {
  // Your Code
} catch(error) {
  // Your own error processing
  Exceptional.handle(error);
}
```

## Example

Check out the small example in examples/demo.js (replace 'your-api-key-here' with your read API-KEY).

```bash
node example/demo.js
```

## Express

You can also use the express middleware errorHandler

```javascript

var express = require('express'),
    app = express(),
    Exceptional = require('exceptional-node');

Exceptional.API_KEY = 'your-api-key-here';

app.get('/', function(req, res) {
  res.send('ok');
});

//need to put after the routes
app.use(Exceptional.errorHandler);
```

Copyright &copy; 2008-2013 getexceptional.com
