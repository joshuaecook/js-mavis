/**
 * 
 *
 * @author Joshua E Cook
 * @version $Id$
 * @copyright __MyCompanyName__, 27 April, 2007
 * @package itertools
 **/
var itertools =
  {
  /**
   * Creates an iterator object that treats several, consecutive iterable sequence as a single sequence.
   **/
  chain : function( iterableA, iterableB/*, ... */ )
    {
    switch ( arguments.length )
      {
      case 0 : return iter(list());
      case 1 : return iter(arguments[0]);
      }
    
    var iters = map(iter,arguments);
    return {
      next : function()
        {
        var it,obj;

        while ( 1 < iters.length )
          {
          it = iters[0];
          
          try
            { obj = it.next();  }
          catch ( e )
            {
            if ( e !== StopIteration ) 
              { throw e;  }
              
            iters.shift();
            continue;
            }
          
          break;
          }
        
        if ( 1 === iters.length )
          {
          it = iters[0];
          this.next = bind("next",it);
          obj = this.next();
          }
        
        return obj;
        }
      };
    },
    
  /**
   * Creates an interator object that produces an infinite arithmetic progression starting with n.
   **/
  count : function( n )
    {
    if ( 0 === cmp(undefined,n) ) 
      { n = 0;  }
    
    return {
      next : function()
        { return n++;  }
      };
    },
    
  /**
   * Creates an iterator object that repeatedly, indefinitely returns the elements from an iterable sequence.
   **/
  cycle : function( iterable )
    {
    var it = iter(iterable),
        got_all = false,
        saved = [];
    
    return {
      next : function()
        {
        var obj;
        
        try
          {
          obj = it.next();
          if ( !got_all ) 
            { saved.push(obj);  }
          }
        catch ( e )
          {
          if ( e !== StopIteration )
            { throw e;  }
            
          got_all = true;
          it = iter(saved);
          obj = it.next();
          }
        
        return obj;
        }
      };
    },
    
  /**
   * Creates an iterator object that returns the elements of an iterable sequence for which a predicate holds true.
   **/
  ifilter : function( predicate, iterable )
    {
    if ( 0 === cmp(undefined,predicate) ) 
      { predicate = function (x) { return !!x;  };  }
      
    var it = iter(iterable);
    
    return {
      next : function()
        {
        var obj;
        
        while ( true )
          {
          try
            {
            obj = it.next();
            if ( !predicate(obj) ) 
              { continue;  }
            break;
            }
          catch ( e )
            {
            if ( e !== StopIteration ) 
              { throw e;  }
              
            this.next = function() 
              { throw StopIteration;  };
            this.next();
            }
          }
        
        return obj;
        }
      };
    },
    
  /**
   * Creates an iterator object that computes the result of applying f to each item in the given iterable sequence.
   **/
  imap : function( f, iterable/*, ... */ )
    {
    var iters = map(iter,list(arguments).slice(1)),
        next = function( it ) { return it.next();  };
               
    if ( 0 === cmp(undefined,f) )
      {
      f = 1 === iters.length ? 
          identity : 
          function() { return list(arguments);  };
      }
    
    return {
      next : function()
        {
        var row = [];
        
        try
          {
          for ( var i in iters )
            { row.push(iters[i].next());  }
            
          return f.apply(this,row);
          }
        catch ( e )
          {
          if ( e !== StopIteration ) 
            { throw e;  }
            
          this.next = function() { throw StopIteration;  };
          this.next();
          }
        }
      };
    }
  };