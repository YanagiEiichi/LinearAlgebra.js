/***********************************************************
  Author: 次碳酸钴 (admin@web-tinker.com)
  Latest: 2014-10-23
  Git: https://github.com/YanagiEiichi/LinearAlgebra

  Interface:
    vector new Vector(...)
      void toString()
      vector add(vector)
      number dot(vector)
      vector cross() //2D only
      vector cross(vector) //3D only
      vector cross(vector,vector) //4D only
      vector multiply(matrix)
      vector multipliedBy(matrix)
      number getNorm()
      void setNorm(number)
      get/set number m00 ~ m33
      get/set number xxxx ~ zzzz
    matrix new Matrix(...)
      void toString()
      void item(int,int,number)
      number item(int,int)
      matrix multiply(matrix)
      vector multiply(vector)
      matrix multipliedBy(matrix)
      vector multipliedBy(vector)
      number determinant()
      matrix transpose()
      matrix inverse()
      get/set vector rows[0-3]
      get/set vector columns[0-3]
      get/set vector r0 ~ r3
      get/set vector c0 ~ c3
      get/set number m00 ~ m33
    
***********************************************************/

var Vector,Matrix;
(function(){
  var sqrt=Math.sqrt;
  var push=Function.apply.bind(Array.prototype.push);
  function AssertConstructor(that,constructor){
    if(that instanceof constructor)return;
    throw new TypeError("Illegal constructor");
  };
  function AssertInstance(that){
    if(that instanceof Vector||that instanceof Matrix)return;
    Failed("must be instance of either `Vector` or `Matrix`.");
  };
  function AssertDimension(dimension){
    if(dimension==2||dimension==3||dimension==4)return;
    Failed("illegal dimension, it must be one of 2, 3 or 4.");
  };
  function AssertEqualDimensions(d1,d2){
    if(d1!=d2)Failed("inequal dimensions.");
  };
  function AssertValue(value){
    if(typeof value=="number"&&isFinite(value))return;
    Failed("invalid components value.");
  };
  function AssertVector(vector){
    AssertDimension(vector&&vector.length);
    for(var i=0;i<vector.length;i++)
      AssertValue(vector[i]);
  };
  function Failed(message){
    var caller=Failed.caller,prefix="";
    while(caller&&/^Assert|^$/.test(caller.name))caller=caller.caller;
    if(caller)prefix="Failed to execute `"+caller.name+"`: ";
    else message=message.replace(/^./,function(e){ return e.toUpperCase(); });
    throw new TypeError(prefix+message);
  };
  //Git from https://github.com/YanagiEiichi/flatten.js
  var flatten=function(){
    var global=Function("return this")();
    //Try to get the @@iterator.
    var iteratorSymbol=
          global.Symbol&&global.Symbol.iterator||  //Standard
          "@@iterator" in Array.prototype&&"@@iterator";  //Firefox
    //Return the interface function.
    return function(){
      var results=[];
      (function callee(args){
        var generator;
        //Record it and return if it's not an array-like or iterable object.
        if(
          typeof args!="object"||
            typeof args.length!="number"&&
            !(generator=iteratorSymbol&&args[iteratorSymbol])
        )return results.push(args);
        //Through by iterator if the generator is existed.
        if(generator){ 
          var iterator=generator.call(args),item;
          while(!(item=iterator.next()).done)
            callee(item.value);
        }else{  //Through by `length`.
          var i,length=args.length|0;
          for(i=0;i<length;i++)callee(args[i]);
        };
      })(arguments);
      return results;
    };
  }();

  /************************** Vector **********************/
  Vector=function(){
    AssertConstructor(this,Vector);
    var args=flatten(arguments);
    if(args.length==1){
      AssertDimension(args[0]);
      args=new Uint8Array(args[0]);
    }else AssertDimension(args.length);
    for(i=0;i<4;i++)this[i]=args[i]||0;
    //Set the dimension of this vector, it can't be change.
    Object.defineProperties(this,{
      "length":{value:args.length},
      "dimension":{value:args.length}
    });
    return this;
  };
  Vector.prototype=[];
  //Initialize "x" "y" "z" "w" properties for its prototype. 
  (function(){
    var chars="xyzw",indexes=[];
    for(var i=0;i<chars.length;i++)indexes[chars[i]]=i;
    (function callee(e){
      if(e.length<4)for(var i=0;i<chars.length;i++)
        callee(e.concat(chars[i]));
      if(e.length)Object.defineProperty(Vector.prototype,e.join(""),{
        get:function(){
          if(e.length==1)return this[indexes[e[0]]];
          for(var values=[],i=0;i<e.length;i++)
            values[i]=this[indexes[e[i]]];
          return new Vector(values);
        },set:function(values){
          if(e.length==1){
            AssertValue(values);
            this[indexes[e[0]]]=values;
          }else{
            AssertVector(values);
            for(var i=0;i<e.length;i++)
              this[indexes[e[i]]]=(values[i]||0);
          };
        }
      });
    })([]);
  })();
  //Initialize common methods for his prototype.
  Object.defineProperties(Vector.prototype,{
    toString:{
      writable:true,
      value:function(){
        return "("+this.map(function(e){
          return e.toFixed(4);
        }).join(",")+")";
      }
    },getNorm:{
      value:function(){
        return sqrt(this.dot(this));
      }
    },setNorm:{
      value:function(value){
        value/=this.norm;
        this.multiply(isFinite(value)?value:0);
      }
    },multiply:{
      value:function multiply(target){
        if(typeof target=="number")
          Failed("do you want to do `vector.norm*=value`?");
        if(target instanceof Vector)
          Failed("you should call explicitly `cross` or `dot` methods for the vector multiplication.");
        if(!(target instanceof Matrix))
          Failed("parameter 1 is not of type `Matrix`.");
        AssertEqualDimensions(this.dimension,target.dimension);
        var results=[];
        for(var i=0;i<this.dimension;i++)
          results[i]=this.dot(target.rows[i]);
        return new Vector(results);
      }
    },multipliedBy:{
      value:function multipliedBy(target){
        if(typeof target=="number")
          Failed("do you want to do `vector.norm*=value`?");
        if(target instanceof Vector)
          Failed("you should call explicitly `cross` or `dot` methods for the vector multiplication.");
        if(!(target instanceof Matrix))
          Failed("parameter 1 is not of type `Matrix`.");
        AssertEqualDimensions(this.dimension,target.dimension);
        var results=[];
        for(var i=0;i<this.dimension;i++)
          results[i]=this.dot(target.columns[i]);
        return new Vector(results);
      }
    },cross:{
      value:function cross(){
        switch(this.length){
          case 2:
            if(arguments.length)
              Failed("the `cross` method with 2D can't accepts any one argument.");
            return new Vector(0,0);
          case 3:
            if(arguments.length!=1)
              Failed("the `cross` method with 3D accepts only 1 argument.");
            var A=this,B=arguments[0];
            return new Vector(A[1]*B[2]-A[2]*B[1],A[2]*B[0]-A[0]*B[2],A[0]*B[1]-A[1]*B[0]);
          case 4:
            if(arguments.length!=2)
              Failed("the `cross` method with 4D accepts 2 arguments.");
            var A=this,B=arguments[0],B=arguments[1];
            return new Vector(
              A[1]*B[2]*C[3]+A[3]*B[2]*C[1], A[2]*B[3]*C[0]+A[0]*B[3]*C[2],
              A[3]*B[0]*C[1]+A[1]*B[0]*C[3], A[0]*B[1]*C[2]+A[2]*B[1]*C[0]
            );
        };
      }
    },dot:{
      value:function dot(target){
        AssertVector(target);
        AssertEqualDimensions(this.length,target.length);
        var result=0;
        for(var i=0;i<this.length;i++)
          result+=this[i]*target[i];
        return result;
      }
    },add:{
      value:function add(target){
        AssertVector(target);
        AssertEqualDimensions(this.length,target.length);
          for(var i=0;i<this.length;i++)this[i]+=vector[i];
      }
    }
  });

  /************************** Matrix **********************/
  Matrix=function(){
    AssertConstructor(this,Matrix);
    var args=flatten(arguments);
    var dimension;
    if(args.length==1){
      AssertDimension(dimension=args[0]);
      args=new Uint8Array(args[0]*args[0]);
      for(var i=0;i<args.length;i+=dimension+1)args[i]=1;
    }else AssertDimension(dimension=sqrt(args.length));
    push(this,args);
    //Install the `columns` and `rows` properties.
    var columns={},rows={};
    Object.defineProperty(columns,"length",{value:dimension});
    Object.defineProperty(rows,"length",{value:dimension});
    (function(that){
      for(var i=0;i<dimension;i++)(function(i){
        Object.defineProperty(columns,i,{
          get:function(){
            for(var s=[],j=0;j<dimension;j++)
              s[j]=that[i+j*dimension];
            return new Vector(s);
          },set:function(e){
            AssertVector(e);
            for(var j=0;j<dimension;j++)
              that[i+j*dimension]=e[j];
          }
        });
        Object.defineProperty(rows,i,{
          get:function(){
            var start=i*dimension;
            return new Vector(that.slice(start,start+dimension));
          },set:function(e){
            AssertVector(e);
            var start=i*dimension;
            for(var j=0;j<dimension;j++)
              that[start+j]=e[j];
          }
        });
      })(i);
    })(this);
    //Set the dimension of this vector, it can't be change.
    Object.defineProperties(this,{
      "length":{value:args.length},
      "dimension":{value:dimension},
      "columns":{value:columns},
      "rows":{value:rows}
    });
    return this;
  };
  Matrix.prototype=[];
  (function(){
    for(var i=0;i<4;i++)(function(i){
      Object.defineProperty(Matrix.prototype,"r"+i,{
        get:function(){ return this.rows[i]; },
        set:function(e){ this.rows[i]=e; }
      });
      Object.defineProperty(Matrix.prototype,"c"+i,{
        get:function(){ return this.columns[i]; },
        set:function(e){ this.columns[i]=e; }
      });
      for(var j=0;j<4;j++)
        (function(i,j){
          Object.defineProperty(Matrix.prototype,"m"+i+j,{
            get:function(){return this[i+j*this.dimension];},
            set:function(e){
              AssertValue(e);
              thisthis[i+j*this.dimension]=e;
            }
          });
        })(i,j);
      })(i);
  })();
  Object.defineProperties(Matrix.prototype,{
    toString:{
      value:function(){
        var l=this.dimension,result=[],temp;
        for(var i=0;i<this.length;i+=this.dimension){
          temp=this.slice(i,i+this.dimension).map(function(e){
            return e.toFixed(4);
          });
          result.push(temp.join("\t"));
        };
        return result.join("\n");
      }
    },item:{
      value:function(i,j,value){
        if(value===void 0)return this[i*this.dimension+j];
        AssertValue(value);
        this[i*this.dimension+j]=value;
      }
    },multiply:{
      value:function multiply(target){
        if(target instanceof Vector)
          return target.multipliedBy(this);
        if(!(target instanceof Matrix))
          Failed("parameter 1 is not of type `Matrix`.");
        AssertEqualDimensions(this.dimension,target.dimension);
        var result=[];
        for(var i=0;i<this.dimension;i++)
          for(var j=0;j<this.dimension;j++)
            result.push(this.columns[i].dot(target.rows[j]));
        return new Matrix(result);
      }
    },multipliedBy:{
      value:function multipliedBy(target){
        if(target instanceof Vector)
          return target.multiply(this);
        if(!(target instanceof Matrix))
          Failed("parameter 1 is not of type `Matrix`.");
        AssertEqualDimensions(this.dimension,target.dimension);
        var result=[];
        for(var i=0;i<this.dimension;i++)
          for(var j=0;j<this.dimension;j++)
            result.push(this.rows[i].dot(target.columns[j]));
        return new Matrix(result);
      }
    },inverse:{
      value:function inverse(){
        var dimension=this.dimension,determinant=this.determinant();
        if(determinant==0)Failed("matrix is singular.");
        var result=new Matrix(dimension),odev=dimension%2==0,temp;
        for(var i=0;i<dimension;i++)for(var j=0;j<dimension;j++){
          temp=[];
          for(var m=1;m<dimension;m++)for(var n=1;n<dimension;n++)
            temp.push(this.item((i+m)%dimension,(j+n)%dimension));
          temp=new Matrix(temp);
          result.item(j,i,(odev&&(i+j)%2?-1:1)*temp.determinant()/determinant);
        }
        return new Matrix(result);
      }
    },determinant:{
      value:function determinant(){
        switch(this.dimension){
          case 2:return this[0]*this[3]-this[1]*this[2];
          case 3:return (
            this[0]*this[4]*this[8]-this[0]*this[5]*this[7]+
            this[1]*this[5]*this[6]-this[1]*this[3]*this[8]+
            this[2]*this[3]*this[7]-this[2]*this[4]*this[6]
          );
          case 4:
            var result=0,temp,dimension=this.dimension;
            for(var i=0;i<dimension;i++){
              temp=[];
              for(var j=dimension;j<this.length;j++)
                if(j%dimension!=i)temp.push(this[j]);
              temp=new Matrix(temp);
              result+=temp.determinant()*this[i]*(i%2?-1:1);
            };
            return result;
        };
      }
    },transpose:{
      value:function transpose(){
        var result=new Matrix(this.dimension);
        for(var i=0;i<this.dimension;i++)
          for(var j=0;j<this.dimension;j++)
            result.item(i,j,this.item(j,i));
        return result;
      }
    }
  });
})();