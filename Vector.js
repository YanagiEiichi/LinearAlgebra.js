/***********************************************************
  Author: 次碳酸钴 (admin@web-tinker.com)
  Latest: 2014-10-21
  Git: https://github.com/YanagiEiichi/LinearAlgebra
***********************************************************/

var Vector;
(function(){
  function AssertLength(length){
    if(length==length*1&&length<=4&&length>=2)return;
    throw new TypeError("Invalid vector length.");
  };
  function AssertValue(value){
    if(typeof value=="number"&&isFinite(value))return;
    throw new TypeError("Invalid vector atom value.");
  };
  function AssertVector(vector){
    AssertLength(vector&&vector.length);
    for(var i=0;i<vector.length;i++)
      AssertValue(vector[i]);
  };
  //Set the Vector constructor.
  Vector=function(){
    if(!(this instanceof Vector))throw new TypeError("Illegal constructor.");
    var args=arguments,i;
    if(args.length==1){
      if(typeof args[0]=="number"){
        AssertLength(args[0]);
        args=Array(args[0]);
        for(i=0;i<args.length;i++)args[i]=0;
      }else if(args[0] instanceof Array)args=args[0];
    };
    AssertVector(args);
    for(i=0;i<4;i++)this[i]=args[i]||0;
    //Set the dimension of this vector, it can't be change.
    Object.defineProperty(this,"length",{value:args.length});
    return this;
  };
  var fn=Vector.prototype=[];
  //Initialize "x" "y" "z" "w" properties for its prototype. 
  (function(){
    var chars="xyzw",indexes=[];
    for(var i=0;i<chars.length;i++)indexes[chars[i]]=i;
    (function callee(e){
      if(e.length<4)for(var i=0;i<chars.length;i++)
        callee(e.concat(chars[i]));
      if(e.length)Object.defineProperty(fn,e.join(""),{
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
  Object.defineProperties(fn,{
    "toString":{
      writable:true,
      value:function(){
        return "("+this.join(",")+")";
      }
    },"norm":{
      get:function(){
        return Math.sqrt(this.dot(this));
      },set:function(value){
        value/=this.norm;
        this.mul(isFinite(value)?value:0);
      }
    },"normalize":{
      value:function(){
        return this.norm=1,this;
      }
    },"mul":{
      value:function(vector){
        if(vector&&vector.length){
          AssertVector(vector);
          for(var i=0;i<this.length;i++)this[i]*=(vector[i]||0);
        }else{
          AssertValue(vector);
          for(var i=0;i<this.length;i++)this[i]*=vector;
        };
      }
    },"add":{
      value:function(vector){
        if(vector&&vector.length){
          AssertVector(vector);
          for(var i=0;i<this.length;i++)this[i]+=(vector[i]||0);
        }else{
          AssertValue(vector);
          for(var i=0;i<this.length;i++)this[i]+=vector;
        };
      }
    },"dot":{
      value:function(vector){
        AssertVector(vector);
        var result=0;
        for(var i=0;i<this.length;i++)
          result+=this[i]*(vector[i]||0);
        return result;
      }
    },"cross":{
      value:function(vector){
        if(!vector||vector.length!=3||this.length!=3)
          throw TypeError("The operation of cross product need 3D vector.");
        var A=this,B=vector;
        this.xyz=[A[1]*B[2]-A[2]*B[1],A[2]*B[0]-A[0]*B[2],A[0]*B[1]-A[1]*B[0]];
        return this;
      }
    }
  });
  //Initialize the common static methods for Vector constructor.
  ["add","mul","cross"].forEach(function(name){
    Vector[name]=new Function("\
      var vector=new Vector(arguments[0]);\
      for(var i=1;i<arguments.length;i++)\
        vector."+name+"(arguments[i]);\
      return vector;\
    ");
  });
})();