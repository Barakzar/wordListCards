(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],3:[function(require,module,exports){
(function (setImmediate,clearImmediate){(function (){
var nextTick = require('process/browser.js').nextTick;
var apply = Function.prototype.apply;
var slice = Array.prototype.slice;
var immediateIds = {};
var nextImmediateId = 0;

// DOM APIs, for completeness

exports.setTimeout = function() {
  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
};
exports.setInterval = function() {
  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
};
exports.clearTimeout =
exports.clearInterval = function(timeout) { timeout.close(); };

function Timeout(id, clearFn) {
  this._id = id;
  this._clearFn = clearFn;
}
Timeout.prototype.unref = Timeout.prototype.ref = function() {};
Timeout.prototype.close = function() {
  this._clearFn.call(window, this._id);
};

// Does not start the time, just sets up the members needed.
exports.enroll = function(item, msecs) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = msecs;
};

exports.unenroll = function(item) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = -1;
};

exports._unrefActive = exports.active = function(item) {
  clearTimeout(item._idleTimeoutId);

  var msecs = item._idleTimeout;
  if (msecs >= 0) {
    item._idleTimeoutId = setTimeout(function onTimeout() {
      if (item._onTimeout)
        item._onTimeout();
    }, msecs);
  }
};

// That's not how node.js implements it but the exposed api is the same.
exports.setImmediate = typeof setImmediate === "function" ? setImmediate : function(fn) {
  var id = nextImmediateId++;
  var args = arguments.length < 2 ? false : slice.call(arguments, 1);

  immediateIds[id] = true;

  nextTick(function onNextTick() {
    if (immediateIds[id]) {
      // fn.call() is faster so we optimize for the common use-case
      // @see http://jsperf.com/call-apply-segu
      if (args) {
        fn.apply(null, args);
      } else {
        fn.call(null);
      }
      // Prevent ids from leaking
      exports.clearImmediate(id);
    }
  });

  return id;
};

exports.clearImmediate = typeof clearImmediate === "function" ? clearImmediate : function(id) {
  delete immediateIds[id];
};
}).call(this)}).call(this,require("timers").setImmediate,require("timers").clearImmediate)
},{"process/browser.js":2,"timers":3}],4:[function(require,module,exports){
'use strict';

/**
 * Wrap callbacks to prevent double execution.
 *
 * @param {Function} fn Function that should only be called once.
 * @returns {Function} A wrapped callback which prevents execution.
 * @api public
 */
module.exports = function one(fn) {
  var called = 0
    , value;

  /**
   * The function that prevents double execution.
   *
   * @api private
   */
  function onetime() {
    if (called) return value;

    called = 1;
    value = fn.apply(this, arguments);
    fn = null;

    return value;
  }

  //
  // To make debugging more easy we want to use the name of the supplied
  // function. So when you look at the functions that are assigned to event
  // listeners you don't see a load of `onetime` functions but actually the
  // names of the functions that this module will call.
  //
  onetime.displayName = fn.displayName || fn.name || onetime.displayName || onetime.name;
  return onetime;
};

},{}],5:[function(require,module,exports){
(function (process){(function (){
const SayLinux = require('./platform/linux.js')
const SayMacos = require('./platform/darwin.js')
const SayWin32 = require('./platform/win32.js')

const MACOS = 'darwin'
const LINUX = 'linux'
const WIN32 = 'win32'

class Say {
  constructor (platform) {
    if (!platform) {
      platform = process.platform
    }

    if (platform === MACOS) {
      return new SayMacos()
    } else if (platform === LINUX) {
      return new SayLinux()
    } else if (platform === WIN32) {
      return new SayWin32()
    }

    throw new Error(`new Say(): unsupported platorm! ${platform}`)
  }
}

module.exports = new Say() // Create a singleton automatically for backwards compatability
module.exports.Say = Say // Allow users to `say = new Say.Say(platform)`
module.exports.platforms = {
  WIN32: WIN32,
  MACOS: MACOS,
  LINUX: LINUX
}

}).call(this)}).call(this,require('_process'))
},{"./platform/darwin.js":7,"./platform/linux.js":8,"./platform/win32.js":9,"_process":2}],6:[function(require,module,exports){
(function (setImmediate){(function (){
const childProcess = require('child_process')
const once = require('one-time')

class SayPlatformBase {
  constructor () {
    this.child = null
    this.baseSpeed = 0
  }

  /**
   * Uses system libraries to speak text via the speakers.
   *
   * @param {string} text Text to be spoken
   * @param {string|null} voice Name of voice to be spoken with
   * @param {number|null} speed Speed of text (e.g. 1.0 for normal, 0.5 half, 2.0 double)
   * @param {Function|null} callback A callback of type function(err) to return.
   */
  speak (text, voice, speed, callback) {
    if (typeof callback !== 'function') {
      callback = () => {}
    }

    callback = once(callback)

    if (!text) {
      return setImmediate(() => {
        callback(new TypeError('say.speak(): must provide text parameter'))
      })
    }

    let { command, args, pipedData, options } = this.buildSpeakCommand({ text, voice, speed })

    this.child = childProcess.spawn(command, args, options)

    this.child.stdin.setEncoding('ascii')
    this.child.stderr.setEncoding('ascii')

    if (pipedData) {
      this.child.stdin.end(pipedData)
    }

    this.child.stderr.once('data', (data) => {
      // we can't stop execution from this function
      callback(new Error(data))
    })

    this.child.addListener('exit', (code, signal) => {
      if (code === null || signal !== null) {
        return callback(new Error(`say.speak(): could not talk, had an error [code: ${code}] [signal: ${signal}]`))
      }

      this.child = null

      callback(null)
    })
  }

  /**
   * Uses system libraries to speak text via the speakers.
   *
   * @param {string} text Text to be spoken
   * @param {string|null} voice Name of voice to be spoken with
   * @param {number|null} speed Speed of text (e.g. 1.0 for normal, 0.5 half, 2.0 double)
   * @param {string} filename Path to file to write audio to, e.g. "greeting.wav"
   * @param {Function|null} callback A callback of type function(err) to return.
   */
  export (text, voice, speed, filename, callback) {
    if (typeof callback !== 'function') {
      callback = () => {}
    }

    callback = once(callback)

    if (!text) {
      return setImmediate(() => {
        callback(new TypeError('say.export(): must provide text parameter'))
      })
    }

    if (!filename) {
      return setImmediate(() => {
        callback(new TypeError('say.export(): must provide filename parameter'))
      })
    }

    try {
      var { command, args, pipedData, options } = this.buildExportCommand({ text, voice, speed, filename })
    } catch (error) {
      return setImmediate(() => {
        callback(error)
      })
    }

    this.child = childProcess.spawn(command, args, options)

    this.child.stdin.setEncoding('ascii')
    this.child.stderr.setEncoding('ascii')

    if (pipedData) {
      this.child.stdin.end(pipedData)
    }

    this.child.stderr.once('data', (data) => {
      // we can't stop execution from this function
      callback(new Error(data))
    })

    this.child.addListener('exit', (code, signal) => {
      if (code === null || signal !== null) {
        return callback(new Error(`say.export(): could not talk, had an error [code: ${code}] [signal: ${signal}]`))
      }

      this.child = null

      callback(null)
    })
  }

  /**
   * Stops currently playing audio. There will be unexpected results if multiple audios are being played at once
   *
   * TODO: If two messages are being spoken simultaneously, childD points to new instance, no way to kill previous
   *
   * @param {Function|null} callback A callback of type function(err) to return.
   */
  stop (callback) {
    if (typeof callback !== 'function') {
      callback = () => {}
    }

    callback = once(callback)

    if (!this.child) {
      return setImmediate(() => {
        callback(new Error('say.stop(): no speech to kill'))
      })
    }

    this.runStopCommand()

    this.child = null

    callback(null)
  }

  convertSpeed (speed) {
    return Math.ceil(this.baseSpeed * speed)
  }

  /**
   * Get Installed voices on system
   * @param {Function} callback A callback of type function(err,voices) to return.
   */
  getInstalledVoices (callback) {
    if (typeof callback !== 'function') {
      callback = () => {}
    }
    callback = once(callback)

    let { command, args } = this.getVoices()
    var voices = []
    this.child = childProcess.spawn(command, args)

    this.child.stdin.setEncoding('ascii')
    this.child.stderr.setEncoding('ascii')

    this.child.stderr.once('data', (data) => {
      // we can't stop execution from this function
      callback(new Error(data))
    })
    this.child.stdout.on('data', function (data) {
      voices += data
    })

    this.child.addListener('exit', (code, signal) => {
      if (code === null || signal !== null) {
        return callback(new Error(`say.getInstalledVoices(): could not get installed voices, had an error [code: ${code}] [signal: ${signal}]`))
      }
      if (voices.length > 0) {
        voices = voices.split('\r\n')
        voices = (voices[voices.length - 1] === '') ? voices.slice(0, voices.length - 1) : voices
      }
      this.child = null

      callback(null, voices)
    })

    this.child.stdin.end()
  }
}

module.exports = SayPlatformBase

}).call(this)}).call(this,require("timers").setImmediate)
},{"child_process":1,"one-time":4,"timers":3}],7:[function(require,module,exports){
const SayPlatformBase = require('./base.js')

const BASE_SPEED = 175
const COMMAND = 'say'

class SayPlatformDarwin extends SayPlatformBase {
  constructor () {
    super()
    this.baseSpeed = BASE_SPEED
  }

  buildSpeakCommand ({ text, voice, speed }) {
    let args = []
    let pipedData = ''
    let options = {}

    if (!voice) {
      args.push(text)
    } else {
      args.push('-v', voice, text)
    }

    if (speed) {
      args.push('-r', this.convertSpeed(speed))
    }

    return { command: COMMAND, args, pipedData, options }
  }

  buildExportCommand ({ text, voice, speed, filename }) {
    let args = []
    let pipedData = ''
    let options = {}

    if (!voice) {
      args.push(text)
    } else {
      args.push('-v', voice, text)
    }

    if (speed) {
      args.push('-r', this.convertSpeed(speed))
    }

    if (filename) {
      args.push('-o', filename, '--data-format=LEF32@32000')
    }

    return { command: COMMAND, args, pipedData, options }
  }

  runStopCommand () {
    this.child.stdin.pause()
    this.child.kill()
  }

  getVoices () {
    throw new Error(`say.export(): does not support platform ${this.platform}`)
  }
}

module.exports = SayPlatformDarwin

},{"./base.js":6}],8:[function(require,module,exports){
(function (process){(function (){
const SayPlatformBase = require('./base.js')

const BASE_SPEED = 100
const COMMAND = 'festival'

class SayPlatformLinux extends SayPlatformBase {
  constructor () {
    super()
    this.baseSpeed = BASE_SPEED
  }

  buildSpeakCommand ({ text, voice, speed }) {
    let args = []
    let pipedData = ''
    let options = {}

    args.push('--pipe')

    if (speed) {
      pipedData += `(Parameter.set 'Audio_Command "aplay -q -c 1 -t raw -f s16 -r $(($SR*${this.convertSpeed(speed)}/100)) $FILE") `
    }

    if (voice) {
      pipedData += `(${voice}) `
    }

    pipedData += `(SayText "${text}")`

    return { command: COMMAND, args, pipedData, options }
  }

  buildExportCommand ({ text, voice, speed, filename }) {
    throw new Error(`say.export(): does not support platform ${this.platform}`)
  }

  runStopCommand () {
    // TODO: Need to ensure the following is true for all users, not just me. Danger Zone!
    // On my machine, original childD.pid process is completely gone. Instead there is now a
    // childD.pid + 1 sh process. Kill it and nothing happens. There's also a childD.pid + 2
    // aplay process. Kill that and the audio actually stops.
    process.kill(this.child.pid + 2)
  }

  getVoices () {
    throw new Error(`say.export(): does not support platform ${this.platform}`)
  }
}

module.exports = SayPlatformLinux

}).call(this)}).call(this,require('_process'))
},{"./base.js":6,"_process":2}],9:[function(require,module,exports){
const childProcess = require('child_process')

const SayPlatformBase = require('./base.js')

const BASE_SPEED = 0 // Unsupported
const COMMAND = 'powershell'

class SayPlatformWin32 extends SayPlatformBase {
  constructor () {
    super()
    this.baseSpeed = BASE_SPEED
  }

  buildSpeakCommand ({ text, voice, speed }) {
    let args = []
    let pipedData = ''
    let options = {}

    let psCommand = `Add-Type -AssemblyName System.speech;$speak = New-Object System.Speech.Synthesis.SpeechSynthesizer;`

    if (voice) {
      psCommand += `$speak.SelectVoice('${voice}');`
    }

    if (speed) {
      let adjustedSpeed = this.convertSpeed(speed || 1)
      psCommand += `$speak.Rate = ${adjustedSpeed};`
    }

    psCommand += `$speak.Speak([Console]::In.ReadToEnd())`

    pipedData += text
    args.push(psCommand)
    options.shell = true

    return { command: COMMAND, args, pipedData, options }
  }

  buildExportCommand ({ text, voice, speed, filename }) {
    let args = []
    let pipedData = ''
    let options = {}

    let psCommand = `Add-Type -AssemblyName System.speech;$speak = New-Object System.Speech.Synthesis.SpeechSynthesizer;`

    if (voice) {
      psCommand += `$speak.SelectVoice('${voice}');`
    }

    if (speed) {
      let adjustedSpeed = this.convertSpeed(speed || 1)
      psCommand += `$speak.Rate = ${adjustedSpeed};`
    }

    if (!filename) throw new Error('Filename must be provided in export();')
    else {
      psCommand += `$speak.SetOutputToWaveFile('${filename}');`
    }

    psCommand += `$speak.Speak([Console]::In.ReadToEnd());$speak.Dispose()`

    pipedData += text
    args.push(psCommand)
    options.shell = true

    return { command: COMMAND, args, pipedData, options }
  }

  runStopCommand () {
    this.child.stdin.pause()
    childProcess.exec(`taskkill /pid ${this.child.pid} /T /F`)
  }

  convertSpeed (speed) {
    // Overriden to map playback speed (as a ratio) to Window's values (-10 to 10, zero meaning x1.0)
    return Math.max(-10, Math.min(Math.round((9.0686 * Math.log(speed)) - 0.1806), 10))
  }

  getVoices () {
    let args = []
    let psCommand = 'Add-Type -AssemblyName System.speech;$speak = New-Object System.Speech.Synthesis.SpeechSynthesizer;$speak.GetInstalledVoices() | % {$_.VoiceInfo.Name}'
    args.push(psCommand)
    return { command: COMMAND, args }
  }
}

module.exports = SayPlatformWin32

},{"./base.js":6,"child_process":1}],10:[function(require,module,exports){
"use strict";
const say = require("say");
// https://github.com/lukePeavey/quotable/blob/master/README.md
// https://docs.google.com/spreadsheets/d/1nonN5nXNe9cbVJKJsNHXE3h2ECXyEwWfDIrknJAa8jA/edit#gid=0
const btnUnKnown = document.querySelector(".un-known-words");
const btnKnown = document.querySelector(".known-words");
const btnRight = document.querySelector(".right");
const btnLeft = document.querySelector(".left");
const lblWord = document.querySelector(".word");
const quote = document.querySelector(".quote");
const img = document.querySelector(".image");
let translation = "";
let knownWords = false;
const sheetId = "1nonN5nXNe9cbVJKJsNHXE3h2ECXyEwWfDIrknJAa8jA";
const base = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?`;
const sheetName = "list";
const query = encodeURI("Select *");
const url = `${base}&sheet=${sheetName}&tq=${query}`;
let wordList = null;
console.log(url);
const getSheetData = async url => {
  const response = await fetch(url);
  const text = await response.text();
  const listObj = JSON.parse(text.match(/{[\s\S]+}/)).table.rows;
  wordList = listObj;
  console.log(wordList.length);
  document.querySelector("#w").innerHTML = JSON.stringify(
    getRandomRow(wordList),
    null,
    4
  );
  updateWord(Math.random() < 0.5);
};
updateQuote();
btnLeft.addEventListener("click", e => updateWord(Math.random() < 0.5));
btnRight.addEventListener("click", e => updateWord(Math.random() < 0.5));
lblWord.addEventListener("click", e => {
  [translation, e.target.innerHTML] = [e.target.innerHTML, translation];
});
btnKnown.addEventListener("click", e => (knownWords = true));
btnUnKnown.addEventListener("click", e => (knownWords = false));
function updateWord(isEnglish) {
  const row = getRandomRow(wordList, knownWords);
  console.log(lblWord);
  lblWord.innerHTML = isEnglish ? row.c[0].v : row.c[1].v;
  translation = isEnglish ? row.c[1].v : row.c[0].v;
}
function getRandomRow(wordList, known) {
  const filterWordList = wordList.filter(row =>
    known ? row.c[2].v : !row.c[2].v
  );
  const randomRow = filterWordList[~~(Math.random() * filterWordList.length)];
  return randomRow;
  //   console.log(JSON.stringify(filterWordList) );
}
async function updateQuote() {
  let response = await fetch("https://api.quotable.io/random?&maxLength=50");
  let data = await response.json();
  quote.innerHTML = data.content;
  document.querySelector(".author").innerHTML = data.author;
}
getSheetData(url);

},{"say":5}]},{},[10]);
