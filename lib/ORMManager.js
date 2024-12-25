const { isEmpty, isObject } = require("./supporterMethodes");
class ORMManager {
    #privateData = {};
    #list = {};

    constructor() {
        this.#privateData = this.init();
        this.x = {};
    }
    // Add or update objects in private data
    update(key, value) {
        if (typeof key !== 'string') {
            throw new Error("Key must be a string.");
        }
        this.#privateData[key] = { ...this.#privateData[key], ...value };
        return {[key]:{...value}};
    }

    #findByKey(key) {
        return this.#privateData.find((item) => item.key === key)?.value ?? null;
    }

    // Retrieve objects based on keys
    setWith(keys,cb=false) {
        const cbData = cb !== false && typeof cb == "function" && isObject(cb(this)) ? cb(this)  : isObject(cb) ? cb : {};
       
        if (typeof keys === "string") {
            let result = { [keys]: this.#findByKey(keys)};
            Object.assign(result[keys],cbData);
            return result;
        }
        if (isObject(keys)) keys = [keys];

        if (Array.isArray(keys)) {
            return keys.reduce((result, key) => {
                if (typeof key === 'string') {
                    const data = this.#findByKey(key);
                    if (data) {
                        result[key] = data;
                    }
                } else if (typeof key === 'object' && !Array.isArray(key)) {
                    for (const [nestedKey, func] of Object.entries(key)) {
                        const baseValue = this.#findByKey(nestedKey);
                        if (baseValue) {
                            const updatedData = typeof func === 'function' ? func(this) : {};
                            result[nestedKey] = {
                                ...baseValue,
                                with: updatedData, // Use the processed data directly
                            };
                        }
                    }
                } else {
                    throw new Error("Array elements must be strings or objects with key-function mappings.");
                }
                Object.assign(result[Object.keys(result)[0]],cbData);
                return result;
            }, {});
        }

        throw new Error("Keys must be a string, array, or object with key-function mappings.");
    }

    #handleRelation(t,m,n,cb = false) {
        
        const tc = isObject(t) ? t : { table: t };
        
        if (cb && (typeof cb == "function" && isObject(cb(this))) || (isObject(cb))) {
            
            const it = cb !== false && typeof cb == "function" && isObject(cb(this)) ? cb(this)  : isObject(cb) ? cb : {};

            let tran =this.transform({ method: m, data: { ...tc, ...it, ...n } });
            const keys = Object.keys(tran);
            const values = Object.values(tran);

            return { key:keys[0], value: {...values[0]} };
            
        } else {
            return { key:m, value: { ...tc, ...n } };
        }
    }
    transform(input) {
        if (!input?.method || !input?.data) return input;
        const { method, data } = input;
        const output = { [method]: { ...data } };

        return output;
    }
    hasMany(t, x, cb = false) {
    const methodName = (new Error()).stack.split('\n')[2].trim()
        .split(' ')[1].split('.')[1];
        return this.#handleRelation(t,methodName,{hasMany: x},cb)
    }

    belongsTo(t, x, cb = false) {
    const methodName = (new Error()).stack.split('\n')[2].trim()
        .split(' ')[1].split('.')[1];
        return this.#handleRelation(t,methodName,{belongsTo: x},cb)
    }
    belongsToMany(t, x, cb = false) {
    const methodName = (new Error()).stack.split('\n')[2].trim()
        .split(' ')[1].split('.')[1];
        return this.#handleRelation(t,methodName,{belongsToMany: x},cb)
    }

    connect(t, x, cb = false) {
    const methodName = (new Error()).stack.split('\n')[2].trim()
        .split(' ')[1].split('.')[1];
        return this.#handleRelation(t,methodName,{connect: x},cb)
    }

    hasOne(t, x, cb = false) {
    const methodName = (new Error()).stack.split('\n')[2].trim()
        .split(' ')[1].split('.')[1];
        return this.#handleRelation(t,methodName,{hasOne: x},cb)
    }

    with(ks=false,cb=false){
        
        if(!isEmpty(ks)){
            Object.assign(this.#list,this.setWith(ks,cb));
        }
        return this;
    }

    getConfigList(){
        return this.#list;
    }
    setConfigList(s){
        this.#list = s;
    }

    init() {
        return {};
    }
}
module.exports = ORMManager;