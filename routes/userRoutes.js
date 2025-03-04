const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();

const router = express.Router();

//Importera användarmodell
const User = require("../models/User");


//Registrera användare
router.post("/register", async (req, res) => {
    try {
        const { firstname, lastname, email, password } = req.body;

        //Kolla att allt är ifyllt
        if (!firstname || !lastname || !email || !password) {
            return res.status(400).json({ error: "Alla fält måste fyllas i." });
        }

        //Hasha lösenord
        const hashedPassword = await bcrypt.hash(password, 10);

        //Skapa användare
        const newUser = new User({
            firstname,
            lastname,
            email,
            password: hashedPassword,
        });
        await newUser.save();

        res.status(201).json({ message: "Användare skapad", user: newUser });
    } catch (error) {
        console.error("Fel vid registrering av användare:", error);
        res.status(500).json({ error: "Kunde inte registrera användare." });
    }
});


//Logga in användare
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        //Kontrollera att alla fält är ifyllda
        if (!email || !password) {
            return res
                .status(400)
                .json({ error: "Ange både e-post och lösenord." });
        }

        //Hitta användaren i databasen
        const user = await User.findOne({ email });
        if (!user) {
            return res
                .status(401)
                .json({ error: "Fel e-post eller lösenord." });
        }

        //Jämför lösenordet
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res
                .status(401)
                .json({ error: "Fel e-post eller lösenord." });
        }

        //Skapa JWT-token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        return res.json({
            message: "Inloggning lyckades",
            user,
            token,
        });
    } catch (error) {
        console.error("Fel vid inloggning av användare:", error);
        return res
            .status(500)
            .json({ error: "Kunde inte logga in användare." });
    }
});


//Validera token
router.get("/validate", async (req, res) => {
    try {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];

        if (!token) {
            return res
                .status(401)
                .json({ message: "Ingen behörighet - token saknas!" });
        }

        jwt.verify(token, process.env.JWT_SECRET, async (error, decoded) => {
            if (error) {
                return res
                    .status(403)
                    .json({ message: "Ogiltig token" });
            }

            //Hitta användaren med userId från payload
            const user = await User.findById(decoded.userId);
            if (!user) {
                return res
                    .status(404)
                    .json({ error: "Användare hittades inte." });
            }

            return res.json({ user });
        });
    } catch (error) {
        console.error("Fel vid validering av token:", error);
        return res
            .status(500)
            .json({ error: "Kunde inte validera användare." });
    }
});

module.exports = router;