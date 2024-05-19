
# kp-mysql-models

>The `kp-mysql-models` is a mysql query builder light weight library that simplifies interactions with MySQL databases. It streamlines tasks such as creating, inserting, updating, and deleting records, and handles complex operations like joins, pagination, and conditionals. Its intuitive and efficient approach can greatly expedite development, saving both time and effort.

```bash
npm i kp-mysql-models
```
```JavaScript
const { BaseModels } = require("kp-mysql-models");
``` 
### OR

```bash
npm i @krishnapawar/kp-mysql-models
```
```JavaScript
const { BaseModels } = require("@krishnapawar/kp-mysql-models");
``` 

## Usage
This package provides a set of models for working with MySQL database. It is built on top of the `mysql` npm module

` Note:- ` for connection mysql we must have use library `mysql` for example.

```JavaScript
var mysql = require("mysql");
var pool = mysql.createPool({
  connectionLimit: 10,
  host: "localhost",
  user: "root",
  password: "",
  database: "test",
});

```

>using your modele class by extendes BaseModels class for Example 

```JavaScript
const { BaseModels } = require("kp-mysql-models");
const { pool } =require("./db");

class User extends BaseModels{
    constructor(){
        super();
        this._table="users";
        this._connection=pool;
    }
}
module.exports= User;
```
>No need to connect table name if class name same as table name but without s. for exmaple we have users table then we make User model class. also we sort hand connet database by using super() method; 

## Example 1

```JavaScript
const { BaseModels } = require("kp-mysql-models");
const { pool } =require("./db");

class User extends BaseModels{
    constructor(){
        super();
        this._connection=pool;
    }
}

module.exports= User;
```
## Example 2

```JavaScript
class User extends BaseModels{
    constructor(){
        super(pool);
    }
}

module.exports= User;
```

>You can access all methods after make User class object for Example
```JavaScript
let user = new User;

let data = await user.first();
let data = await user.get();

//deleting data 
let data = await user.delele({
  where: {
        id: 585,
      }
});

let data = await user.deleleAll();


let data = await user.destroy({
  where: {
        id: 585,
      }
});

//trucate table
let data = await user.trunCate();

```

>We can use soft delete as well by using BaseModels class for Example
```JavaScript
let user = new User;
class User extends BaseModels{
    constructor(){
        super(pool);
        this._softDelete=true;
    }
}

// for soft deleteing data

let data = await user.trashed({
  where: {
        id: 585,
      }
});

// for soft deleteing All data
let data = await user.trashedAll();

// for soft deleteing restoring data
let data = await user.restore({
  where: {
        id: 585,
      }
});

//for soft deleteing restoring All data
let data = await user.restoreAll();

//for fetch soft deleted data useing onlyTrashed:true;
let data = await user.first({ 
        onlyTrashed:true,
        where: {
              id: 585,
            }
       });

let data = await user.get({ onlyTrashed:true });

```

>or you can use same like abow example.

```JavaScript
let data = await user.get({
      select: ["id", "firstname", "lastname"],
      with: {
        doctor: {
          table: "appointments",
          limit: 2,
          select: ["id", "user_id"],
          connect: {
            user_id: "id",
          },
        },
        clinic: {
          table: "appointments",
          limit: 2,
          select: ["id", "user_id"],
          connect: {
            doctor_id: "id",
          },
        },
      },
      where: {
        id: 585,
      },
    });

```

***first method for geting single data***
```JavaScript
const data = await first({
      table: "users",
      select: ["id", "first_name", "last_name"],
      limit: 10,
      latest: "id",
      whereNotIn: {
        id: [1, 1221],
      },
      whereIs: {
        last_name: "NULL",
      },
      where:{
        id:1
      }
    });
```
***get methods***
```JavaScript
const data = await user.get({
        select: ["id", "first_name", "last_name"],
        limit: 10,
        latest: "id",
        whereNotIn: {
          id: [1, 1221],
        },
        whereIs: {
          last_name: "NULL",
        },
    });

```

### ***Dyanamic Pagination***

***we can make dyanamic pagination with key word (pagination:1) 1 is page No. we can set page limit by (limit:10) key word 10 is 10 data per page***
 
```JavaScript
const data = await user.get({
        limit: 10,      
        pagination: 1,
    });
```

#### Let's see another Example 
```JavaScript
let page = req.query.page;

const data = await user.get({
        limit: 10,      
        pagination: page,
    });
let data = await User.findOne(13);
```
#### findOneById()=> Data get by Id you can also use other condition by using obj like {name:"test", date:"12/10/2023"} or simply id

