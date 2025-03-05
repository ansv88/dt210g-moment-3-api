const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require("dotenv").config();

//Initiera Express
const app = express();
const port = process.env.PORT || 3000;

//Aktivera CORS och JSON-hantering
app.use(cors());
app.use(express.json());

//Anslut till MongoDB
mongoose
    .connect(process.env.DATABASE)
    .then(() => {
        console.log("Ansluten till MongoDB");
    }).catch((error) => {
        console.log("Fel vid anslutning till databas: " + error);
    });

//Importera produktmodellen
const Product = require("./models/Product");

//Middleware för att skydda routes med JWT
function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; //Bearer-token

    if (!token) {
        return res.status(401).json({ message: "Ingen behörighet - token saknas!" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (error) => {
        if (error) {
            return res.status(403).json({ message: "Ogiltig token" });
        }
        next();
    });
}


//Routes
//Läs ut från databasen - publik route
app.get("/products", async (req, res) => {
    try {
        //Hämta data från databasen och sortera den i fallande ordning efter id
        const products = await Product.find({}).sort({ _id: -1 });

        //Om databasfrågan fungerar som den ska, returnera statuskod samt datan från servern
        return res.status(200).json(products);
    } catch (error) {
        return res
            .status(500)
            .json({ error: "Internt serverfel. Kontrollera loggar." }); //Svar med statuskod och felmeddelande
    }
});

//Läs ut enskild produkt från databasen - publik route
app.get("/products/:id", async (req, res) => {
    try {
        const { id } = req.params;

        //Kontrollera att ID:t är giltigt
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Ogiltigt ID-format." });
        }

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ error: "Produkten hittades inte." });
        }

        res.json(product);
    } catch (error) {
        console.error("Fel vid hämtning av produkt:", error);
        res.status(500).json({ error: "Internt serverfel." });
    }
});


//Lägg till en produkt i databasen - skyddad route
app.post("/products", authenticateToken, async (req, res) => {
    //Skapa variabler med data från formuläret
    const { productName, description, category, amount, price } = req.body;

    let errors = [];  //Variabel med tom array för att lagra ev felmeddelanden i
    if (!productName) errors.push("Du måste ange ett produktnamn.");
    if (!category) errors.push("Du måste ange en kategori.");
    if (amount == null || amount < 0) errors.push("Du måste ange ett giltigt antal.");
    if (price == null || price < 0) errors.push("Du måste ange ett giltigt pris.");

    //Kontrollera om det finns några fel i listan
    if (errors.length > 0) return res.status(400).json({ errors });

    try {
        let newProduct = await Product.create({ productName, description, category, amount, price });
        res.status(201).json(newProduct);
    } catch (error) {
        console.error("Fel vid skapande av produkt:", error);
        res.status(500).json({ error: "Kunde inte skapa produkt." });
    }
});


//Uppdatera en produkt i databasen - skyddad route
app.put("/products/:id", authenticateToken, async (req, res) => {
    const productId = req.params.id;
    const { productName, description, category, amount, price } = req.body;
    const updates = {}; //Skapa ett tomt objekt för att lagra uppdateringar

    //Kontrollera fälten, trimma string-värden och uppdatera om giltiga
    if (productName) updates.productName = productName.trim();
    if (description) updates.description = description.trim();
    if (category) updates.category = category.trim();
    if (amount !== undefined && amount >= 0) updates.amount = amount;
    if (price !== undefined && price >= 0) updates.price = price;

    //Om inga uppdateringar har gjorts, returnera ett fel
    if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: "Inga uppdateringar är gjorda." });
    }

    //Kontrollera att ID:t är ett giltigt MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ error: "Ogiltigt ID-format." });
    }

    try {
        //Försök att uppdatera i MongoDB
        const updatedProduct = await Product.findByIdAndUpdate(productId, updates, { new: true });

        //Om inget uppdaterades (angivet ID hittades inte)
        if (!updatedProduct) {
            return res.status(404).json({ error: "Produkten hittades inte." });
        }
        //Om uppdateringen fungerade, skicka 200-status och mer info om det uppdateringen
        res.status(200).json({ message: "Produkt uppdaterad.", updatedProduct });
    } catch (error) {
        //Logga och hantera eventuella fel vid databasanrop med 500-status och meddelande
        console.error("Fel vid uppdatering av produkt: ", error);
        res.status(500).json({ error: "Internt serverfel. Kontrollera loggar." });
    }
});


//Ta bort en produkt
app.delete("/products/:id", authenticateToken, async (req, res) => {
    const productId = req.params.id;  //Hämta id

    //Kontrollera att ID:t är ett giltigt MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ error: "Ogiltigt ID-format." });
    }

    //Försök radera produkten från databasen
    try {
        //Försök att hitta och radera produkt från databasen
        const deletedProduct = await Product.findByIdAndDelete(productId);

        //Om inget hittades med angivet ID, skicka 404-status och meddelande
        if (!deletedProduct) {
            return res.status(404).json({ error: "Produkten hittades inte." });
        }

        //Raderingen lyckades, skicka bekräftelse
        res.status(200).json({ message: "Produkt borttagen" });
    } catch (error) {
        //Logga och hantera eventuella fel vid databasfrågan med 500-status och meddelande
        console.error("Fel vid databasfråga: ", error);
        res.status(500).json({ error: "Internt serverfel. Kontrollera loggar." });
    }
});

//Importera userRoutes
const userRoutes = require("./routes/userRoutes");
app.use("/users", userRoutes);


app.listen(port, () => {
    console.log('Servern körs på port: ' + port);
});