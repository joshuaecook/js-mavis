if ( 'undefined' === typeof test )
  { throw 'test-base depends on test package';  }
if ( 'undefined' === typeof cmp )
  { throw 'test-base depends on base package';  }

var tests;
if ( 'undefined' === typeof tests ) 
  { tests = {}; }

tests.base = (function ( runner )
  {
  // simulated compatibility with MochiTest
  var is = function ( expected, actual, message )
    {
    var defaults = {cmp:cmp, printer: String, message: message  };
    return test.assertEqual(expected,actual,defaults);
    };
  var isnt = function ( expected, actual, message )
    {
    var defaults = {cmp:cmp, printer: String, message: message  };
    return test.assertNotEqual(expected,actual,defaults);
    }
  var ok = function ( value, message )
    { return test.assertTrue(message,value);  };
  var veto = function ( value, message )
    { return test.assertNotTrue(message,value);  };

  var fix = function ( f )
    {
    var setup = function ()
      {
      var T = function ( value ) { this.value = value;  };
      T.prototype.func = function () { return this.value;  };
      return T;
      };
    var teardown = function () {};

    return test.fixture(setup,teardown,f);
    };
  
  var l = test.label;
  var s = test.suite;
  var t = test.testcase;

  return l("base",s(
    l("identity",s(
      t(function ()
        {
        var foo = "boring";
        var bar = identity(foo);
      
        is(foo,bar,"(String) foo should identify with bar");
        }),
      t(fix(function ( T )
        {
        var obj = new T("boring");
        var obj2 = identity(obj);
        
        is(obj,obj2,"(Object) obj should identify with obj2");
        }))
      )),
    l("callable",t(fix(function ( T )
      {
      var obj = new T("boring");
      ok(is_callable(T),"constructor should be callable");
      ok(is_callable(obj.func),"member function should be callable");
      })))
    ));
  })();