```javaScript
let data = await User.findOneById(13);
```
#### Example find() Method 
```javaScript
let data = await User.find({
    id:12,
    name:"test", 
    date:"12/10/2023"
  });
```
### ***Database Relation*** 
***using with() method using with first method to fetch data in specific variable in object***


```JavaScript
const data = await user.first({
      select: [
          "id", 
          "first_name", 
          "last_name"
        ],
      with: {
        doctor: {
          table: "appointments",
          limit: 2,
          select: ["id", "user_id"],
          connect: {
            user_id: "id",
          },
        },
        clinic: {
          table: "appointments",
          limit: 2,
          select: ["id", "user_id"],
          connect: {
            doctor_id: "id",
          },
        },
      },
      where: {
        id: 585,
      },
    });
```
***Applying the with() method in conjunction to retrieve data and store it in a specific variable within an object.***

```JavaScript
    {
      select:['id','first_name','role_id','created_at'],
      whereIsNotNull:['last_name'],
      with:{
        single_appointment:{
          select:['id','user_id'],
          table:"appointments",
          hasOne:{
            user_id:'id'
          }
        },
        belongsTo_appointment:{
          select:['id','user_id'],
          table:"appointments",
          belongsTo:{
            user_id:'id'
          }
        },
        connect_appointment:{
          select:['id','user_id'],
          table:"appointments",
          connect:{
            user_id:'id'
          }
        },
        allAppointment:{
          select:['id','user_id'],
          table:"appointments",
          hasMany:{
            user_id:'id'
          }
        },
        doctor: {
          table: "users",
          select: ["id", "user_id"],
          hasOne: {
            user_id: "dr_id",
          },
        },
      }
    }
```
### Let's See More Examples using with `hasOne`, `belognsTo`, `hasMany`, `connect` in (with:{}).

```javaScript
const data = await user.get({
      select: ["id", "created_by_id", "first_name", "last_name"],
      with: {
        doctor: {
          table: "appointments",
          limit: 2,
          select: ["id", "user_id"],
          connect: {
            user_id: "id",
          },
        },
        clinic: {
          table: "appointments",
          limit: 2,
          where:{
            role_id="5"
          },
          select: ["id", "user_id"],
          hasMany: {
            doctor_id: "id",
          },
        },
      },
      where: {
        created_by_id: "1",
      },
    }); 
```


***WE can get multi level relational data  using `with`***
```javaScript
let data = await User.get({
      with:{
        appointment:{
          select:['id','user_id'],
          table:"appointments",
          hasOne:{
            user_id:'id'
          },
          with:{
            doctor:{
              select:['id as doctor_id','email'],
              table:"users",
              hasOne:{
                user_id:'id'
              },
              with:{
                clinic_data:{
                  table:"clinices",
                  hasOne:{
                    id:'doctor_id'
                  }
                }
              }
            }
          }
        }
      }
    });
```
> `belongsTo` and `hasOne` give single response with single object data and other hand `hasMany` and `connect`, give array object response with multiple object data `.

```JavaScript
const data = await user.dbJoin({
      table: "users",
      limit: 10,
      select: [
        "users.id as uId",
        "appointments.id",
        "users.first_name",
        "lab.first_name as lab_name",
      ],
      latest: "appointments.id",
      join: [
        {
          type: "hasOne",
          table: "appointments",
          on: {
            "users.id": "appointments.patient_id",
          },
        },
        {
          type: "belongsTo",
          table: "users lab",
          on: {
            "lab.id": "appointments.user_id",
          },
        },
      ],
      where: {
        "users.id": 1122,
      },
      pagination: page,
    });
```

***you can also use for this method to join mutlipal table***

```JavaScript
const data = await user.dbWith({
      table: "users",
      limit: 10,
      select: [
        "users.id as uId",
        "appointments.id",
        "users.first_name",
        "lab.first_name as lab_name",
      ],
      latest: "appointments.id",
      with: {
        hasOne: [
          {
            table: "appointments",
            on: {
              "users.id": "appointments.patient_id",
            },
          },
          {
            table: "users clinic",
            on: {
              "clinic.id": "appointments.clinic_id",
            },
          },
        ],
        belongsTo: [
          {
            table: "users lab",
            on: {
              "lab.id": "appointments.user_id",
            },
          },
        ],
      },
      where: {
        "users.id": 1122,
      },
      pagination: page,
    });
