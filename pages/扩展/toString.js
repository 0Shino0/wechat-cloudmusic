let arr = [1,2,3]
console.log(arr.toString());  // 1 2 3
let num = 123;

console.log(Object.prototype.toString.call(arr)); // [Object Array]
console.log(Object.prototype.toString.call(num)); // [Object Number]

console.log(Object.prototype.toString.call(arr).slice(8,-1)); //Array
console.log(Object.prototype.toString.call(num).slice(8,-1)); //Number