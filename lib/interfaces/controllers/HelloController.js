'use strict';


const SayHello = require('../../application/use_cases/SayHello');
const CountryMap = require('../../application/use_cases/CountryMap');

module.exports = {

  sayHelloWorld() {

    return SayHello();
  },

  sayHelloPerson(request) {

    return SayHello(request.params.name);
  },

  Country(request) {

    return CountryMap(request.params.Long, request.params.Lat);
  },

};