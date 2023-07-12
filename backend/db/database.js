import { createConnection } from "mysql";

const db = createConnection({
    host: "berykv7yt5f93hijqznf-mysql.services.clever-cloud.com",
    user: "uyk6frcwngbujhaq",
    password: "IptrabpbvFf11GXvvjlV",
    database: "berykv7yt5f93hijqznf"
});

// open the MySQL connection
db.connect(error => {
    if (error) throw error;
    console.log("DB connected");
});

export default db;