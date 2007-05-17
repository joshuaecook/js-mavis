/*!
 * @header base.js
 *
 * @author Joshua E Cook
 * @version $Id$
 * @copyright Joshua E Cook, 27 April, 2007
 *
 * @discussion Basic functional programming tools.
 *
 * @encoding utf-8
 */

/*! @var NotFound
 * TODO: write doc
 */
var NotFound = 
  { name: "NotFound", message: "Not Found" };
  
/*! @var StopIteration
 * TODO: write doc
 */
var StopIteration = 
  { name: "StopIteration", message: "Stop Iteration" };

/*! @function object
 * @abstract Creates a new object.
 * @param proto A prototype object.
 *
 * @discussion If no prototype is given, a new, empty object is used.
 *
 * @return A new object.
 */
function object( proto )
  {
  proto = proto || {}
  
  var T = function () {};
  T.prototype = proto;
  return new T();
  }

/*! @function truthy
 * @abstract Coerces an object into a boolean value.
 * @param obj An object.
 *
 * @return A boolean value.  <var>false</var> for <var>false</var>, <var>0</var>, <var>NaN</var>, <var>null</var>, <var>undefined</var>, or an empty string, <var>true</var> for all other values.
 */
function truthy( obj )
  { return !!obj;  }

/*! @function identity
 * @abstract The identity function.
 * @param obj An object.
 *
 * @return The same object.
 */
function identity( obj )
  { return obj;  }

/*! @function pass
 * @abstract The truth constant.
 *
 * @return <var>true</var>.
 */
function pass() 
  { return true;  }

/*! @function fail
 * @abstract The falsity constant.
 *
 * @return <var>false</var>.
 */
function fail()
  { return false;  }

/*! @function callable
 * @abstract Determines if an object appears callable.
 * @param obj An object.
 *
 * Returns <var>true</var> if the given object appears callable.
 */
function is_callable( obj )
  {
  return (undefined !== obj) &&
         ( obj instanceof Function || 
           obj.call instanceof Function );
  }

/*!
 * Creates an adapter from a selection of predicates and bridges.
 */
function match( predicate1, bridge1 )
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

/*!
 * Compares two objects and returns a negative integer if <var>x</var> is less than <var>y</var>,
 * zero if <var>x</var> and <var>y</var> are equal, or a positive integer if <var>x</var> is greater than <var>y</var>.
 */
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

/*! @function hasattr
 * @abstract Determines if the object has a property with the given name.
 * @param obj An object.
 * @param name The name of a property.
 *
 * @return A boolean value, <var>true</var> if the object has the named property, <var>false</var> otherwise.
 */
function hasattr( obj, name )
  { return undefined !== obj[name];  }

/*! @function getattr
 * @abstract Retrieves the value of the property of an object.
 * @param obj An object.
 * @param name The name of a property.
 * @param defaultValue A default value.
 *
 * @throws ReferenceError if both the property and the default value are undefined.
 *
 * @return The value of the property of the object if it is not <var>undefined</var>, or <var>defaultValue</var> if the property of the object is <var>undefined</var> and <var>defaultValue</var> is not <var>undefined</var>.
 */
function getattr( obj, name, defaultValue )
  {

  if ( undefined === obj[name] )
    {
    if ( undefined === defaultValue )
      { throw new ReferenceError();  }
    
    return defaultValue;
    }
  
  return obj[name];
  }

/*! @function setattr
 * @abstract Assigns a value to a property of an object.
 * @param obj An object.
 * @param name The name of a property.
 * @param value The new value.
 * 
 * @return The object.
 */
function setattr( obj, name, value )
  { 
  obj[name] = value;
  return obj;
  }

/*! @function delattr
 * @abstract Removes a property from an object.
 * @param obj An object.
 * @param name The name of a property.
 * 
 * @return The object.
 */
function delattr( obj, name )
  { 
  delete obj[name];
  return obj;
  }

/*! @function len
 * @abstract Determines the length of an object.
 * @param obj An object.
 *
 * @return The length of the object, or <var>undefined</var> if the object does not have a length.
 */
function len( obj )
  {
  if ( undefined === obj.length && "number" !== typeof obj.length )
    { return undefined;  }
  
  return obj.length
  }

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
  
  /*! @function iter
   * @abstract Creates an iterator object.
   * @param obj An iterable sequence or a callable object.
   * @param sentinel A value.
   * @throws TypeError if a single parameter is given and the object does not support iteration.
   *
   * @discussion If only a single argument is given, the given object must support the iteration protocol
   * or the sequence protocol.
   * 
   * If a second argument is given, the first argument must be a callable object.  The iterator
   * will invoke it will no arguments for each call to its own <var>next</var> method.  <var>StopIteration</var> will
   * be raised when the value returned compares equally to <var>sentinel</var>.
   *
   * @return An iterator object.
   */
  return function ( obj, sentinel )
    {
    var it;
  
    if ( 1 === arguments.length )
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
    else if ( 2 === arguments.length )
      { 
      it = until(function (x) 
        { return 0 === cmp(x,sentinel);  },obj);
      }
    
    return it;
    };
  })();

