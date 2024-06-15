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

    where(condition) {
        if (!this.x.where) {
            this.x.where = {};
        }
        Object.assign(this.x.where, condition);
        return this;
    }

    whereOr(condition) {
        this.x.whereOr = condition;
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

    whereRaw(condition) {
        this.x.whereRaw = condition;
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