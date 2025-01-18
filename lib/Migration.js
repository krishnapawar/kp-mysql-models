const fs = require('fs');
const path = require('path');
const DataTypes = {
    STRING: "VARCHAR(255)",
    TEXT: "TEXT",
    DATE: "DATETIME",
    INTEGER: "INT(11)",
    FLOAT: "FLOAT",
    BOOLEAN: "TINYINT(1)",
    BIGINT: "BIGINT",
    JSON: "JSON",
    ENUM: (values) => `ENUM(${values.map((v) => `'${v}'`).join(", ")})`, // Only for ENUM
    UUID: "CHAR(36)", // UUID type
    DECIMAL: (precision, scale) => `DECIMAL(${precision}, ${scale})`, // For precision decimals
  };
  
  // Generates the SQL `CREATE TABLE` query
  function generateCreateTableQuery(tableName, schema, options = {}) {
    if (!tableName || typeof tableName !== "string") {
      throw new Error("Table name must be a valid string.");
    }
    if (!schema || typeof schema !== "object") {
      throw new Error("Schema must be an object.");
    }
  
    let query = `CREATE TABLE IF NOT EXISTS \`${tableName}\` (\n`;
  
    const columns = [];
    const constraints = [];
    const indexes = [];
    const uniqueConstraints = [];  // For multiple columns uniqueness
  
    // Check if "id" exists, if not create an auto-increment primary key
    if (!schema.id) {
        let idData= {id:{
            type: "INTEGER",
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
          }}
      Object.assign(idData, schema);
      schema = idData;
    }
  
    // Loop through the schema and generate column definitions
    for (const [columnName, columnDef] of Object.entries(schema)) {
      const { 
        type, allowNull, unique, primaryKey, defaultValue, references, 
        values, check, autoIncrement, precision, scale 
      } = columnDef;
  
      // Ensure the type is valid
      let columnType;
      if (type === "ENUM") {
        columnType = DataTypes[type](values || []);
      } else if (type === "DECIMAL") {
        columnType = DataTypes[type](precision, scale);
      } else {
        columnType = DataTypes[type] || type;
      }
  
      // Create the column definition
      let columnDefStr = `  \`${columnName}\` ${columnType}`;
      if(columnName == "timestamps" && columnDef == true){
        columnDefStr =  `createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`;
      }
      
  
      // Apply the NOT NULL constraint if not explicitly set
      if (allowNull === false) columnDefStr += " NOT NULL";
      else if (allowNull === true) columnDefStr += " NULL";  // Optional: allows explicit NULL setting
      
      // Handle UNIQUE constraints
      if (unique && !primaryKey) {
        uniqueConstraints.push(`  UNIQUE (\`${columnName}\`)`);
      }
  
      // Handle PRIMARY KEY
      if (primaryKey) columnDefStr += " PRIMARY KEY";
  
      // Handle AUTO_INCREMENT for MySQL or equivalent
      if (autoIncrement) columnDefStr += " AUTO_INCREMENT"; 
  
      // Handle DEFAULT value (for expressions or literals)
      if (defaultValue) {
        if (typeof defaultValue === "string" && defaultValue.toLowerCase() === "current_timestamp") {
          columnDefStr += ` DEFAULT CURRENT_TIMESTAMP`;  // Handle `CURRENT_TIMESTAMP`
        } else {
          columnDefStr += ` DEFAULT '${defaultValue}'`;  // Handle other defaults like `0`, `'N/A'`, etc.
        }
      }
  
      // Add CHECK constraints
      if (check) columnDefStr += ` CHECK (${check})`; 
  
      columns.push(columnDefStr);
  
      // Add foreign key constraint if references are specified
      if (references) {
        const { table, field, onDelete, onUpdate } = references;
        let foreignKeyStr = `  FOREIGN KEY (\`${columnName}\`) REFERENCES \`${table}\`(\`${field}\`)`;
        if (onDelete) foreignKeyStr += ` ON DELETE ${onDelete}`;
        if (onUpdate) foreignKeyStr += ` ON UPDATE ${onUpdate}`;
        constraints.push(foreignKeyStr);
      }
  
      // Optionally, handle indexes (e.g., for unique columns)
      if (unique && !primaryKey) {
        indexes.push(`  INDEX \`${columnName}_unique_index\` (\`${columnName}\`)`);
      }
  
      // Automatically add index for primary key
      if (primaryKey) {
        indexes.push(`  INDEX \`${columnName}_primary_key_index\` (\`${columnName}\`)`);
      }
    }
  
    // Handle composite unique constraints (multiple columns)
    if (uniqueConstraints.length > 0) {
      query += uniqueConstraints.join(",\n") + ",\n";
    }
  
    // Handle auto-created `timestamps` if the option is enabled
    if (options.timestamps) {
      const { createdAt = "createdAt", updatedAt = "updatedAt" } = options.timestamps;
      columns.push(
        `  \`${createdAt}\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP`,
        `  \`${updatedAt}\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`
      );
    }
  
    // Finalize the table columns
    query += columns.join(",\n");
  
    // Add constraints (e.g., foreign keys) if they exist
    if (constraints.length > 0) {
      query += ",\n" + constraints.join(",\n");
    }
  
    // Add indexes if any were defined
    if (indexes.length > 0) {
      query += ",\n" + indexes.join(",\n");
    }
  
    query += "\n);";
  
    return query;
  }
  
  function migrateSchema(tableName, schema) {
    const migrationsFolderPath = "migrations";
    if (!fs.existsSync(migrationsFolderPath)) {
        fs.mkdirSync(migrationsFolderPath, { recursive: true });
    }
    
    const jsonFilePath = path.join(migrationsFolderPath, `${tableName}.json`);
    if (!fs.existsSync(jsonFilePath)) {
      fs.writeFileSync(jsonFilePath, JSON.stringify({ [tableName]: schema }, null, 2));
      console.log("Schema saved to file.");
      return generateCreateTableQuery(tableName, schema);
    }
  
    const existingSchemas = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));
    const existingSchema = existingSchemas[tableName] || {};
  
    const alterQueries = [];
  
    // Check for added or modified fields
    for (const [columnName, columnDef] of Object.entries(schema)) {
      const existingColumn = existingSchema[columnName];
      if (!existingColumn) {
        // New column
        if(columnName == "timestamps" && columnDef == true){
            alterQueries.push(`ADD COLUMN createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, ADD COLUMN updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
            continue;
        }
        if(schema[columnName].references){
          alterQueries.push(generateAlterQuery('references',{[columnName]:schema[columnName]}));
          continue;
        }
        alterQueries.push(generateAlterQuery('add',{[columnName]:schema[columnName]}));
        
      } else {
        // Compare existing column properties
        const type =
          typeof columnDef.type === "function"
            ? columnDef.type(columnDef.values || [])
            : DataTypes[columnDef.type] || columnDef.type;
        
        const existingType =
          typeof existingColumn.type === "function"
            ? existingColumn.type(existingColumn.values || [])
            : DataTypes[existingColumn.type] || existingColumn.type;
        // ---------------------------------------------------------

        const allowNull = columnDef.allowNull !== false ? "" : " NOT NULL";
        const existingAllowNull = existingColumn.allowNull !== false ? "" : " NOT NULL";
        // ---------------------------------------------------------

        const unique = columnDef.unique ? " UNIQUE" : "";
        const existingUnique = existingColumn.unique ? " UNIQUE" : "";
        // ---------------------------------------------------------

        const defaultValue = columnDef.defaultValue
          ? ` DEFAULT ${columnDef.defaultValue}`
          : "";
        const existingDefaultValue = existingColumn.defaultValue
          ? ` DEFAULT ${existingColumn.defaultValue}`
          : "";
        // ---------------------------------------------------------

        const after = columnDef.after ? ` AFTER ${columnDef.after}` : "";
        const existingDefaultAfter = existingColumn.after
          ? ` AFTER ${existingColumn.after}`
          : "";
        // ---------------------------------------------------------
        
        const rename = columnDef.rename ? columnDef.rename : "";
        const existingRename = existingColumn.rename
          ? existingColumn.rename
          : "";
        // -----------------------------------------------------------

        const references = columnDef.references && columnDef.references.table  ? columnDef.references.table : "";
        const existingReferences = existingColumn.references && existingColumn.references.table 
          ? existingColumn.references.table
          : "";
        // -----------------------------------------------------------

        const referencesField = columnDef.references && columnDef.references.field  ? columnDef.references.field : "";
        const existingReferencesField = existingColumn.references && existingColumn.references.field 
            ? existingColumn.references.field
            : "";
        // -----------------------------------------------------------
        
        if (
          type !== existingType ||
          allowNull !== existingAllowNull ||
          unique !== existingUnique ||
          defaultValue !== existingDefaultValue ||
          after !== existingDefaultAfter ||
          rename !== existingRename ||
          references !== existingReferences ||
          referencesField !== existingReferencesField
        ) {
          if(rename !== existingRename){
            alterQueries.push(generateAlterQuery('rename',{[columnName]:schema[columnName]},{[columnName]:existingSchema[columnName]}));
            continue;
          }
          if (references !== existingReferences ||
            referencesField !== existingReferencesField) { 
            if (references !== '') {
              schema[columnName].modify = true;
              alterQueries.push(generateAlterQuery('references', { [columnName]: schema[columnName] },{ [columnName]: existingSchema[columnName] }));
              continue;
            }
          }
          
          alterQueries.push(generateAlterQuery('modify',{[columnName]:schema[columnName]}));
        } 
      }
    }
    const dropQueries =[];
    // Check for removed fields
    for (const columnName of Object.keys(existingSchema)) {
      if (!schema[columnName]) {
       
        if(columnName == 'timestamps'){
            dropQueries.push(`DROP COLUMN createdAt, DROP COLUMN updatedAt`);
            continue;
        }
        if(existingSchema[columnName].references){
          dropQueries.push(generateAlterQuery('dropreferences',columnName));
          continue;
        }
        dropQueries.push(generateAlterQuery('drop',columnName));
      }
    }
    
  
    // Save updated schema
    existingSchemas[tableName] = schema;
    fs.writeFileSync(jsonFilePath, JSON.stringify(existingSchemas, null, 2));
    let sql = `ALTER TABLE ${tableName} `;
    const queryArr = [];

    // Add drop column queries
    if (dropQueries.length) {
      queryArr.push(...dropQueries);
    }

    // Add alter column queries
    if (alterQueries.length) {
      queryArr.push(...alterQueries);
    }
    if(queryArr.length > 0){
      sql += queryArr.join(", ");
      return sql;
    }
    return false;

  }

  function generateAlterQuery(action, config,trackConfig={}) {

    let query = "";
    
    switch (action.toLowerCase()) {
        case "add":
            query = generateAddQuery(config);
            break;

        case "modify":
            query = generateModifyQuery(config);
            break;

        case "drop":
            query = generateDropQuery(config);
            break;

        case "rename":
            query = generateRenameQuery(config,trackConfig);
            break;

        case "addconstraint":
            query = generateAddConstraintQuery(config);
            break;

        case "dropconstraint":
            query = generateDropConstraintQuery(config);
            break;

        case "references":
            query = generateForeignKeyConstraint(config);
            break;

        case "dropreferences":
          query = dropForeignKeyConstraint(config);
          break;

        default:
            throw new Error("Invalid action. Use 'add', 'modify', 'drop', 'rename', 'addConstraint', or 'dropConstraint'.");
    }

    return query;
}

function generateAddQuery(config) {
    const fields = Object.keys(config).filter(key => key !== "tableName" && key !== "name" && !isConstraint(config[key]));
    if (fields.length === 0) {
        throw new Error("For 'add', fields and their types are required.");
    }
    const addColumns = fields.map(field => {
        const fieldConfig = config[field];
        validateFieldConfig(fieldConfig);
        return buildColumnDefinition(fieldConfig, field);
    }).join(", ");
    let query = ` ADD COLUMN ${addColumns}`;
    const constraints = Object.keys(config).filter(key => isConstraint(config[key]));
    if (constraints.length > 0) {
        const constraintQueries = constraints.map(constraint => {
            const constraintConfig = config[constraint];
            return buildConstraintDefinition(constraintConfig, constraint);
        }).join(", ");
        query += `, ${constraintQueries}`;
    }
    return query;
}

function generateModifyQuery(config) {
    const fields = Object.keys(config).filter(key => key !== "tableName" && key !== "name" && !isConstraint(config[key]));
    if (fields.length === 0) {
        throw new Error("For 'modify', fields and their types are required.");
    }
    const modifyColumns = fields.map(field => {
        const fieldConfig = config[field];
        validateFieldConfig(fieldConfig);
        return buildColumnDefinition(fieldConfig, field);
    }).join(", ");
    return ` MODIFY COLUMN ${modifyColumns}`;
}

function generateDropQuery(config) {
  
    if (!config || config.length === 0) {
        throw new Error("For 'drop', field names are required.");
    }
    if(Array.isArray(config)){
      return ` DROP COLUMN ${config.join(", ")}`;
    }
    return ` DROP COLUMN ${config}`;
}
function generateDropConstraintQuery(config) {
  if (!config) {
      throw new Error("For 'dropConstraint', name is required.");
  }
  if(Array.isArray(config)){
    return ` DROP CONSTRAINT ${config.join(", ")}`;
  }
  return ` DROP CONSTRAINT ${config}`;
}

function generateRenameQuery(config,trackConfig) {
    const field = Object.keys(config)
    if (!config[field].rename || !config[field].type) {
        throw new Error("For 'rename', field, newField, and type are required.");
    }
    let query = ` CHANGE ${trackConfig[field]?.rename ?? field} ${config[field].rename} ${config[field].type}`;
    if (config[field].defaultValue !== undefined) {
        query += ` DEFAULT ${typeof config[field].defaultValue === "string" ? `'${config[field].defaultValue}'` : config[field].defaultValue}`;
    }
    if (config[field].allowNull === false) {
        query += ` NOT NULL`;
    }
    return query;
}

function generateAddConstraintQuery(config) {
    const field = Object.keys(config)
    if (!field || !config[field].type) {
        throw new Error("For 'addConstraint', name and type are required.");
    }
    let query = ` ADD CONSTRAINT ${field} ${config[field].type}`;
    if (config[field].type.toLowerCase() === "foreign key") {
        if (!config[field].fields || !config[field].references) {
            throw new Error("For 'foreign key', fields and references are required.");
        }
        query += ` (${config[field].fields.join(", ")}) REFERENCES ${config[field].references.table} (${config[field].references.field})`;
        if (config[field].onDelete) {
            query += ` ON DELETE ${config[field].onDelete}`;
        }
        if (config[field].onUpdate) {
            query += ` ON UPDATE ${config[field].onUpdate}`;
        }
    }
    return query;
}

function generateForeignKeyConstraint(config) {
  if (!config || typeof config !== "object") {
      throw new Error("Config must be a valid object.");
  }

  const fields = Object.keys(config);
  if (fields.length === 0) {
      throw new Error("Config must have at least one field.");
  }

  const statements = [];

  fields.forEach((field) => {
      const fieldConfig = config[field];

      // Validate required properties
      if (!fieldConfig.type) {
          throw new Error(`Missing 'type' property for field: ${field}`);
      }

      if (!fieldConfig.references || !fieldConfig.references.table || !fieldConfig.references.field) {
          throw new Error(
              `Missing required 'references' properties for field: ${field}`
          );
      }

      if(!fieldConfig.modify){
        const addColumnStr = `ADD COLUMN \`${field}\` ${fieldConfig.type}`;
        statements.push(addColumnStr);
      }else{
        const dropForeignKeyStr = `DROP FOREIGN KEY \`${field}_fk\``; 
        statements.push(dropForeignKeyStr);
      }

      // Add the foreign key constraint
      let foreignKeyStr = `ADD FOREIGN KEY (\`${field}\`) REFERENCES \`${fieldConfig.references.table}\` (\`${fieldConfig.references.field}\`)`;

      if (fieldConfig.onDelete) {
          foreignKeyStr += ` ON DELETE ${fieldConfig.onDelete}`;
      }

      if (fieldConfig.onUpdate) {
          foreignKeyStr += ` ON UPDATE ${fieldConfig.onUpdate}`;
      }

      statements.push(foreignKeyStr);
  });

  return statements.join(", ");
}


