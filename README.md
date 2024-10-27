
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
This package provides a set of MySQL model for working with MySQL database. It is built on top of the `mysql` npm module

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
## Basic Usage Examples
After configuring the connection, create model using table and db connection:
```JavaScript

const { BaseModels } = require("@krishnapawar/kp-mysql-models");

let User = new BaseModels({ _table: "users", _connection: pool });

// Retrieve a single record
let data = await User.first(); // Retrieves the first user record
let data = await User.where({ where: { id: req.body.id } }).first();
//or use like this
let data = await User.first({ where: { id: req.body.id } });

// Retrieve all records
let data = await User.get(); // Retrieves all records
let data = await User.where("id", 1).get();
//or
let data = await User.get({where:{"id":1}});

// Delete a record
let data = await User.where("id", 585).delete();
//or 
let data = await User.delete({ where: { id: 585 } });

// Truncate the table
let data = await User.truncate();

```
## Defining Models
Create model classes by extending BaseModels for each table, with optional customizations for table name and connection settings.

>To align with the instructions for creating a class named after the table (singular form) and using it in your controller, without explicitly connecting to the table name when the class name matches the table name (minus the "s"), you can rewrite the given JavaScript code as follows:

### Steps
1 Define the User Class: Extend BaseModels to create a model for the users table.
2 Initialize Connection: Use the super() method to pass the database connection (e.g., pool) to the BaseModels class.
3 Export the Model: Export User to make it accessible across the project.

```JavaScript
const { BaseModels } = require("@krishnapawar/kp-mysql-models");
const { pool } = require("./db");  // Import the pool connection

class User extends BaseModels {
    constructor() {
        super(pool);  // Connect to the database using super()
    }
}

module.exports = User;

// This code snippet imports necessary modules, defines the User class that extends BaseModels, and connects to the database using the super() method, following the given guidelines.
```
>In cases where the table or database connection is not automatically established or results in an error, you can manually set the table and database connection within the constructor. Here is the revised code let's take a look:

## Example 1 for table

```JavaScript
const { BaseModels } = require("@krishnapawar/kp-mysql-models");
const { pool } =require("./db");

class User extends BaseModels{
    constructor(){
        super(pool);
        this._table="users";
    }
}
module.exports= User;
```
## Example 2 for database

```JavaScript
const { BaseModels } = require("@krishnapawar/kp-mysql-models");
const { pool } =require("./db");

class User extends BaseModels{
    constructor(){
        super();
        this._connection=pool;
    }
}
module.exports= User;
```
## Example 3 
>We can customize other model settings such as soft delete, hidden fields, and fields to show. Here's how you can implement this:

```JavaScript
const { BaseModels } = require("@krishnapawar/kp-mysql-models");
const { pool } = require("./db");

class User extends BaseModels {
    constructor() {
        super();
        // Manually set the table name and database connection if not automatically connected
        this._table = "users";
        this._connection = pool;

        // Additional model settings
        this._softDelete = false;            // Disable soft delete functionality
        this._hidden = ['password'];         // Fields to hide from query results
        this._show = ['id', 'name', 'email']; // Fields to show in query results
    }
}

module.exports = User;

```
` Note:- ` This code snippet ensures that the table name (users), the database connection (pool) and other settings are explicitly set within the User class `constructor` if they are not automatically handled.

