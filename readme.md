# Express Backend for Jobly
Backend server for Jobly API, ver. 2.0. 

## About The Project
This is a RESTful API for a job board built in Express. It provides:
* Login / signup for users
* Authentication / authorization middleware for anon, users, and admin
* JWT token authentication via middleware
* 99% test coverage of all files

Initial codebase scaffold provided by Rithm School. Additional features and tests implemented by
Veronica Ni & Crystal Tran 2023.

### Routes
Companies:
  * `GET /companies`: get all companies (no auth)
  * `GET /company`: get details of one company (no auth)
  * `POST /companies`: create a company (admin)
  * `PATCH /company`: update information of a company (admin)
  * `DELETE /company`: delete a company (admin)

Jobs:
  * `GET /jobs`: get all jobs (no auth)
  * `GET /job`: get details of one job (no auth)
  * `POST /jobs`: create a job (admin)
  * `PATCH /job`: update information of a job (admin)
  * `DELETE /job`: delete a job (admin)

Users: 
  * `GET /users`: get all users (admin)
  * `GET /user`: get details of one user (admin or same user)
  * `POST /user`: create a user (admin)
  * `PATCH /user`: update information of a user (admin or same user)
  * `DELETE /user`: delete a user (admin or same user)

See [package.json](https://github.com/veronicani/express-jobly/blob/main/package.json) for a full list of dependencies.

### Getting Started
1. Clone this repo.
    ```sh
    git clone https://github.com/veronicani/rithm-jobly-backend.git
    ```
2. Install dependencies.
    ```sh
    $ npm install
    ```
4. Run server.
    ```sh
    $ npm start
    # or
    node server.js
    ```
    (This will default to port 3001)

### Seeding Data
1. Create new database (requires PostgresQL to be installed):
   ```sh
   createdb jobly
   ```
2. Seed the database with the included `jobly.sql` file. This will run both `jobly-schema.sql` (table schema) and `jobly-seed.sql` (user/company seed data). Follow the command prompts to delete and recreate the database.
   ```sh
   psql -f jobly.sql jobly
   ```
3. To look at your database:
    ```sh
    psql jobly
    ```

### Running tests
To run all tests:
```sh
npm test
# or
jest -i
```
Running tests for one file (e.g. users.test.js):
```sh
npm test users.test.js
```
To run coverage:
```sh
npm run cov
# or
jest -i --coverage
```