function dropForeignKeyConstraint(config) {
  if (!config) {
      throw new Error("BothconstraintName are required.");
  }
  return ` DROP FOREIGN KEY ${config}`;
}

function validateFieldConfig(fieldConfig) {
    if (!fieldConfig.type) {
        throw new Error("Each field must have a type.");
    }
}

function isConstraint(fieldConfig) {
    return fieldConfig.type && fieldConfig.type.toLowerCase() === "foreign key";
}

function buildColumnDefinition(fieldConfig, fieldName) {
    let columnDef = `${fieldName} `;
    let type = fieldConfig.type.toUpperCase();
    let dType =  DataTypes[type];
    if (type === "ENUM") {
      columnDef += dType(fieldConfig.values || []);
    } else if (type === "DECIMAL") {
      columnDef += dType(fieldConfig.precision, fieldConfig.scale);
    } else {
      columnDef += dType || type;
    }
    if (fieldConfig.length) {
        columnDef += `(${fieldConfig.length})`;
    }
    if (fieldConfig.allowNull === false) {
        columnDef += ` NOT NULL`;
    }
    if (fieldConfig.unique) {
        columnDef += ` UNIQUE`;
    }
    if (fieldConfig.defaultValue !== undefined) {
        columnDef += ` DEFAULT ${typeof fieldConfig.defaultValue === "string" ? `'${fieldConfig.defaultValue}'` : fieldConfig.defaultValue}`;
    }
    if (fieldConfig.autoIncrement) {
        columnDef += ` AUTO_INCREMENT`;
    }
    if (fieldConfig.characterSet) {
        columnDef += ` CHARACTER SET ${fieldConfig.characterSet}`;
    }
    if (fieldConfig.collation) {
        columnDef += ` COLLATE ${fieldConfig.collation}`;
    }
    if (fieldConfig.after) {
      columnDef += ` AFTER ${fieldConfig.after}`;
    }
    return columnDef;
}

function buildConstraintDefinition(constraintConfig, constraintName) {
    let constraintDef = `${constraintName} ${constraintConfig.type}`;
    if (constraintConfig.type.toLowerCase() === "foreign key") {
        if (!constraintConfig.fields || !constraintConfig.references) {
            throw new Error("For 'foreign key', fields and references are required.");
        }
        constraintDef += ` (${constraintConfig.fields.join(", ")}) REFERENCES ${constraintConfig.references.table} (${constraintConfig.references.field})`;
        if (constraintConfig.onDelete) {
            constraintDef += ` ON DELETE ${constraintConfig.onDelete}`;
        }
        if (constraintConfig.onUpdate) {
            constraintDef += ` ON UPDATE ${constraintConfig.onUpdate}`;
        }
    }
    return constraintDef;
}

module.exports = {migrateSchema};