/**
 * 
 *
 * @author Joshua E Cook
 * @version $Id$
 * @copyright __MyCompanyName__, 27 April, 2007
 * @package test
 **/ 
var test = (function()
  {
  var assertions,
      cmp = function ( x, y )
        {
        if ( x === y )
          { return 0;  }
        if ( x < y )
          { return -1;  }
        if ( x > y )
          { return 1;  }
        },
      event,
      events,
      object = function ( obj )
        {
        if ( undefined === obj )
          { obj = {};  }

        var T = function () {};
        T.prototype = obj;
        return new T();
        },
      result,
      results;

    
  assertions = {
    /**
     * Fails with the given message.
     **/
    fail : function ( message )
      { throw { name: "FailedAssertion", message: message };  },  

    /**
     * Fails if the given value is false.
     **/
    assertTrue : function ( message, bool )
      {
      if ( !bool )
        { assertions.fail(message);  }
      },

    /**
     * Fails if the given value is true.
     **/
    assertNotTrue : function ( message, bool )
      {
      if ( bool )
        { assertions.fail(message);  }
      },
      
    /**
     * Fails if the given message is not the empty string.
     **/
    assertString : function ( message )
      {
      if ( "" === message )
        { assertions.fail(message);  }
      },

    /**
     * Fails if the expected value does not compare to the actual value.
     *
     * Additional parameters may be given in the defaults object.  The key
     * "printer" in defaults may be associated with a function used to 
     * convert the values to strings.  The key "message" may be associated
     * with a string that will be printed on failure.
     **/
    assertEqual : function ( expected, actual, defaults )
      {
      var compare,
          error_message,
          fail = assertions.fail;
      
      defaults = defaults || {};
      compare = defaults.compare || cmp;

      error_message = function ( printer, message )
        {
        if (!( printer || message ))
          { return "not equal";  }
        if ( !printer && message )
          { return message + "\nnot equal";  }
        else if ( printer && !message )
          { 
          return "expected " + printer(expected) + 
                 " but got "+printer(actual);  
          }
        else if ( printer && message )
          {
          return message + 
                 "\nexpected " + printer(expected) + 
                 " but got "+printer(actual);
          }
        };

      if ( 0 !== compare(expected,actual) )
        { fail(error_message(defaults.printer,defaults.message));  }
      },

    /**
     * Fails if the expected value does compare to the actual value.
     *
     * Additional parameters may be given in the defaults object.  The key
     * "printer" in defaults may be associated with a function used to 
     * convert the values to strings.  The key "message" may be associated
     * with a string that will be printed on failure.
     **/
    assertNotEqual : function ( expected, actual, defaults )
      {
      var compare,
          error_message,
          fail = assertions.fail;
      
      defaults = defaults || {};
      compare = defaults.compare || cmp;

      error_message = function ( printer, message )
        {
        if (!( printer || message ))
          { return "not equal";  }
        if ( !printer && message )
          { return message + "\nnot equal";  }
        else if ( printer && !message )
          { 
          return "did not expect " + printer(expected) +
                 " but got "+printer(actual); 
          }
        else if ( printer && message )
          {
          return message + 
                 "\ndid not expect " + printer(expected) + 
                 " but got "+printer(actual);
          }
        };

      if ( 0 === compare(expected,actual) )
        { fail(error_message(defaults.printer,defaults.message));  }
      },

    /**
     * Fails if the function f does not raise an error like the one
     * given as an argument.
     **/
    assertRaises : function ( errorT, f, message )
      {
      var msg = message || "expected error not raised",
          fail = assertions.fail,
          bool = assertions.assertBool;

      try 
        {
        f();
        fail(msg);
        }
      catch ( e )
        { bool(msg,e instanceof errorT);  }
      }
    };
    
  event = 
    {
    Start: function ( path )
      { return { name: "Start", path: path  };  },
    End: function ( path )
      { return { name: "End", path: path  };  },
    Result: function ( path, result )
      { return { name: "Result", path: path, result: result  };  }
    };
  
  events = 
    {
    isStart: function( e )
      { return "Start" === e.name;  },
    isEnd: function( e )
      { return "End" === e.name;  },
    isResult: function( e )
      { return "Result" === e.name;  }
    };
  
  result = 
    {
    Success: function ( path )
      { return { name: "Success", path: path  };  },
    Failure: function ( path, message )
      { return { name: "Failure", path: path, message: message  };  },
    Error: function ( path, error )
      { return { name: "Error", path: path, error: error  };  }
    };
  
  results = 
    {
    isSuccess: function ( r )
      { return "Success" === r.name;  },
    isFailure: function ( r )
      { return "Failure" === r.name;  },
    isError: function ( r )
      { return "Error" === r.name;  },
    type: function ( r )
      { return r.name;  },
    message: function ( r )
      {
      if ( results.isSuccess(r) )
        { return "Success";  }
      if ( results.isFailure(r) )
        { return r.message;  }
      if ( results.isError(r) )
        { return r.error.message;  }
      }
    };

  var run = function ( report, path, f )
    {
    var r,
        start = event.Start,
        success = result.Success,
        failure = result.Failure,
        err = result.Error,
        res = event.Result,
        end = event.End;

    report(start(path));
    
    try
      {
      f();
      r = success(path);
      }
    catch ( e )
      {
      if ( "FailedAssertion" === e.name )
        { r = failure(path,e.message);  }
      else
        { r = err(path,e);  }
      }
    
    report(res(path,r));
    report(end(path));
    
    return r;
    };

  return (function()
    {
    var that = object(assertions);

    /**
     * Scaffolds a function with a setup and teardown function.
     *
     * Returns a function that, when called, first computes the result
     * of the setup function.  The return value is passed as an argument
     * to the function f.  Finally, the same return value is passed as
     * an argument to the teardown function.
     *
     * Any errors raised in the execution setup or f functions will
     * be raised again unmodified.  The teardown function will be executed
     * before any errors are re-raised.
     **/
    that.fixture = function ( setup, teardown, f )
      {
      return function ()
        {
        var fixed = setup();

        try
          {
          f(fixed);
          teardown(fixed);
          }
        catch ( e )
          {
          teardown(fixed);
          throw e;
          }
        };
      };
        
    /**
     * Returns a test runner which uses the given report function to
     * print testing events and results.
     **/
    that.runner = function ( report )
      {
      return function ( suite )
        { return [].concat(suite(report,[]));  };
      };
    
    /**
     * Creates a test case from a given test function.
     **/
    that.testcase = function ( f )
      {
      return function ( report, path )
        { return run(report,path,f);  };
      };
    
    /**
     * Creates a labelled test case from a given testcase.
     **/
    that.label = function ( label, testcase )
      {
      return function ( report, path )
        { return testcase(report,path.concat(label));  };
      };
    
    /**
     * Creates a test suite from a given list of test cases.
     **/
    that.suite = function ( f/* ... */ )
      {
      var argc,
          argv = Array.prototype.slice.apply(arguments,[0]);
      
      argc = argv.length;

      return function ( report, path )
        {
        var i, r = [];
        
        for ( i=0;  i<argc;  ++i )
          { r = r.concat(argv[i](report,path));  }
          
        return r;
        };
      };

    that.result = results;
    that.event = events;    
    return that;
    })();
  })(); 
