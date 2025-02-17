import { sum } from "./utils";

const PERIOD_SEC = 5;
console.log("hello typescript");
console.log(`sum(13,33) : ${sum(13, 33)}`);

const getMsec = () => new Date().getTime();
const startMs = getMsec();
const func = () => console.log(` Elapsed : ${getMsec() - startMs} [Ms]`);

setInterval(func, PERIOD_SEC * 1000);