>You can access all methods after make User class object for Example
```JavaScript
let user = new User;

// for single data
let data = await user.first();

// for all data
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

let data = await user.delete({
  where: {
        id: 585,
      }
});
//trucate table
let data = await user.trunCate();

// 
let data = await User.findOne(13);


```
## Working with Soft Deletes
>The kp mysql model library supports soft deletes. This allows you to mark records as "deleted" without actually removing them from the database.
```JavaScript

let user = new User();

// Soft delete a record
let data = await user.trashed({ where: { id: 585 } });
let data = await user.where("id", 585).trashed();

// Soft delete all records
let data = await user.trashedAll();

// Soft restore all records
let data = await user.restoreAll();

// Restore a soft-deleted record
let data = await user.restore({ where: { id: 585 } });
let data = await user.where("id", 585).restore();

//for fetch soft deleted data useing onlyTrashed:true;
let data = await user.first({ 
        onlyTrashed:true,
        where: {
              id: 585,
            }
       });

//or you can use like this
let data = await user.where("id",585).onlyTrashed().first();

let data = await user.get({ onlyTrashed:true });

// Fetch only soft-deleted records
let data = await user.get({ onlyTrashed: true });
//or
let data = await user..onlyTrashed().get();

```
## Dynamic Pagination
With kp mysql model , you can implement dynamic pagination to control both the page number and the number of records per page. The library offers two approaches to define pagination:

***we can make dyanamic pagination with key word (pagination:1), 1 is page No. we can set page limit by (limit:10) key word 10 is 10 data per page or we can use or method `pagination({currentPage:1,perPage:20})` ***
 
```JavaScript
const data = await user.pagination({currentPage:1,perPage:20}).get();
//or
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
```
## CRUD Operations
The following methods make data management straightforward by providing options to create, update, or conditionally insert/update records within the database.

***Use create to insert new data into the database. It automatically maps fields to the table columns.***
```JavaScript
let data = await User.create({name,email,password});
```
***The update method is designed for modifying existing records. Specify fields to update in the elements object and target records using the where clause.***
```JavaScript
const dataj = await User.update({
      elements: {
        first_name: "ram",
        last_name: "ji",
      },
      where: {
        id: 1223,
      }
    });
```
***The updateOrCreate method updates data if the record exists, or inserts new data if it doesn’t. Specify the fields to update or insert in elements, and conditions in where. ***
```JavaScript
const dataj = await User.updateOrCreate({
      elements: {
        first_name: "ram",
        last_name: "ji",
      },
      where: {
        id: 1223,
      }
    });
```

***The save method can both insert and update records. If a where condition is provided, it updates matching records; otherwise, it creates a new entry.***
```JavaScript
const dataj = await User.save({
      elements: {
        first_name: "ram",
        last_name: "ji",
      },
      // where: {
      //   id: 1223,
      // },
    });
```

## Database Relations Using with() Method or with key 
The with() method in kp mysql model  allows you to establish and query relational data within your models, supporting relationships like `hasOne`, `belongsTo`, `hasMany`, and `connect`. This method lets you fetch related data alongside the main record in a structured way, and you can even build multi-level relationships for nested data retrieval.

```JavaScript
const data = await user.select(["id","first_name","last_name"]).with({
        doctor: {
          table: "appointments",
          limit: 2,
          select: ["id", "user_id"],
          hasMany: {
            user_id: "id",
          },
        }
      }).with({
        clinic: {
          table: "appointments",
          limit: 2,
          select: ["id", "user_id"],
          hasOne: {
            doctor_id: "id",
          },
        }
      }).where({id: 585}).first();

//or
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
          hasMany: {
            user_id: "id",
          },
        }
      },
      where: {
        id: 585,
      },
    });
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
### Advanced Examples Using Multiple Relationships
Specify various types of relationships such as hasOne, belongsTo, and connect for flexible relational querying.

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

### Multi-Level Relationship Example
Retrieve data from multiple nested tables, like users associated with appointments, 
and each appointment's doctor linked to a clinic.

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

## Advanced Joins with dbJoin() Method and dbWith() Method
The dbJoin() method in kp mysql model enables complex joins for enhanced querying. With options like join, innerJoin, leftJoin, and rightJoin, as well as pagination and sorting, it simplifies fetching related data across tables.

```JavaScript
let data =  await user
    .select("users.id as uId,appointments.id,users.first_name,lab.first_name as lab_name")
    .join('appointments',"users.id", "appointments.patient_id")
    .innerJoin("users lab","lab.id", "appointments.user_id")
    .leftJoin("users lab1","lab1.id", "appointments.user_id")
    .rightJoin("users lab2","lab2.id", "appointments.user_id")
    .where({
      "users.id": 1122,
    })
    .when(true,(q)=>{
      return q.where("appointments.id",1489);
    })
    .pagination({currentPage:1,perPage:20})
    .latest("appointments.id")
    .dbJoin();
