/**
 * 
 *
 * @author Joshua E Cook
 * @version $Id$
 * @copyright __MyCompanyName__, 27 April, 2007
 * @package default
 **/

var NotFound = 
  { name: "NotFound", message: "Not Found" };
  
var StopIteration = 
  { name: "StopIteration", message: "Stop Iteration" };

/**
 * Creates a new object with the given object as its prototype.
 *
 * If no argument is given, creates a new, anonymous object.
 **/
function object( obj )
  {
  if ( undefined === obj )
    { return {};  }
    
  var T = function () {};
  T.prototype = obj;
  return new T();
  }

/**
 * Coerces an object into a boolean value.
 *
 * Returns false for false, 0, NaN, null, undefined, or an empty string.
 * Returns true for all other values
 **/
function truthy( obj )
  { return !!obj;  }

/**
 * The idendity function.
 **/
function identity( obj )
  { return obj;  }

/**
 * Always returns true.
 **/
function pass() 
  { return true;  }

/**
 * Always returns false.
 **/
function fail()
  { return false;  }

/**
 * Returns true if the given object appears callable.
 **/
function is_callable( obj )
  {
  return (undefined !== obj) &&
         ( obj instanceof Function || 
           obj.call instanceof Function );
  }

/**
 * Creates an adapter from a selection of predicates and bridges.
 **/
function match( predicate1, bridge1 /*, ... */ )
  {
  var argc = arguments.length,
      argv = arguments;
  
  return function ()
    {
    var bridge,
        i;
        
    for ( i=0;  i<argc;  i+=2 )
      {
      if ( !argv[i].apply(this,arguments) ) 
        { continue;  }
        
      bridge = argv[1+i];
      break;
      }
      
    if ( undefined === bridge ) 
      { throw NotFound;  }
      
    return bridge.apply(this,arguments);
    };
  }

/**
 * Compares two objects and returns a negative integer if x < y,
 * zero if x == y, and a positive integer ix x > y.
 **/
var cmp = (function ( adapter )
  {
  return function ( x, y )
    {
    if ( x == y )
      { return 0;  }

    var c,
        primitive = 
          {"boolean": true, string: true, number: true, "undefined": true},
        x_is_null = (undefined === x || null === x),
        y_is_null = (undefined === y || null === y);

    if ( x_is_null && y_is_null )
      { return 0;  }
    if ( x_is_null )
      { return -1;  }
    if ( y_is_null )
      { return 1;  }

    if ( primitive[typeof x] && primitive[typeof y] )
      {
      if ( x < y )
        { return -1;  }
      if ( x > y )
        { return 1;  }
      }    

    try
      { return adapter(x,y);  }
    catch ( e )
      {
      if ( e === NotFound ) 
        { throw new TypeError();  }
      throw e;
      }
    };
  })(match(
    // Array-like comparison
    function ( a, b ) 
      {
      return 0 !== cmp(undefined,a) && 
             !is_callable(a) && 
             "number" === typeof a.length &&
             0 !== cmp(undefined,b) &&
             !is_callable(b) &&
             "number" === typeof b.length;
      },
    function ( a, b )
      {
      var c,
          i,
          m = a.length,
          n = b.length;

      if ( 0 === n && 0 === n )
        { return 0;  }
      if ( m < n )
        { return -1;  }
      if ( m > n )
        { return 1;  }

      for ( i=0;  i<n;  ++i )
        {
        c = cmp(a[i],b[i]);
        if ( 0 === c ) 
          { continue;  }
        break;
        }

      return c;
      }
    ));

/**
 * Returns true if the object has the specified named property.
 **/
function hasattr( obj, name )
  { return undefined !== obj[name];  }

/**
 * Returns the value of the named property of object.
 **/
function getattr( obj, name, defaultValue )
  {
  if ( undefined !== obj[name] )
    { return obj[name];  }

  if ( undefined !== defaultValue )
    { return defaultValue;  }
  
  throw new ReferenceError();
  }

/**
 * Assigns a value to the named property of an object.
 **/
function setattr( obj, name, value )
  { obj[name] = value;  }

/**
 * Removes the named property from an object
 **/
function delattr( obj, name )
  { delete obj[name];  }

/**
 * Returns the length of an object.
 **/
function len( obj )
  {
  if ( undefined === obj.length && "number" !== typeof obj.length )
    { return undefined;  }
    
  return obj.length
  }

/**
 * Creates an iterator object.
 *
 * If only a single argument is given, the given object must support the iteration protocol
 * or the sequence protocol.  A TypeError is raised if it does not support either of these.
 *
 * If a second argument is given, the first argument must be a callable object.  The iterator
 * will call it will no arguments for each call to its own next() method.  StopIteration will
 * be raised when the value returned is equal to the second given argument.
 **/
