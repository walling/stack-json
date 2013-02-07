stack-json
==========

Stack traces in JSON format.

Install:

```bash
npm install stack-json
```

Usage:

```javascript
require('stack-json');

console.log(new Error().stackJSON);
// All error objects contain the stackJSON property.
```

The property is lazy-loaded and as such does not harm the performance of your production code. However generating the JSON stack trace can take a while (not very long, but it is looking up files synchronously, if not already cached).

Since the module use [stack-chain] to do the stack trace magic, you can use it together with other modules that provides stack trace features. For example you can use it with [trace], which gives you a nice long stack trace in asynchronous code (mainly when debugging):

```javascript
require('stack-json');
require('trace'); // load it after this module

setTimeout(function() {
  try {
    explode;
  } catch (error) {
    console.log(error.stackJSON);
  }
}, 100);
```

You can create your own formatted stack traces. This is the technique that [stack-formatted] use. Here is a short example:

```javascript
function format(stack) {
  return stack.frames.map(function(frame) {
    return '  ' + frame.pkg.name +
      '  ' + frame.filename + ':' + frame.line +
      '  ' + (frame.functionName || '(anon)');
  }).join('\n');
}

console.log(format(new Error().stackJSON));
```

The package information in each stack frame (the `pkg` property) is gathered using the [package-lookup] module.


[stack-chain]: https://github.com/AndreasMadsen/stack-chain
[trace]: https://github.com/AndreasMadsen/trace
[stack-formatted]: https://github.com/walling/stack-formatted
[package-lookup]: https://github.com/walling/package-lookup