//or
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


>Let's see more examples.

***first method for geting single data***
```JavaScript
const data = await user.select(["id", "first_name", "last_name"])
    .latest('id')
    .whereNull('last_name')
    .whereNotIn('id',[1, 1221])
    .where("id",1)
    .limit(10)
    .first();

//or you can use like this
const data = await user.first({
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
const data = await user.select(["id", "first_name", "last_name"])
    .latest('id')
    .whereNull('last_name')
    .whereNotIn('id',[1, 1221])
    .limit(10)
    .get();

//or you can use like this
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


### Some Important Models methods, we can use all methods by extends BaseModels in our Model,
* get,
* first,
* find
* findById
* findOne
* findOneById
* findOneByEmail
* dbQuery,
* trunCate,
* deleleAll,
* destroy,
* delete,
* create,
* update,
* updateOrCreate,
* save,
* dbJoin,
* dbWith,
* trasted,
* restore,
* trastedAll,
* restoreAll,
* trunCate,
* exists,

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
* collect

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
***deleleAll method using for delete data***
```JavaScript
const dataj = await deleteAll({
table: "users",
where: {
id: 1223,
},
});
```
---

### Key Methods

---

### Basic Query Methods

1. **`table(x)`**
   - Specifies the table to query.
   - **Example:** `query.table('users')`

2. **`select(x)`**
   - Defines columns to select.
   - **Example:** `query.select(['id', 'name'])`

3. **`latest(x)`**
   - Sorts records in descending order by a specified column.
   - **Example:** `query.latest('created_at')`

4. **`limit(x)`**
   - Limits the number of records returned.
   - **Example:** `query.limit(10)`

5. **`groupBy(x)`**
   - Groups records by specified columns.
   - **Example:** `query.groupBy('status')`

6. **`raw(x)`**
   - Adds a raw SQL snippet.
   - **Example:** `query.raw('COUNT(*)')`

7. **`having(x)`**
   - Adds a `HAVING` clause.
   - **Example:** `query.having('COUNT(id) > 10')`

8. **`onlyTrashed()`**
   - Adds a condition to return only "trashed" (deleted) records.
   - **Example:** `query.onlyTrashed()`

---

### Conditional Querying Methods

9. **`when(c, cb)`**
   - Executes a callback function if a condition is met.
   - **Example:** `query.when(userIsAdmin, q => q.where('role', 'admin'))`

10. **`where(c, v=false)`**
    - Adds a `WHERE` clause with specified conditions.
    - **Example:** `query.where('status', 'active')`

11. **`whereOr(c, v=false)`**
    - Adds an `OR WHERE` clause.
    - **Example:** `query.whereOr('role', 'user')`

12. **`whereIn(column, values)`**
    - Filters records where the column’s value is in a specified array.
    - **Example:** `query.whereIn('id', [1, 2, 3])`

13. **`whereNotIn(column, values)`**
    - Filters records where the column’s value is *not* in a specified array.
    - **Example:** `query.whereNotIn('status', ['inactive', 'deleted'])`

14. **`whereNull(column)`**
    - Filters records where the column’s value is `NULL`.
    - **Example:** `query.whereNull('deleted_at')`

15. **`whereNotNull(column)`**
    - Filters records where the column’s value is *not* `NULL`.
    - **Example:** `query.whereNotNull('created_at')`

16. **`whereRaw(c)`**
    - Adds a raw `WHERE` clause.
    - **Example:** `query.whereRaw('age > 18')`

---

### Relationship and Pagination Methods

17. **`with(c)`**
    - Defines relationships to load with the main query (similar to Eloquent's `with`).
    - **Example:** `query.with({ posts: { ... } })`

18. **`pagination(x)`**
    - Configures pagination by setting a `currentPage` and `perPage` limit.
    - **Example:** `query.pagination({ currentPage: 1, perPage: 20 })`

---

### Join Methods

19. **Private Method: `#addJoin(type, table, key, value, cb)`**
    - Adds a join clause (`JOIN`, `INNER JOIN`, `LEFT JOIN`, or `RIGHT JOIN`) to the query.
    - Supports sub-joins through callback functions.

