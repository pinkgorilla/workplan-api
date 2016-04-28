'use strict'

var Base = require('./base');

module.exports = class EmployeeWorkplan extends Base{
    
    constructor(source){
        super('employee-workplan', "1.0.0");
        this.employeeId = '';
        this.initial = '';
        
        this.periodId = '';
        this.month='';
        this.period = '';
        
        this.items = [];
        this.completionPercentage = 0;
        

        if (source)
            Object.assign(this, source);
    }
}