var iter = (function ()
  {
  var adapter,
      iteration,
      until;
      
  iteration =
    {
    iter: function ()
      { return this;  },
    
    next: function ()
      { throw StopIteration;  },
      
    stop: function ()
      {
      this.next = function () 
        { throw StopIteration;  };
      this.next();
      }
    };
    
  until = function ( predicate, f )
    {
    var it = iter(f);
    var new_it = object(it);
    
    new_it.next = function ()
      {
      var v = it.next();
      if ( predicate(v) )
        { this.stop();  }
      return v;
      };

    return new_it;
    };
    
  adapter = match(
    // Iteration protocol
    function ( x ) 
      { return is_callable(x.next);  },
    identity,

    function ( x ) 
      { return is_callable(x.iter);  },
    function ( x ) 
      { return x.iter();  },

    // Array-like iteration
    function ( x ) 
      { 
      return 0 !== cmp(undefined,x) && 
             !is_callable(x) &&
             "number" === typeof x.length;
      },
    function ( x )
      {
      var i = 0,
          it = object(iteration),
          n = x.length - 1;
          
      it.next = function ()
        {
        if ( i > n ) { this.stop();  }
        return x[i++];
        };
      
      return it;
      },

    // Function iteration
    is_callable,
    function ( x )
      {
      var it = object(iteration);
      it.next = function () { return x();  };
      return it;  
      });
  
  return function ( obj, sentinel )
    {
    var it;
  
    if ( 2 === arguments.length )
      { 
      it = until(function (x) 
        { return 0 === cmp(x,sentinel);  },obj);
      }
    else if ( 1 === arguments.length )
      {
      try
        { it = adapter(obj);  }
      catch ( e )
        {
        if ( e === NotFound ) 
          { throw new TypeError();  }
        
        throw e;
        }
      }
    return it;
    };
  })();

/**
 * Creates an enumerator object.
 *
 * The given argument must be an object that supports iteration.  The next()
 * method of the enumerator returns a tuplle containing the index (from zero)
 * and the corresponding value obtained by iteration over the given object.
 **/
function enumerate( iterable )
  {
  var it = iter(iterable);
  var new_it = object(it);
  var n = 0;

  new_it.next = function ()
    {
    var v = it.next();
    return [n++,v];
    };

  return new_it;
  }

/**
 * Creates a list containing an arithmetic progression.
 **/
function range( start, stop, step )
  {
  if ( 2 >= arguments.length )
    { step = 1; }
  if ( 1 === arguments.length )
    {
    stop = start;
    start = 0;
    }
    
  if ( 0 === step )
    { return [];  }
  
  var i,
      invariant = step > 0 ?
                  function (x) { return x < stop;  } :
                  function (x) { return x > stop;  },
      r = [];
  
  for ( i=start;  invariant(i);  i+=step )
    { r.push(i);  }

  return r;
  }

/**
 * TODO: write doc
 **/
function foreach( f, iterable )
  {
  if ( 0 === cmp(undefined,f) ) 
    { f = identity;  }
    
  var it = iter(iterable);
  
  try
    {
    while ( true )
      { f(it.next());  }
    }
  catch ( e )
    {
    if ( e !== StopIteration )
      { throw e;  }
    }
  }

/**
 * Creates a list containing the same items in the same order as those in the given sequence.
 *
 * The given argument must support iteration.  Returns an empty list when no argument is given.
 **/
var list = (function ( adapter )
  {
  return function ( sequence )
    {
    if ( 0 === cmp(undefined,sequence) ) 
      { return [];  }
    
    try
      { return adapter(sequence);  }
    catch ( e )
      {
      if ( e === NotFound ) 
        { throw new TypeError();  }
      throw e;
      }
    };
  })(match(
    // iterator
    function ( x ) { return is_callable(x.next);  },
    function ( x )
      {
      var ary = [];

      try
        {
        while ( true )
          { ary.push(x.next());  }
        }
      catch ( e )
        {
        if ( e !== StopIteration )
          { throw e;  }
        }

      return ary;
      },

    // iteration protocol
    function ( x ) { return is_callable(x.iter);  },
    function ( x ) { return list(x.iter());  },

    // true Array sequence
    function ( x ) { return x instanceof Array;  },
    function ( x ) { return x.slice(0);  },

    // string sequence
    function ( x ) { return "string" === typeof x;  },
    function ( x ) { return x.split('');  },

    // other Array-like sequence
    function ( x ) 
      { 
      return 0 !== cmp(undefined,x) &&
             !is_callable(x) &&
             "number" === typeof x.length;
      },
    function ( x )
      {
      var ary = [],
          i,
          n = x.length;
          
      for ( i=0;  i<n;  ++i )
        { ary[i] = x[i];  }

      return ary;
      },

    pass,
    function ( x ) { return [x];  }));

/**
 * Returns true if any element of the iterable object is true.
 **/
function any( iterable )
  {
  var res = false;
  
  foreach(function (x)
    {
    if ( x )
      {
      res = true;
      throw StopIteration;
      }
    },
    iterable);
  
  return res;
  }

/**
 * Returns true if all elements of the iterable object are true.
 **/
function all( iterable )
  {
  var res = true;
  
  foreach(function (x)
    {
    if ( !x )
      {
      res = false;
      throw StopIteration;
      }
    },
    iterable);
  
  return res;
  }

