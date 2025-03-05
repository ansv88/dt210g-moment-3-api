# Webbtjänst (API) för hantering av produkter och användare
Detta är ett RESTful API för hantering av produkter och användare i en lagerhanteringsapplikation. API:et är byggt med **Node.js**, **Express** och **MongoDB**. APIet är uppbyggt med CRUD (Create, Read, Update, Delete).

## Länk
En liveversion av APIet finns tillgänglig på följande URL:
[]

## Funktionalitet
- Hantering av produkter (Läs, Lägg till, Uppdatera, Ta bort)
- Användarautentisering med JWT (Registrering, Inloggning, Token-validering)
- Skyddade routes för admin-funktioner (kräver JWT)

## Installation, databas
APIet använder en MongoDB-databas. Alla id:n för objekten automatgenereras av MongoDB.
Klona källkodsfilerna, kör kommando npm install för att installera nödvändiga npm-paket. Skapa en .env-fil och fyll i databasanslutningar och JWT-nyckel.

## Användning
Nedan finns beskrivet hur man når APIet med olika ändpunkter:

### Produkter

|Metod  |Ändpunkt      |Beskrivning                                      |Autentisering |
|-------|--------------|-------------------------------------------------|--------------|
|GET    |/products     |Hämta alla produkter                             |Nej           |
|GET    |/products/:id |Hämta en produkt                                 |Nej           |
|POST   |/products     |Skapa en ny produkt                              |Ja            |
|PUT    |/products/:id |Uppdaterar en befintlig produkt med angivet :id. |Ja            |
|DELETE |/products/:id |Raderar en produkt med angivet ID.               |Ja            |

### Användare

|Metod  |Ändpunkt        |Beskrivning             |Autentisering |
|-------|----------------|------------------------|--------------|
|POST   |/users/register |Registrera en användare |Nej           |
|POST   |/users/login    |Logga in och få token   |Nej           |
|GET    |/users/validate |Validera JWT-token      |Ja            |



En produkt skickas/läggs till som JSON med följande struktur:
```
  {
    "productName": "Laptop",
    "description": "Gaming laptop",
    "category": "Elektronik",
    "amount": 15,
    "price": 12999
  }
```
OBS! Kräver att token inkluderas i Headers:
```
Authorization: Bearer eyJhbG...
```
________________________________________

En produkt returneras som JSON med följande struktur:
```
  {
    "_id":"67a924f8f12b2b0b28ddaa89",
    "productName": "Laptop",
    "description": "Gaming laptop",
    "category": "Elektronik",
    "amount": 15,
    "price": 12999
  }
```
_______________________________________

En användare registreras som JSON med följande struktur:
```
  {
  "firstname": "Anna",
  "lastname": "Karlsson",
  "email": "anna@example.com",
  "password": "123456"
  }
```
______________________________________

En användare loggas in med följande struktur:
```
  {
  "email": "anna@example.com",
  "password": "123456"
  }
```