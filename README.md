# [NC-News](https://nc-news-wa7h.onrender.com/api) Backend Software Development Project

I completed this #backend project as part of the Software Development Bootcamp with [Northcoders](https://northcoders.com/). The project, "NC News API", uses _psql_ to setup a database of news articles (think Reddit), and HTTP endpoints with _express_ to make data available to a client. It is now live, with the databased hosted on [ElephantSQL](https://www.elephantsql.com/) and deployed on [Render](https://render.com/) at:

https://nc-news-wa7h.onrender.com/api

where a summary of available endpoints can be seen.

In a few weeks I'll be doing a #frontend project to provide a user interface for this.

## Development Process

The project was competed using _Test Driven Development_ (TDD) principles, using _Jest_ and _Supertest_. Individual endpoints were built their own tickets and GitHub Pull Requests, with code-reviews completed by Senior Software Developers at Northcoders.

## Software

This project has been completed using the following software:

-   [Node](https://nodejs.org/en).js. The following additional packages were installed with [npm](https://www.npmjs.com/):
    -   dotenv
    -   express
    -   pg
    -   pg-format
    -   jest
    -   jest-extended
    -   jest-sorted
    -   supertest
-   [Jest](https://jestjs.io/) and [SuperTest](https://www.npmjs.com/package/supertest) were used for integration testing
-   [node-postgres](https://node-postgres.com/) was used for the psql database.

## Setup

The code for this project is available on [this GitHub repo](https://github.com/WolfieKnee/be-nc-news) and can be cloned using:

```bash
    $ git clone https://github.com/WolfieKnee/be-nc-news.git
```

Npm packages can then be installed:

```bash
    $ npm install
```

I'm obviously keeping my local environment secure and not sharing variables to this public repo, so if you are wanting to use this code you'll need to set up your own .env files for 'test', 'dev' & 'production' databases e.g.:

.env.test

```
 PGDATABASE=database_name_here
```

and the databases setup and seeded using the available npm scripts:

```bash
    $ npm setup-dbs
    $ npm seed
```

tests can be run using:

```bash
    $ npm test
```

The database can then be deployed locally:

```bash
    $ npm start
```

### Minimum Requirements

-   Node minimum version: v20.8.0
-   PostgreSQL minimum version: v14.10
