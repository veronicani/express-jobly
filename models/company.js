"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for companies. */

class Company {
  /** Create a company (from data), update db, return new company data.
   *
   * data should be { handle, name, description, numEmployees, logoUrl }
   *
   * Returns { handle, name, description, numEmployees, logoUrl }
   *
   * Throws BadRequestError if company already in database.
   * */

  static async create({ handle, name, description, numEmployees, logoUrl }) {
    const duplicateCheck = await db.query(`
        SELECT handle
        FROM companies
        WHERE handle = $1`, [handle]);

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate company: ${handle}`);

    const result = await db.query(`
                INSERT INTO companies (handle,
                                       name,
                                       description,
                                       num_employees,
                                       logo_url)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING
                    handle,
                    name,
                    description,
                    num_employees AS "numEmployees",
                    logo_url AS "logoUrl"`, [
          handle,
          name,
          description,
          numEmployees,
          logoUrl,
        ],
    );
    const company = result.rows[0];

    return company;
  }

  /** Find all companies.
   *
   * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
   * */

  /** pseudo query
   * make 2 separate queries: if data is empty, proceed with normal query
   * if data is not empty, proceed with formatted WHERE clause
   *
   *
   * SELECT handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl"
   * FROM companies
   * WHERE name ILIKE $1 AND num_employees > $2 AND num_employees < $3,
   * [$1, $2, $3] --> ["App", 2, ,200]
   *
   *
   * SELECT handle, name....
   * FROM companies
   * WHERE name ILIKE $1
   *
   * [$1] --> ["App"]
   *
   *
   * SELECT handle, name...
   * FROM companies
   * WHERE num_employees < $1
   * [$1] --> [200]
   *
   *
   * const basequery = 'SELECT handle,
               name,
               description,
               num_employees AS "numEmployees",
               logo_url      AS "logoUrl"
        FROM companies'

    const filterquery = searchForQuery(data);

    if filterquery !== ""
    ...concatenate basequery + filterquery + order by
   */

  static async findAll(query) {
    function _makeWhereClause(query) {
      if (data.minEmployees && data.maxEmployees) {
        if (+data.minEmployees > data.maxEmployees) throw new BadRequestError("");
      }
      const { nameLike, minEmployees, maxEmployees } = query;
      const whereExps = [];
      const values = [];
      //if there is a nameLike 
      if (nameLike) {
        values.push(nameLike); //['C'] 
        whereExps.push(`name ILIKE $${values.length}`); // [name ILIKE $1]
      }

      if (maxEmployees) {
        values.push(Number(maxEmployees));
        whereExps.push(`num_employees <= $${values.length}`);
      }
      //TODO: implement minEmployees
      if (maxEmployees) {
        values.push(maxEmployees);
        whereExps.push(`num_employees <= $${values.length}`);
      }

      //return 'WHERE' += whereClause.join('AND');
    }
    const companiesRes = await db.query(`
        SELECT handle,
               name,
               description,
               num_employees AS "numEmployees",
               logo_url      AS "logoUrl"
        FROM companies
        ORDER BY name`);
    return companiesRes.rows;
  }

  /** Given a company handle, return data about company.
   *
   * Returns { handle, name, description, numEmployees, logoUrl, jobs }
   *   where jobs is [{ id, title, salary, equity, companyHandle }, ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async get(handle) {
    const companyRes = await db.query(`
        SELECT handle,
               name,
               description,
               num_employees AS "numEmployees",
               logo_url      AS "logoUrl"
        FROM companies
        WHERE handle = $1`, [handle]);

    const company = companyRes.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Update company data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {name, description, numEmployees, logoUrl}
   *
   * Returns {handle, name, description, numEmployees, logoUrl}
   *
   * Throws NotFoundError if not found.
   */

  static async update(handle, data) {
    const { setCols, values } = sqlForPartialUpdate(
        data,
        {
          numEmployees: "num_employees",
          logoUrl: "logo_url",
        });
    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `
        UPDATE companies
        SET ${setCols}
        WHERE handle = ${handleVarIdx}
        RETURNING
            handle,
            name,
            description,
            num_employees AS "numEmployees",
            logo_url AS "logoUrl"`;
    const result = await db.query(querySql, [...values, handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Delete given company from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(handle) {
    const result = await db.query(`
        DELETE
        FROM companies
        WHERE handle = $1
        RETURNING handle`, [handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);
  }
}


module.exports = Company;
