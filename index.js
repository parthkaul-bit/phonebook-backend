const express = require("express");
const app = express();
// const morgan = require("morgan");
const cors = require("cors");
require("dotenv").config();
const Person = require("./models/person");

app.use(cors());
app.use(express.json());
app.use(express.static("dist"));

// app.use(morgan(":method :url :body"));

let persons = [
  {
    id: "1",
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: "2",
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: "3",
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: "4",
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.get("/api/persons", (request, response) => {
  Person.find({}).then((people) => {
    response.json(people);
  });
});

app.get("/api/persons/:id", (request, response, next) => {
  const id = request.params.id;

  Person.findById(id)
    .then((person) => {
      response.json(person);
      // console.log(person);
    })
    .catch((error) => next(error));

  // const person = persons.find((person) => person.id === id);

  // if (person) {
  //   response.json(person);
  // } else {
  //   response.status(404).send("Not Found");
  // }
});

app.get("/info", (request, response, next) => {
  Person.countDocuments({}).then((count) => {
    const time = new Date();
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    response.send(`
          <p>Phonebook has info for ${count} people</p>
          <p>${time.toLocaleString("en-GB")} ${timeZone}</p>
        `);
  });
});

app.post("/api/persons/", (request, response) => {
  const name = request.body.name;
  const number = request.body.number;
  if (!name || !number) {
    return response.status(400).json({
      error: !request.body.name ? "name is missing" : "number is missing",
    });
  }

  const matchingName = persons.find((person) => person.name === name);
  if (matchingName) {
    return response.status(400).json({
      error: "Name must be unique",
    });
  }

  const person = new Person({
    name,
    number,
  });

  person
    .save()
    .then((savedPerson) => {
      response.status(201).json(savedPerson);
    })
    .catch((error) => {
      if (error.name === "ValidationError") {
        response.status(400).json({ error: error.message });
      }
    });
  // persons = persons.concat(person);
  // morgan.token("body", (request) => JSON.stringify(request.body));
  // return response.status(201).json(persons);
});

app.delete("/api/persons/:id", (request, response, next) => {
  const id = request.params.id;

  Person.findByIdAndDelete(id)
    .then(() => {
      response.status(204).end();
    })
    .catch((error) => next(error));

  // persons = persons.filter((person) => person.id !== id);
  // response.json(persons);
});

app.put("/api/persons/:id", (request, response, next) => {
  const person = {
    name: request.body.name,
    number: request.body.number,
  };

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then((updatedPerson) => {
      response.json(updatedPerson);
    })
    .catch((error) => next(error));
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
