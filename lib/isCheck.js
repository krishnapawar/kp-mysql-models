const isOne=(data)=>{
    return (data.hasOne || data.belongsTo ? 1:'');
}
const isInt = (data) => {
    return data % 1;
  };
const isCheck = (data) => {
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
    if (isCheck(data)) return "";
    if (isCheck(data.latest)) return "";
    if (data.latest != undefined && data.latest != null && data.latest != "")
        return `order by ${data.latest} DESC`;
    return "";
};
module.exports={
    isLatest,isLimit,isCheck,isTable,isKey,isOne,isInt
}