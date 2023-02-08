let express = require("express");
let app = express();
app.use(express.json());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, OPTIONS, PUT, PATCH,DELETE,HEAD"
    );
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});
var port = process.env.PORT||2410;
app.listen(port, () => console.log(`Node app listening on port jai~ ${port}!`));
const { data } = require("./shopsData");
const { Client } = require("pg");
const client = new Client({
    user: "postgres",
    password: "Jalmejay@10",
    database: "postgres",
    port: 5432,
    host: "db.hggcdvzvjldnatkxcatw.supabase.co",
    ssl: { rejectUnauthorized: false },
});
client.connect(function (res, error) {
    console.log(`Connected!!!`);
});
app.get("/shops", function (req, res) {
    const query = "SELECT * From shops"
    client.query(query, function (err, results) {
        if (err) {
            res.status(400).send(err);
        }
        else {
            res.send(results.rows)
        }
    })
});
app.post("/shops", function (req, res) {
    console.log("Inside post of shops")
    let body = req.body;
    const query = "SELECT * FROM shops";
    client.query(query, function (err, results) {
        if (err) res.status(400).send(err);
        else {
            let values = Object.values(body);
            console.log(values);
            const query = "INSERT INTO shops (name,rent) VALUES($1,$2)";
            client.query(query, values, function (err, results) {
                if (err) {
                    res.status(400).send(err);
                }
                else {
                    res.send(`${results.rows} insertion successful`);
                }
            })
        }
    })
});
app.get("/products", function (req, res) {
    const query = "SELECT * From products"
    client.query(query, function (err, results) {
        if (err) {
            res.status(400).send(err);
        }
        else {
            res.send(results.rows)
        }
    })
});
app.get("/products/:id", function (req, res) {
    let id = +req.params.id;
    console.log(id);
    const query = "SELECT * From products WHERE productid=$1"
    client.query(query, [id], function (err, result) {
        if (err) {
            console.log(err);
            res.status(400).send(err);
        }
        else {
            console.log(result.rows);
            res.send(result.rows)
        }
    })
});
app.post("/products", function (req, res) {
    console.log("Inside post of products")
    let body = req.body;
    const query = "SELECT * FROM products";
    client.query(query, function (err, results) {
        if (err) res.status(400).send(err);
        else {
            let maxId = results.rows.reduce((acc, cur) => (acc > cur.productid ? acc : cur.productid), 0);
            let newProduct = { productid: maxId + 1, ...body };
            let values = Object.values(newProduct)
            console.log(values);
            const query = "INSERT INTO products (productid,productname,category,description) VALUES($1,$2,$3,$4)";
            client.query(query, values, function (err, results) {
                if (err) {
                    console.log(err);
                    res.status(400).send(err);
                }
                else {
                    res.send(`${results.rows} insertion successful`);
                }
            })
        }
    })
});
app.put("/products/:id", function (req, res) {
    let id = +req.params.id;
    let body = req.body;
    console.log(id);
    const query = "SELECT * FROM products";
    client.query(query, function (err, result) {
        if (err) res.status(400).send(err);
        else {
            let index = result.rows.findIndex((e) => e.productid === id);
            console.log(index);
            if (index >= 0) {
                let update = [{ ...body }];
                let arr = update.map(e => [e.productname, e.category, e.description, e.productid]);
                let values = Object.values(update);
                console.log("values", values);//name,price,brand,ram,rom,os
                console.log("arr", arr);//name,price,brand,ram,rom,os
                const query =
                    "UPDATE products SET productname=$1,category=$2,description=$3 WHERE productid=$4";
                client.query(query, arr[0], function (err, result) {
                    if (err) res.status(400).send(err);
                    else {
                        res.send(result.rows);
                    }
                });
            } else {
                res.status(400).send("No products Found");
            }
        }
    });
});
app.get("/purchases", function (req, res) {
    let shopStr = req.query.shop;
    let productStr = req.query.product;
    let sortStr = req.query.sort;
    let productArr = productStr ? productStr.split(",") : [];
    // console.log(productArr);
    // console.log(productStr);
    const query = "SELECT * From purchases"
    client.query(query, function (err, results) {
        if (err) {
            res.status(400).send(err);
        }
        else {
            if (shopStr) {
                let shopId = shopStr.charAt(shopStr.length - 1);
                results.rows = results.rows.filter((e) => e.shopId === +shopId);
            }
            if (productStr) {
                // let productId = productStr.charAt(productStr.length - 1);
                results.rows = results.rows.filter((e) => (productArr.find(m => +(m.charAt(m.length-1)) ===e.productid)));
                // console.log(results.rows);
            }
            if (sortStr === "QtyAsc") {
                results.rows.sort((p1, p2) => +p1.quantity - +p2.quantity);
            }
            if (sortStr === "QtyDsc") {
                results.rows.sort((p1, p2) => +p2.quantity - +p1.quantity);
                // console.log(results.rows);
            }
            if (sortStr === "ValueAsc") {
                results.rows.sort((p1, p2) => +p1.quantity * +p1.price - +p2.quantity * +p2.price);
            }
            if (sortStr === "ValueDsc") {
                results.rows.sort((p1, p2) => +p2.quantity * +p2.price - +p1.quantity * +p1.price);
            }
            res.send(results.rows)
        }
    })
});
app.get("/purchases/shops/:id", function (req, res) {
    let id = +req.params.id;
    console.log(id);
    const query = "SELECT * From purchases WHERE shopid=$1"
    client.query(query, [id], function (err, result) {
        if (err) {
            console.log(err);
            res.status(400).send(err);
        }
        else {
            console.log(result.rows);
            res.send(result.rows)
        }
    })
});
app.get("/purchases/products/:id", function (req, res) {
    let id = +req.params.id;
    console.log(id);
    const query = "SELECT * From purchases WHERE productid=$1"
    client.query(query, [id], function (err, result) {
        if (err) {
            console.log(err);
            res.status(400).send(err);
        }
        else {
            console.log(result.rows);
            res.send(result.rows)
        }
    })
});

app.get("/totalPurchase/shop/:id", function (req, res) {
    let id = +req.params.id;
    let arr = data.purchases;
    let fil = arr.filter((e) => e.shopId === id);
    let totalPurchase = fil.reduce(
        (acc, cur) => (acc + (cur.price * cur.quantity)), 0
    );
    console.log(totalPurchase.toString());
    res.send(totalPurchase.toString());
});
app.get("/totalPurchase/product/:id", function (req, res) {
    let id = +req.params.id;
    let arr = data.purchases;
    let fil = arr.filter((e) => e.productId === id);
    let totalPurchase = fil.reduce(
        (acc, cur) => (acc + (cur.price * cur.quantity)), 0
    );
    res.send(totalPurchase.toString());
});

app.post("/purchases", function (req, res) {
    let body = req.body;
    let maxId = data.purchases.reduce(
        (acc, cur) => (acc > cur.purchaseId ? acc : cur.purchaseId),
        0
    );
    let newProduct = { purchaseId: maxId + 1, ...body };
    data.purchases.push(newProduct);
    res.send(newProduct);
});
