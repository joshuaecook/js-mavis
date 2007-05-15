if ( 'undefined' === typeof test )
  { throw 'test-test depends on test package';  }

var tests;
if ( 'undefined' === typeof tests ) 
  { tests = {}; }

tests.test = (function ( runner )
  {
  // simulated compatibility with MochiTest
  var is = function ( expected, actual, message )
    {
    var defaults = {printer: String, message: message  };
    return test.assertEqual(expected,actual,defaults);
    };
  var ok = function ( value, message )
    {
    return test.assertTrue(message,value);
    };

  var fix = function ( f )
    {
    var setup = function ()
      {
      var T = function ( value ) { this.value = value;  };
      T.prototype.func = function () { return this.value;  };
      T.prototype.err = function ( err ) { throw err;  };
      return T;
      };
    var teardown = function () {};

    return test.fixture(setup,teardown,f);
    };
  
  var l = test.label;
  var s = test.suite;
  var t = test.testcase;

  return l("boring package",s(
    l("boring",t(fix(function (T)
      {
      var o = new T("boring");
      ok(o.func instanceof Function,"func should be a Function");
      is("boring",o.func(),"func() should be 'boring'");
      }))),
    l("boring2",t(function ()
      {
      var ary = ['a','b','c'];
      is(3,ary.length,"length should be 3");
      })),
    l("fail",t(function ()
      {
      test.fail("this should fail")
      })),
    l("raise",s(
      t(fix(function ( T )
        {
        var o = new T("boring");
        var f = function () { o.err("boring error");  };
        test.assertRaises("boring error",f,"'boring error' should be raised")
        })),
      t(function ()
        {
        var f = function () { throw new TypeError();  }
        test.assertRaises(TypeError,f,"a TypeError should be raised")
        })
      ))
    ));
  })();