```

***Note:-*** we can use `left join`, `right join`, `join` and `inner join` instant of `hasOne`, `belognsTo`, `hasMany`, `connect` in `dbJoin()`,`dbWith()` and also with `with`.


### Some Important Models methods, we can use all methods by extends BaseModels in our Model,
* get,
* first,
* dbQuery,
* trunCate,
* deleleAll,
* destroy,
* delete,
* create,
* update,
* save,
* dbJoin,
* dbWith,
* trasted,
* restore,
* trastedAll,
* restoreAll,
* trunCate,

## Helper methods

>**import all Helper method Example**

```JavaScript
const {
  setDBConnection,
  get,
  first,
  save,
  create,
  update,
  dbJoin,
  dbWith,
} = require("kp-mysql-models");
```
>first you have to setup mysql connection for using helper. we can setup by using setBDConnection() method to connect database or we can directly pass mysql pool or db connection object or params in help method  look both example in below.

```JavaScript
var mysql = require("mysql");
var pool = mysql.createPool({
  connectionLimit: 10,
  host: "localhost",
  user: "root",
  password: "",
  database: "test",
});
```
>Example 1 for using setDBConnection method
```JavaScript
setDBConnection(pool);
const data = await get({
      table: "users",
      whereNotIn: {
        id: [1, 1221],
      }
    });
```
### OR 
>You can also pass the connection object to each method directly
Example 2 for directly pass db connection
```JavaScript
const data = await get({
      table: "users",
      whereNotIn: {
        id: [1, 1221],
      }
    },pool);
```

>**Available important Helper methods can we use as well**
* setBDConnection,
* get,
* first,
* dbQuery,
* trunCate,
* deleleAll,
* destroy,
* create,
* update,
* save,
* dbJoin,
* dbWith,
* BaseModels

## ***Let's see more Exmaples***

***create method using for create data***
```JavaScript
const data = await create({
      table: "users",
      elements: {
        first_name: "ram",
        last_name: "ji",
      }
    });
```
***update method using for updating data***
```JavaScript
const dataj = await update({
      table: "users",
      elements: {
        first_name: "ram",
        last_name: "ji",
      },
      where: {
        id: 1223,
      }
    });
```

***save method using for create or updating data***
```JavaScript
const dataj = await save({
      table: "users",
      elements: {
        first_name: "ram",
        last_name: "ji",
      },
      // where: {
      //   id: 1223,
      // },
    });
