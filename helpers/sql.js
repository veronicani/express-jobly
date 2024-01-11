"use strict";

const { BadRequestError } = require("../expressError");

/** Generates an object containing
 *    setCols: a string of col names mapped to their parameterized values.
 *    values: an array of values from dataToUpdate.
 *
 * If dataToUpdate is empty, it throws an error.
 *
 * Receives:
 *  DataToUpdate Example:
 *     {
 *       firstName: "Bob",
 *       lastName: "Laster"
 *    }
 *
 *  jsToSQL:
 *     {
 *      firstName: "first_name",
 *      lastName: "last_name",
 *      isAdmin: "is_admin",
 *    }
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


//Walkthrough of sqlForPartialUpdate
// data {firstName: "Bob", 'lastName: "Laster", 'isAdmin: true}
// keys = [firstName, lastName, isAdmin] (these are colNames), length = 3
// if keys.length = 0 -> Err
//cols = ["first_name" OR firstName" = $1, "last_name" OR lastName = $2]
//returns
//{setCols: "first_name = $1, last_name = $2"
// values: ["Bob", "Laster", true]

/**
 *
 *
 * Receives:
 *  DataToSearch Example:
 *     {
 *       nameLike: "App",
 *       minEmployees: "2",
 *       maxEmployees: "10"
 *    }
 *
 *  jsToSQL:
 *     {
 *      firstName: "first_name",
 *      lastName: "last_name",
 *      isAdmin: "is_admin",
 *    }
 *
 */
//TODO: change function name, maybe this need to change location > models/companies.js?
//TODO: change test locations > models/company.test.js ?
function sqlForSearch(data, jsToSql) {
  //check if minEmployees > maxEmployees. If true, throw error
  if (data.minEmployees && data.maxEmployees) {
    if (+data.minEmployees > data.maxEmployees) throw new BadRequestError("");
  }

  const keys = Object.keys(data);

  if (keys.length === 0) {
    return "";
  }

  let baseQuery = "WHERE";

  if (keys.includes("nameLike")) {
    baseQuery += ` name ILIKE '%${data.nameLike}%'`;
  }

  //TODO: if other keys are included, account for AND such as name
  //and minEmployees
  if (keys.includes("minEmployees") && keys.includes("maxEmployees")) {
    baseQuery += ` num_employees >= ${+data.minEmployees} AND num_employees <= ${+data.maxEmployees}`;

  } else if (keys.includes("minEmployees")) {
    baseQuery += ` num_employees >= ${+data.minEmployees}`;

  } else if (keys.includes("maxEmployees")) {
    baseQuery += ` num_employees <= ${+data.maxEmployees}`;
  }

  console.log("baseQuery is:", baseQuery);

  return baseQuery;

}

module.exports = { sqlForPartialUpdate, sqlForSearch };





//baseQuery += " num_employees >= ${data.minEmployees}
  //              AND  num_employees <= ${data.maxEmployees "

  //else if minEmployees
  // baseQuery += " num_employees >= ${data.minEmployees}"

  //else if maxEmployees
  // baseQuery += " num_employees <= ${data.maxEmployees}"



  //return baseQuery