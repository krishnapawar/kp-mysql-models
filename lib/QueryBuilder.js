class QueryBuilder {
    constructor() {
        this.x = {};
    }
    table(x) {
        this.x.table = x;
        return this;
    }
    select(x) {
        this.x.select = x;
        return this;
    }
    latest(x) {
        this.x.latest = x;
        return this;
    }
    limit(x) {
        this.x.limit = x;
        return this;
    }
    groupBy(x) {
        this.x.groupBy = x;
        return this;
    }
    raw(x) {
        this.x.raw = x;
        return this;
    }
    having(x) {
        this.x.having = x;
        return this;
    }
    onlyTrashed() {
        this.x.onlyTrashed = true;
        return this;
    }
    when(c,cb) {
        if(c){
            return cb(this); 
        }
        return this;
    }
    where(c,v=false) {
        this.x.where = this.x.where || {};
        Object.assign(this.x.where, v ? { [c]: v } : c);
        return this;
    }
    whereOr(c,v=false) {
        this.x.whereOr = this.x.whereOr || {};
        Object.assign(this.x.whereOr, v ? { [c]: v } : c);
        return this;
    }
    whereIn(column, values) {
        if (!this.x.whereIn) {
            this.x.whereIn = {};
        }
        this.x.whereIn[column] = values;
        return this;
    }
    whereNotIn(column, values) {
        if (!this.x.whereNotIn) {
            this.x.whereNotIn = {};
        }
        this.x.whereNotIn[column] = values;
        return this;
    }
    whereNull(column) {
        if (!Array.isArray(this.x.whereNull)) {
            this.x.whereIsNull = [];
        }
        this.x.whereIsNull = this.x.whereIsNull.concat(column);
        return this;
    }
    whereNotNull(column) {
        if (!Array.isArray(this.x.whereNotNull)) {
            this.x.whereIsNotNull = [];
        }
        this.x.whereIsNotNull = this.x.whereIsNotNull.concat(column);
        return this;
    }
    whereRaw(c) {
        this.x.whereRaw = c;
        return this;
    }
    pagination(x) {
        this.x.pagination = x.currentPage;
        this.limit(x.perPage ?? 10);
        return this;
    }
    #addJoin(type, table, key, value, cb) {
        if (!Array.isArray(this.x.join)) {
            this.x.join = [];
        }
        const joinCondition = {
            type: type,
            table: table,
            on: {
                [key]: value,
            },
        };

        if (cb) {
            const callbackResult = cb(new QueryBuilder());
            Object.assign(joinCondition, callbackResult);
            if (callbackResult.join) {
                joinCondition.join = callbackResult.join;
            }
        }
        this.x.join.push(joinCondition);
        return this;
    }
    rightJoin(x, y, z, cb = false) {
        return this.#addJoin("rightJoin", x, y, z, cb);
    }
    innerJoin(x, y, z, cb = false) {
        return this.#addJoin("innerJoin", x, y, z, cb);
    }
    join(x, y, z, cb = false) {
        return this.#addJoin("join", x, y, z, cb);
    }
    leftJoin(x, y, z, cb = false) {
        return this.#addJoin("leftJoin", x, y, z, cb);
    }
    getQueryObject(d=false) {
        if(d) return this;
        return this.x;
    }
}

module.exports = QueryBuilder;