/*! @function enumerate
 * @abstract Creates an enumerating iterator.
 * @param iterable An iterable sequence.
 *
 * @discussion The <var>next</var> method of the enumerator returns a tuple 
 * containing the index (from zero) and the corresponding value obtained by
 * iteration over the given sequence.
 *
 * @return An iterator object.
 * The given argument must be an object that supports iteration.  
 */
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

/*!
 * Creates a list containing an arithmetic progression.
 */
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

/*!
 * TODO: write doc
 */
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

/*!
 * Creates a list containing the same items in the same order as those in the given sequence.
 *
 * The given argument must support iteration.  Returns an empty list when no argument is given.
 */
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

/*! @function any
 * @abstract Determines if the given predicate indicates <var>true</var> for any element of the iterable sequence.
 * @param iterable An iterable sequence.
 * @param predicate A boolean-valued function that accepts a single parameter.
 * If a predicate is not given, the @link truthy <var>truthy</var> @/link is used.
 *
 * @discussion The predicate is invoked for each element of the iterable sequence.
 * Iteration continues until the predicate indicates <var>true</var> or the sequence is exhausted.
 *
 * @return A boolean value.
 */
function any( iterable, predicate )
  {
  var res = false;
  predicate = predicate || truthy;
  
  foreach(function (x)
    {
    if ( !predicate(x) )
      { continue;  }
    res = true;
    throw StopIteration;
    },
    iterable);
  
  return res;
  }

/*! @function all
 * @abstract Determines if the given predicate indicates <var>true</var> for all elements of the iterable sequence.
 * @param iterable An iterable sequence.
 * @param predicate A boolean-valued function that accepts a single parameter.
 * If a predicate is not given, the @link truthy truthy predicate @/link is used.
 *
 * @discussion The predicate is invoked for each element of the iterable sequence.
 * Iteration continues until the predicate indicates false or the sequence is exhausted.
 *
 * @return A boolean value.
 */
function all( iterable, predicate )
  {
  var res = true;
  predicate = predicate || truthy;
  
  foreach(function (x)
    {
    if ( predicate(x) )
      { continue;  }
    res = false;
    throw StopIteration;
    },
    iterable);
  
  return res;
  }

/*! @function filter
 * @abstract Filters an iterable sequence using a given predicate.
 * @param predicate A boolean-valued function that accepts a single parameter.
 * If the given predicate is undefined, the @link truthy truthy @/link predicate is used.
 * @param iterable An iterable sequence.
 *
 * @discussion The predicate is invoked for each element of the iterable sequence.
 * Elements for which the predicate indicates <var>true</var> are appended to a new sequence.
 *
 * @throws Error Any error raised in the invocation of the predicate will be re-raised.
 *
 * @return A new sequence containing elements for which the predicate indicates <var>true</var>.
 */
function filter( predicate, iterable )
  {
  predicate = predicate || truthy;
    
  var it = iter(iterable),
      list = [],
      v;

  try
    {
    while ( true )
      {
      v = it.next();
      if ( predicate(v) )
        { list.push(v);  }
      }
    }
  catch ( e )
    {
    if ( e !== StopIteration )
      { throw e;  }
    }
  
  return list;
  }

/*! @function zip
 * @abstract Creates a sequence of tuples from multiple iterable sequences.
 * @param iterable An iterable sequence.
 *
 * @return A list of <var>n</var> tuples, with <var>n</var> being the length of the shortest argument,
 * where the <var>i</var>th tuple contains the <var>i</var>th element from each argument.  
 * Returns an empty list if no arguments are given.
 */
function zip( iterable )
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

/*! @function map
 * @abstract Applies a function to each item in a sequence.
 * @param f A function.
 * @param iterable An iterable sequence.
 *
 * @discussion If additional iterable arguments are given, <var>f</var> must accept that many arguments, and is applied to
 * all of the iterables in parallel.
 *
 * @return A sequence containing the result of applying <var>f</var> to each item in the given iterable argument(s).
 */
function map ( f, iterable )
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

/*! @function reduce
 * @abstract Cumulatively applies a function to the elements of an iterable sequence.
 * @param f A function.
 * @param iterable An iterable sequence.
 * @param initialValue The initial accumulator value.
 *
 * @discussion The function <var>f</var> should take two parameters,
 * an accumulator and the next value in sequence, and should return the result
 * of accumulating this next value.
 *
 * If <var>initialValue</var> is not <var>undefined</var>, 
 * it is used as the first value of the accumulator, and is the default
 * return value when the sequence is empty.
 *
 * For example, this application calculates the sum of a list of integers:
 * 
 * <code>reduce(function (v,w) { return v + w;  },[1,2,3,4,5],0);</code>
 * 
 * @return The result of reducing the sequence to a single value.
 */
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
  
  /*! @function bind
   * @abstract Binds the <var>this</var> reference of a function.
   * @param f A function or the name of a function.
   * @param self An object.
   *
   * @return The bound function.
   */
  return function ( f, self )
    {
    var a = arguments;
    return adapter(f,self,list(arguments).slice(2));
    };
  })();
