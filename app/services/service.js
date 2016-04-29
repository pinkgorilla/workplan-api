'use strict'

module.exports = class Service {
  constructor(version) {
    this.apiVersion = version;
  }

  version(request, response, next) {
    response.locals.apiVersion = this.apiVersion;
    next();
  }
}