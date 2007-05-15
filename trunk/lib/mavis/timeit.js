/**
 * 
 *
 * @author Joshua E Cook
 * @version $Id$
 * @copyright __MyCompanyName__, 27 April, 2007
 * @package timeit
 **/
var timeit =
  {
  /**
   * Executes a given function f and returns a tuple containing the execution time in ms 
   * and the return value of the function.
   *
   * Any additional arguments are passed along to the given function.
   **/
  timeit : function( f/*, ... */ )
    {
    var argv = list(arguments).slice(1),
        end,
        start,
        value;

    start = new Date();
    value = f.apply(this,argv);
    end = new Date();
        
    return [end.getTime() - start.getTime(),value];
    },
  /**
   * Executes a given function f a number of times and returns the total execution time in ms.
   *
   * If a number of iterations is not given, the default number is 1000000.
   *
   * Any additional arguments are passed along to the given function.
   **/
  iterate : function( iterations, f )
    {
    if ( 0 === cmp(undefined,iterations) ) 
      { iterations = 1000000;  }

    var ti = timeit.timeit,
        totaltime = 0;
    
    while ( 0 < iterations-- )
      { totaltime += ti(f).shift();  }
    
    return totaltime;
    },
  /**
   * Repeatedly executes a function a number of times and returns an array containin
   * total executution time in ms of each repetition.
   *
   * If a number of repetitions is not given, the default number is 3.
   *
   * If a number of iterations is not given, the default number is the default for iterate().
   *
   * Any additional arguments are passed along to the given function.
   **/
  repeat : function( repititions, iterations, f )
    {
    if ( 0 === cmp(undefined,repititions) ) 
      { repititions = 3;  }
      
    var ti = timeit.timeit,
        times = [];
    
    while ( 0 < repititions-- )
      { times.push(ti(f,iterations));  }
    
    return times;
    }
  };
