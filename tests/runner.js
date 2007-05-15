if ( 'undefined' === typeof test )
  { throw "runner depends on test package"  }

var runner = test.runner(function ( event )
  {
  if ( test.event.isStart(event) )
    { document.write(event.path.join(':')+"\n");  }
  else if ( test.event.isResult(event) )
    {
    if ( test.result.isSuccess(event.result) )
      { document.write("ok\n");  }
    else if ( test.result.isFailure(event.result) )
      { document.write("FAIL: "+test.result.message(event.result)+"\n");  }
    else if ( test.result.isError(event.result) )
      { document.write("ERROR: "+test.result.message(event.result)+"\n");  }
    }
  else if ( test.event.isEnd(event) )
    {
    document.write("\n");
    }
  });
