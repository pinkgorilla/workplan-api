'use strict'
module.exports = class BaseModel {
    constructor(type, version) {
        this._stamp = '';
        this._type = type;
        this._version = version;
        this._active = true;
        this._deleted = false;
        this._createdBy = '';
        this._createdDate = '';
        this._createAgent = '';
        this._updatedBy = '';
        this._updatedDate = '';
        this._updatedAgent = '';
    }

    stamp(actor, agent) {
        var now = new Date();

        if (this._createdBy == '')
            this._createdBy = actor;

        if (this._createdDate == '')
            this._createdDate = now;

        if (this._createAgent == '')
            this._createAgent = agent;

        var ticks = ((now.getTime() * 10000) + 621355968000000000);
        
        this._stamp = ticks.toString(16);
        this._updatedBy = actor;
        this._updatedDate = now;
        this._updateAgent = agent;
    }
}