20. **`rightJoin(x, y, z, cb=false)`**
    - Adds a `RIGHT JOIN` clause.
    - **Example:** `query.rightJoin('comments', 'users.id', 'comments.user_id')`

21. **`innerJoin(x, y, z, cb=false)`**
    - Adds an `INNER JOIN` clause.
    - **Example:** `query.innerJoin('posts', 'users.id', 'posts.user_id')`

22. **`join(x, y, z, cb=false)`**
    - Adds a `JOIN` clause.
    - **Example:** `query.join('orders', 'users.id', 'orders.user_id')`

23. **`leftJoin(x, y, z, cb=false)`**
    - Adds a `LEFT JOIN` clause.
    - **Example:** `query.leftJoin('profile', 'users.id', 'profile.user_id')`

---

### Finalizing the Query

24. **`buildQuery(d=false)`**
    - Finalizes the query structure.
    - Returns the full query object (`x`) if `d` is `true`, or the `QueryBuilder` instance itself for chaining.

## ***collect Method***

```JavaScript

const users = [
  { id: 1, name: 'John Doe', age: 30, contact: { address: 'test', phone: 90876543 } },
  { id: 2, name: 'Jane Doe', age: 25, contact: { address: 'test1', phone: 908765431 } },
  { id: 3, name: 'Mary Jane', age: 35, contact: { address: 'test2', phone: 908765432 } },
  { id: 4, name: 'Peter Parker', age: 28 },
  { id: 5, name: 'Bruce Wayne', age: 32 },
];

const collection = collect(users);

console.log(collection.where('name', '=', 'John Doe').where('age', '<', 40).first());
//{ id: 1, name: 'John Doe', age: 30, contact: { address: 'test', phone: 90876543 } }

console.log(collection.whereOr(['name', '=', 'John Doe'], ['age', '<', 30]).toArray());
// [
//   { id: 1, name: 'John Doe', age: 30, contact: { address: 'test', phone: 90876543 } },
//   { id: 2, name: 'Jane Doe', age: 25, contact: { address: 'test1', phone: 908765431 } },
//   { id: 4, name: 'Peter Parker', age: 28 },
// ]

console.log(collection.whereIn('name', ['John Doe', 'Jane Doe']).toArray());
// [
//   { id: 1, name: 'John Doe', age: 30, contact: { address: 'test', phone: 90876543 } },
//   { id: 2, name: 'Jane Doe', age: 25, contact: { address: 'test1', phone: 908765431 } },
// ]

console.log(collection.whereNotIn('name', ['John Doe', 'Jane Doe']).toArray());
// [
//   { id: 3, name: 'Mary Jane', age: 35, contact: { address: 'test2', phone: 908765432 } },
//   { id: 4, name: 'Peter Parker', age: 28 },
//   { id: 5, name: 'Bruce Wayne', age: 32 },
// ]

console.log(collection.whereNull('nickname').toArray());
// [
//   { id: 1, name: 'John Doe', age: 30, contact: { address: 'test', phone: 90876543 } },
//   { id: 2, name: 'Jane Doe', age: 25, contact: { address: 'test1', phone: 908765431 } },
//   { id: 3, name: 'Mary Jane', age: 35, contact: { address: 'test2', phone: 908765432 } },
//   { id: 4, name: 'Peter Parker', age: 28 },
//   { id: 5, name: 'Bruce Wayne', age: 32 },
// ]

console.log(collection.whereNotNull('name').toArray());
// [
//   { id: 1, name: 'John Doe', age: 30, contact: { address: 'test', phone: 90876543 } },
//   { id: 2, name: 'Jane Doe', age: 25, contact: { address: 'test1', phone: 908765431 } },
//   { id: 3, name: 'Mary Jane', age: 35, contact: { address: 'test2', phone: 908765432 } },
//   { id: 4, name: 'Peter Parker', age: 28 },
//   { id: 5, name: 'Bruce Wayne', age: 32 },
// ]

console.log(collection.pluck('contact').toArray());
// [
//   { address: 'test', phone: 90876543 },
//   { address: 'test1', phone: 908765431 },
//   { address: 'test2', phone: 908765432 },
//   undefined,
//   undefined,
// ]


console.log(collection.pluckDeep('contact.phone').toArray()); 
// [90876543, 908765431, 908765432, undefined, undefined]

console.log(collection.where('contact.phone', '>', 908765430).toArray()); 
// [{ id: 2, ...}, { id: 3, ...}]

console.log(collection.whereOr(['contact.phone', '=', 90876543], ['contact.address', '=', 'test1']).toArray()); 
// [{ id: 1, ...}, { id: 2, ...}]

console.log(collection.whereIn('contact.address', ['test', 'test1']).toArray()); 
// [{ id: 1, ...}, { id: 2, ...}]

console.log(collection.whereNotIn('contact.address', ['test', 'test1']).toArray()); 
// [{ id: 3, ...}, { id: 4, ...}, { id: 5, ...}]

console.log(collection.whereNull('contact.phone').toArray()); 
// [{ id: 4, ...}, { id: 5, ...}]

console.log(collection.whereNotNull('contact.phone').toArray()); 
// [{ id: 1, ...}, { id: 2, ...}, { id: 3, ...}]

console.log(collection.pluck('contact.phone').toArray()); 
//[90876543, 908765431, 908765432, null, null]

//you can use in chaining as well example
console.log(collection.where('name', '=', 'John Doe').where('age', '<', 40).first());


// Get the first item
const firstUser = collection.first();
// { id: 1, name: 'John Doe', age: 30 }

// Get the last item
const lastUser = collection.last();
// { id: 5, name: 'Bruce Wayne', age: 32 }

// Check if a value exists in the collection
const containsJohnDoe = collection.contains(users[0]);
// true

// Get unique items
const uniqueAges = collection.pluck('age').unique();
// [30, 25, 35, 28, 32]

// Get the count of items
const count = collection.count();
// 5

// Check if the collection is empty
const isEmpty = collection.isEmpty();
// false

// Convert collection to plain array
const array = collection.toArray();
// same as users

// Chunk the collection into arrays of 2 items each
const chunked = collection.chunk(2); 
// [
//   [{ id: 1, name: 'John Doe', age: 30 }, { id: 2, name: 'Jane Doe', age: 25 }],
//   [{ id: 3, name: 'Mary Jane', age: 35 }, { id: 4, name: 'Peter Parker', age: 28 }],
//   [{ id: 5, name: 'Bruce Wayne', age: 32 }]
// ]

// Order by age in ascending order
const orderedByAgeAsc = collection.orderBy('age');
// [
//   { id: 2, name: 'Jane Doe', age: 25 },
//   { id: 4, name: 'Peter Parker', age: 28 },
//   { id: 1, name: 'John Doe', age: 30 },
//   { id: 5, name: 'Bruce Wayne', age: 32 },
//   { id: 3, name: 'Mary Jane', age: 35 }
// ]

// Order by age in descending order
const orderedByAgeDesc = collection.orderBy('age', 'desc');
// [
//   { id: 3, name: 'Mary Jane', age: 35 },
//   { id: 5, name: 'Bruce Wayne', age: 32 },
//   { id: 1, name: 'John Doe', age: 30 },
//   { id: 4, name: 'Peter Parker', age: 28 },
//   { id: 2, name: 'Jane Doe', age: 25 }
// ]

const totalAge = collection.sum('age'); // 90
const averageAge = collection.avg('age'); // 30
const groupedByAge = collection.groupBy('age');
// {
//   30: [{ id: 1, name: 'John Doe', age: 30 }],
//   25: [{ id: 2, name: 'Jane Doe', age: 25 }],
//   35: [{ id: 3, name: 'Mary Jane', age: 35 }]
// }

//data sort
const sortedByName = collection.sortBy('name')

const phone = collection.values('contact.phone') // [90876543, 908765431, 908765432, undefined, undefined]

const keys = collection.keys().toArray() // ['id', 'name', 'age', 'contact']

// Remove specified keys from the collection
const withoutAge = collect(users).except(['age']).toArray();
// [
//   { id: 1, name: 'John Doe' },
//   { id: 2, name: 'Jane Doe' },
//   { id: 3, name: 'Mary Jane' }
// ]

// Only include specified keys in the collection
const onlyName = collect(users).only(['name']).toArray();
// [
//   { name: 'John Doe' },
//   { name: 'Jane Doe' },
//   { name: 'Mary Jane' }
// ]

// Key the collection by the specified key
const keyedById = collect(users).keyBy('id').toArray();
// {
//   1: { id: 1, name: 'John Doe', age: 30 },
//   2: { id: 2, name: 'Jane Doe', age: 25 },
//   3: { id: 3, name: 'Mary Jane', age: 35 }
// }

// Execute a callback on the collection
const tapped = collect(users).tap(collection => console.log(collection.count())).toArray();
// Logs: 3
// [
//   { id: 1, name: 'John Doe', age: 30 },
//   { id: 2, name: 'Jane Doe', age: 25 },
//   { id: 3, name: 'Mary Jane', age: 35 }
// ]

```

