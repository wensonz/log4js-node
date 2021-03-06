var levels = require('./levels'),
    util = require('util'),
    events = require('events'),
    DEFAULT_CATEGORY = '[default]';

/**
 * Models a logging event.
 * @constructor
 * @param {String} categoryName name of category
 * @param {Log4js.Level} level level of message
 * @param {Array} data objects to log
 * @param {Log4js.Logger} logger the associated logger
 * @author Seth Chisamore
 */
function LoggingEvent (categoryName, level, data, logger) {
    this.startTime = new Date();
    this.categoryName = categoryName;
    this.data = data;
    this.level = level;
    this.logger = logger;
}

/**
 * Logger to log messages.
 * use {@see Log4js#getLogger(String)} to get an instance.
 * @constructor
 * @param name name of category to log to
 * @author Stephan Strittmatter
 */
function Logger (name, level) {
    this.category = name || DEFAULT_CATEGORY;

    if (! this.level) {
        this.__proto__.level = levels.TRACE;
    }
}
util.inherits(Logger, events.EventEmitter);
Logger.DEFAULT_CATEGORY = DEFAULT_CATEGORY;

Logger.prototype.setLevel = function(level) {
    this.level = levels.toLevel(level, this.level || levels.TRACE);
};

Logger.prototype.removeLevel = function() {
    delete this.level;
};

Logger.prototype.log = function() {
    var args = Array.prototype.slice.call(arguments)
  , logLevel = args.shift()
  , loggingEvent = new LoggingEvent(this.category, logLevel, args, this);
    this.emit("log", loggingEvent);
};

Logger.prototype.isLevelEnabled = function(otherLevel) {
    return this.level.isLessThanOrEqualTo(otherLevel);
};

['Trace','Debug','Info','Warn','Error','Fatal'].forEach(
    function(levelString) {
        var level = levels.toLevel(levelString);
        Logger.prototype['is'+levelString+'Enabled'] = function() {
            return this.isLevelEnabled(level);
        };

        Logger.prototype[levelString.toLowerCase()] = function () {
            if (this.isLevelEnabled(level)) {
                var args = Array.prototype.slice.call(arguments);
                args.unshift(level);
                Logger.prototype.log.apply(this, args);
            }
        };
    }
);


exports.LoggingEvent = LoggingEvent;
exports.Logger = Logger;
