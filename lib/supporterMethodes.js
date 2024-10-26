const isOne=(data)=>{
    return (data.hasOne || data.belongsTo ? 1 :'');
}
const isInt = (data) => {
    return data % 1;
  };
const isCheck = (data) => {
    if (data != undefined && data != null && data != "") return false;
    return true;
};
const isEmpty = (data) => {
    if (data != undefined && data != null && data != "") return false;
    return true;
};
const isKey = (data) => {
    if (data != undefined && (data == null || data == "")) return true;
    return false;
};
const isTable = (data) => {
    if (data != undefined && data != null && data != "") return false;
    return "Table name is missing!";
};


const isLimit = (data, count = "") => {
    if (isCheck(data)) return "";
    if (count != "" && count != false) return `LIMIT ${count}`;
    if (isCheck(data.limit)) return "";
  
    if (
      data.limit != undefined &&
      data.limit != null &&
      data.limit != "" &&
      typeof data.limit == "number" &&
      data.limit > 0
    ) {
      if (count != "" && data.limit < 2) return `LIMIT ${count}`;
      return `LIMIT ${data.limit}`;
    }
    return "";
};
const isLatest = (data) => {
    let vl="";
    if (isCheck(data)) return "";
    vl += raw(data);
    vl += groupBy(data);
    vl += having(data);
    vl += (!isCheck(data.latest) && data.latest != undefined && data.latest != null && data.latest != "")?` order by ${data.latest} DESC`:'';
    return vl;
};
const raw=(x)=>{
    return x.raw ?? '';
}
const groupBy=(x)=>{
    return x.groupBy ? ` GROUP BY ${x.groupBy}`: '';
}
const having=(x)=>{
    return x.having ? ` Having ${x.having}`: '';
}
function isNotObject(x) {
    return (typeof x === "object" || typeof x === 'function') && (x !== null) ? false : true;
}
function isObject(x) {
    return Object.prototype.toString.call(x) === '[object Object]';
}
function isObjectEmpty(x) {
    return Object.entries(x).length === 0;
}
function isArray(x){
    return Array.isArray(x);
}
const getNestedValue = (obj, path) => {
    return path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);
  };

module.exports={
    isLatest,isLimit,isCheck,isTable,isKey,isOne,isInt,isNotObject,isObject,isArray,getNestedValue,isObjectEmpty,isEmpty
}