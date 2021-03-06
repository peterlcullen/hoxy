/*
 * Copyright (c) 2014 by Greg Reimer <gregreimer@gmail.com>
 * MIT License. See mit-license.txt for more info.
 */

var Body = require('./body');
var chunker = require('./chunker');
var streams = require('./streams');
var _ = require('lodash-node');
var cheerio = require('cheerio');

// ---------------------------

/**
 * Represents an HTTP response.
 */
var Response = Body.extend(function(){
  this._data = {
    statusCode: 200,
    headers: {},
    slow: {}
  };
},{

  // -------------------------------------------------

  /**
   * Getter/setter for HTTP status code.
   */
  get statusCode(){
    return this._getRawDataItem('statusCode');
  },
  set statusCode(code){
    code = parseInt(code);
    if (!code) {
      throw new Error('invalid status code'); // TODO: test this
    }
    this._setRawDataItem('statusCode', code);
  },

  /**
   * Getter/setter for HTTP response header object.
   */
  get headers(){
    return this._getRawDataItem('headers');
  },
  set headers(headers){
    this._setRawDataItem('headers', _.extend({}, headers));
  },

  // -------------------------------------------------

  _setHttpSource: function(inResp){
    this.statusCode = inResp.statusCode;
    this.headers = inResp.headers;
    this._source = inResp;
  },

  _setRawDataItem: function(name, value){
    if (this._phase === 'response'){
      var message = 'requests are not writable during the response phase';
      this.emit('log', {
        level: 'error',
        message: message,
        error: new Error(message)
      });
      return;
    }
    return Body.prototype._setRawDataItem.apply(this, arguments);
  },

  /*
   * Prepare this response for sending by removing internal contradictions and
   * otherwise shoring up any HTTP spec violations.
   *
   * TODO: emit debug log events for things that are changed.
   */
  _sanitize: function(){
    if (!this._data.source){
      this._data.source = streams.from([]);
    }
    // avoid mucking around figuring out how to set content-length
    // instead, force node to chunk the response
    delete this._data.headers['content-length'];
  }
});

module.exports = Response;
