'use strict'

var Base = require('./base');

module.exports = class Period extends Base{
    constructor(source) {
        super('period', '1.0.0');
        this.month = '';
        this.period = '';
        this.from = '';        
        this.to = '';
        this.closed = '';

        if (source)
            Object.assign(this, source);
    }
}
 