***Let's see more examples**
```JavaScript
const items = [1, [2, 3], [[4, 5]], [[[6]]]];
const collection = collect(items);

// Flatten the multi-dimensional array
const flattened = collection.flatten().toArray();
// [1, 2, 3, 4, 5, 6]

// Flatten the array to a depth of 1
const flat1 = collection.flat();
// [1, 2, 3, [4, 5], [[6]]]

// Flatten the array to a depth of 2
const flat2 = collection.flat(2);
// [1, 2, 3, 4, 5, [6]]

// Flatten the array completely
const flatInfinity = collection.flat(Infinity);
// [1, 2, 3, 4, 5, 6]

// Get items that are present in both collections
const intersected = collect([1, 2, 3]).intersect([2, 3, 4]).toArray();
// [2, 3]

// Get items that are in the first collection but not in the second
const diff = collect([1, 2, 3]).diff([2, 3, 4]).toArray();
// [1]


const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const collection = collect(items);

// Paginate the collection with 3 items per page, and get page 2
const paginated = collection.paginate(3, 2);

console.log(paginated);
// {
//   data: Collection { items: [ 4, 5, 6 ] },
//   currentPage: 2,
//   perPage: 3,
//   totalItems: 10,
//   totalPages: 4,
//   from: 4,
//   to: 6
// }

// Get the paginated data
const pageData = paginated.data.toArray();
// [4, 5, 6]

const numbers = [1, 2, 3, 4, 5, 6];
const collection = collect(numbers);

// Iterate over each item and log it
collection.each(item => console.log(item));
// Logs: 1, 2, 3, 4, 5, 6

// Take the first 3 items
const firstThree = collection.take(3).toArray();
// [1, 2, 3]

// Take the last 2 items
const lastTwo = collection.takeLast(2).toArray();
// [5, 6]

// Slice the collection from index 2 to 4
const sliced = collection.slice(2, 4).toArray();
// [3, 4]

// Reverse the collection
const reversed = collection.reverse().toArray();
// [6, 5, 4, 3, 2, 1]

// Splice the collection to remove 2 items from index 2 and add new items
const spliced = collection.splice(2, 2, 'a', 'b').toArray();
// [1, 2, 'a', 'b', 5, 6]

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
   - A technique for breaking down large result sets into smaller, manageable chunks, commonly used for displaying data in paginated user interfaces .

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
20. **this._having**
  - Specifies conditions on aggregated data, similar to the WHERE clause but used for aggregate functions. For example, filtering groups created by GROUP BY.

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