```

## ***Some Important Key Words that can help in that methods,***
***

1. **table:**
   - Represents the fundamental structure for storing data in a relational database.

2. **select:**
   - Used to retrieve specific columns from a table, allowing developers to fetch only the necessary data.

3. **elements:**
   - Denotes individual pieces of data within a table, referring to the distinct values or attributes stored.

4. **latest:**
   - Facilitates the retrieval of the most recent records from a table based on a specified criterion, often a timestamp.

5. **limit:**
   - Restricts the number of records returned in a query, helping manage the quantity of data retrieved.

6. **pagination:**
   - A technique for breaking down large result sets into smaller, manageable chunks, commonly used for displaying data in paginated user interfaces.

7. **with:**
   - Used in ORM frameworks to specify related data that should be retrieved along with the main query, optimizing data retrieval for relationships.

8. **connect:**
   - Establishes connections between tables in an ORM framework, enabling the definition of relationships between entities.

9. **hasOne:**
   - Indicates a one-to-one relationship between tables, specifying that one record in the first table is associated with exactly one record in the second table.

10. **belongsTo:**
    - Denotes the inverse of a "hasOne" relationship, specifying the table that another table is associated with in a one-to-one relationship.

11. **hasMany:**
    - Specifies a one-to-many relationship between tables, where one record in the first table can be associated with multiple records in the second table.

12. **join:**
    - Combines data from multiple tables based on specified conditions, allowing for the retrieval of interconnected information.

13. **dbWith:**
    - Similar to "with," used in ORM frameworks to specify additional data to be retrieved along with the main query, aiding in optimizing data fetching.

14. **where:**
    - Filters data based on specified conditions, allowing developers to narrow down the result set to records that meet certain criteria.

15. **whereOr, whereIn, whereNotIn, whereIs, whereIsNull, whereIsNotNull, whereRaw:**
    - Different variations of the "where" clause, providing flexibility in constructing precise queries with various conditions.

16. **on, onOr, onIn, onNotIn, onIs, onRaw:**
    - Used in join operations to define conditions under which tables are linked, refining the result set based on specific criteria.

17. **onlyTrashed:**
    - Used in the context of soft deletes, indicating that only records marked as deleted should be included in the query results.

18. **groupBy:**
   - Groups query results based on specified columns, allowing for data aggregation using aggregate functions like COUNT or SUM.

19. **raw:**
   - Enables the inclusion of raw SQL expressions in a query, providing flexibility for complex queries and custom database operations. Exercise caution to prevent SQL injection vulnerabilities.

## ***Here are the descriptions for the provided `where` and `on` operations with examples***
***

### Where Operations:

1. **where:-**
   - Filters records where the 'id' is equal to 1223.
   ```JavaScript
    where: {
            id: 1223,
          }
    ```

2. **whereOr:-**
   - Filters records where the 'id' is equal to 1223 using the logical OR operator, allowing for multiple conditions.
   ```JavaScript
    whereOr: {
                id: 1223,
            }
    ```

3. **whereIn:-**
   - Filters records where the 'id' is either 1 or 1221, allowing for multiple values using the IN clause.
   ```JavaScript
        whereIn: {
                id: [1, 1221],
            }
   ```

4. **whereNotIn:-**
   - Filters records where the 'id' is not in the list [1, 1221], excluding records with specified values.
   ```JavaScript
     whereNotIn: {
             id: [1, 1221],
            }
   ```

5. **whereIs:-**
   - Filters records where the 'last_name' is explicitly set to NULL.
   ```JavaScript
        whereIs: {
            last_name: "NULL",
        }
   ```
 
6. **whereIsNot:-**
   - Filters records where the 'last_name' is not set to NULL.
   ```JavaScript
    whereIsNot: {
            last_name: "NULL",
            }
   ```

7. **whereRaw:-**
   - Allows the use of raw SQL conditions, in this case filtering records where 'name' is 'mohan' and 'age' is 30.
   ```JavaScript
    whereRaw:"name='mohan' and age=30 "
   ```

### On Operations:

1. **on:-**
   - Specifies a condition for joining tables based on the 'id' being equal to 1223.
   ```JavaScript
    on: {
            id: 1223,
            }
   ```

2. **onOr:-**
   - Specifies a condition for joining tables based on the 'id' being equal to 1223 using the logical OR operator.
   ```JavaScript
    onOr: {
            id: 1223,
            }
   ```

3. **onIn:-**
   - Specifies a condition for joining tables based on the 'id' being either 1 or 1221, using the IN clause.
   ```JavaScript
    onIn: {
            id: [1, 1221],
            }
   ```

4. **onNotIn:-**
   - Specifies a condition for joining tables based on the 'id' not being in the list [1, 1221], excluding certain values.
   ```JavaScript
    onNotIn: {
            id: [1, 1221],
            }
   ```

5. **onIs:-**
   - Specifies a condition for joining tables based on the 'last_name' being explicitly set to NULL.
   ```JavaScript
    onIs: {
        last_name: "NULL",
    }
   ```

6. **onIsNot:-**
   - Specifies a condition for joining tables based on the 'last_name' not being set to NULL.
   ```JavaScript
    onIsNot: {
            last_name: "NULL",
            }
    ```

7. **onRaw:-**
   - Allows the use of raw SQL conditions for joining tables, in this case specifying conditions where 'name' is 'mohan' and 'age' is 30.
   ```JavaScript
    onRaw:"name='mohan' and age=30 "
   ```

## License

[MIT](https://choosealicense.com/licenses/mit/)

# My Social Media Profiles

[![LinkedIn](https://img.shields.io/badge/LinkedIn-%230077B5.svg?&style=flat-square&logo=LinkedIn&logoColor=white)](https://in.linkedin.com/in/krishna-pawar-6250ab180)

[![GitHub](https://img.shields.io/badge/GitHub-%23121011.svg?&style=flat-square&logo=GitHub&logoColor=white)](https://github.com/krishnapawar)

[![Instagram](https://img.shields.io/badge/Instagram-%23E4405F.svg?&style=flat-square&logo=Instagram&logoColor=white)](https://www.instagram.com/krishna_p_15)

[![Twitter](https://img.shields.io/badge/Twitter-%231DA1F2.svg?&style=flat-square&logo=Twitter&logoColor=white)](https://twitter.com/YourTwitterHandle)
