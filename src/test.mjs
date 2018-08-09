import Dish from "./core/Dish";

const a = new Dish();
const i = "original";
a.set(i, Dish.STRING);

console.log(a);

const b = a.clone();

console.log(b);

console.log("changing a");

a.value.toUpperCase();
// const c = new Uint8Array([1,2,3,4,5,6,7,8,9,0]).buffer;
// a.set(c, Dish.ARRAY_BUFFER);

console.log(a);
console.log(b);
