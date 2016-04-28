'use strict'

var Base = require('./base');

module.exports = class Employee extends Base {
    constructor(source) {
        super('employee', '1.0.0');
        this.nik = '';
        this.name = '';
        this.initial = '';
        this.dob = '';
        this.gender = '';

        if (source)
            Object.assign(this, source);
    }
}