/**
 * Creates a list containing the elements of an iterable object for which a predicate holds true.
 *
 * If the given predicate is undefined, the truthy predicate is used.
 **/
function filter( predicate, iterable )
  {
  if ( 0 === cmp(undefined,predicate) ) 
    { predicate = truthy;  }
    
  var it = iter(iterable),
      list = [],
      v;

  try
    {
    while ( true )
      {
      v = it.next();
      if ( 0 === cmp(false,predicate(v)) ) 
        { continue;  }
      list.push(v);
      }
    }
  catch ( e )
    {
    if ( e !== StopIteration )
      { throw e;  }
    }
  
  return list;
  }

/**
 * Returns a list of n tuples, with n being the length of the shortest argument,
 * where the i'th tuple contains the i'th element from each argument.
 *
 * Returns an empty list if no arguments are given.
 **/
function zip( iterable/*, ... */ )
  {
  if ( 0 === arguments.length ) 
    { return [];  }
    
  var i,
      iters = [],
      res = [],
      row;
  
  foreach(function (x)
    { iters.push(iter(x));  },
    list(arguments));

  var argc = iters.length,
      push = function ( x ) { res.push(x);  };
  
  try
    {      
    if ( 1 < argc )
      {
      while ( true )
        {
        row = [];
        for ( i=0;  i<argc;  ++i )
          { row.push(iters[i].next());  }
        push(row);
        }
      }
    else
      {
      while ( true )
        { push(iters[0].next());  }
      }
    }
  catch ( e )
    {
    if ( e !== StopIteration )
      { throw e;  }
    }
  
  return res;
  }

/**
 * Creates a list containing the result of applying f to every item in the given iterable argument.
 *
 * If additional iterable arguments are given, f must accept that many arguments, and is applied to
 * all of the iterables in parrallel.
 **/
function map ( f, iterable/*, ... */ )
  {
  var res = [];
  var iters = [];
  var row;
  
  foreach(function (x)
    { iters.push(iter(x));  },
    list(arguments).slice(1));

  var argc = iters.length;
  var push = ( 0 === cmp(undefined,f) ) ?
             function ( x ) { res.push(x);  } :
             function ( x ) { res.push(f.apply(this,x));  };
  var stops = 0;
  var i;

  // FIXME: these nested try/catch blocks are ugly, can it be refactored?
  try
    {
    while ( true )
      {
      row = [];
      for ( i=0;  i<argc;  ++i )
        {
        try
          { row.push(iters[i].next());  }
        catch ( e )
          {
          if ( e !== StopIteration )
            { throw e;  }
          if ( argc <= ++stops ) 
            { throw e;  }
          iters[i].next = pass;
          row.push(iters[i].next());
          }
        }
      
      push(row);
      }
    }
  catch ( e )
    {
    if ( e !== StopIteration )
      { throw e;  }
    }
  
  return res;
  }

/**
 * TODO: write doc
 **/
function reduce( f, iterable, initialValue )
  {
  var it = iter(iterable),
      res = undefined === initialValue ? 
            it.next() : 
            initialValue;
  
  try
    {
    while ( true )
      { res = f(res,it.next());  }
    }
  catch ( e )
    {
    if ( e !== StopIteration )
      { throw e;  }
    }

  return res;
  }

/**
 * TODO: write doc
 **/
var bind = (function ()
  {
  var do_bind = function ( f, self, argv )  
    {
    f = getattr(f,"bind.f",f);

    if ( 0 === cmp(undefined,self) )
      { self = getattr(f,"bind.self",undefined);  }

    argv = getattr(f,"bind.argv",[]).concat(argv);

    var bound = function ()
      {
      var me = arguments.callee;
      var argv = getattr(me,"bind.argv").concat(list(arguments));
      var self = getattr(me,"bind.self");
      var f = getattr(me,"bind.f");

      return f.apply(self,argv);
      };

    bound["bind.argv"] = argv;
    bound["bind.f"] = f;
    bound["bind.self"] = self;
    return bound;
    };
  
  var wrap_builtin = function ( f )
    {
    return function ()
      {
      switch (arguments.length) 
        {
        case 0: return f();
        case 1: return f(arguments[0]);
        case 2: return f(arguments[0],arguments[1]);
        case 3: return f(arguments[0],arguments[1],arguments[2]);
        }

      return eval("(f(arguments[0],arguments[1],arguments[2],arguments[" +
                  range(3,arguments.length).join("],arguments[") +
                  "]))");
      };  
    };
  
  var adapter = match(
    function ( f, self, argv ) 
      { return "string" === typeof f && is_callable(self[f]);  },
    function ( f, self, argv ) 
      { return do_bind(self[f],self,argv);  },

    function ( f, self, argv ) 
      { return is_callable(f) && undefined === f.apply;  },
    function ( f, self, argv ) 
      { return do_bind(wrap_builtin(f),self,argv);  },

    function ( f, self, argv ) 
      { return is_callable(f);  },
    do_bind);
  
  return function ( f, self/* ... */ )
    {
    var a = arguments;
    return adapter(f,self,list(arguments).slice(2));
    };
  })();
