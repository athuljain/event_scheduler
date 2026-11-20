const {Pool}=require('pg')
require("dotenv").config()

const pool=new Pool({
    connectionString:process.env.DATABASE_URL,})

    pool.on("connect",()=>{
        console.log("PostgreSQL Connected");
        
    })

    pool.on("error", (err) => {
  console.error("PostgreSQL Error:", err);
});

module.exports = pool;