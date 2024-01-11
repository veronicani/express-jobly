"use strict";

const { BadRequestError } = require("../expressError");

/** Takes in user input data which is an object, and formats data
 * to be used in an UPDATE parameterized SQL query that partially updates
 * a record in the database.
 *
 * jsToSql object is passed as a second argument: it maps javascript variable
 * names from dataToUpdate to their SQL column names.
 *
 *
 * If dataToUpdate is empty, it throws an error.
 *
 * Receives arguments like:
 *  dataToUpdate Example:
 *     {
 *       firstName: "Bob",
 *       lastName: "Laster"
 *    }
 *
 *  jsToSql:
 *     {
 *      firstName: "first_name",
 *      lastName: "last_name",
 *      isAdmin: "is_admin",
 *    }
 *
 *
 * Returns an object like:
 *  {
 *    setCols: '"first_name"=$1, "last_name"=$2, ...'
 *    values: ["Bob", "Laster"]
 *  }
*/

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
    `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}


module.exports = { sqlForPartialUpdate, sqlForSearch };





