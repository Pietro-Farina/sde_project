const courses = [
    {
        name: "Introduction to Web Development",
        description:
            "Learn the basics of HTML, CSS, and JavaScript to build modern web pages.",
        open: true,
        slots: [
            {
                start: new Date("2026-03-10T09:00:00.000Z"),
                end: new Date("2026-03-10T13:00:00.000Z"),
                capacity: 20,
                available: 20,
            },
            {
                start: new Date("2026-03-12T14:00:00.000Z"),
                end: new Date("2026-03-12T18:00:00.000Z"),
                capacity: 20,
                available: 15,
            },
        ],
        priceOptions: [
            {
                numberSlots: 1,
                price: "49.00",
            },
            {
                numberSlots: 2,
                price: "89.00",
            },
        ],
    },
    {
        name: "Advanced Node.js and Backend APIs",
        description:
            "Deep dive into Node.js, Express, and REST API design with real-world patterns.",
        open: true,
        slots: [
            {
                start: new Date("2026-03-18T09:00:00.000Z"),
                end: new Date("2026-03-18T17:00:00.000Z"),
                capacity: 15,
                available: 10,
            },
            {
                start: new Date("2026-03-25T09:00:00.000Z"),
                end: new Date("2026-03-25T17:00:00.000Z"),
                capacity: 15,
                available: 15,
            },
        ],
        priceOptions: [
            {
                numberSlots: 1,
                price: "99.00",
            },
            {
                numberSlots: 2,
                price: "179.00",
            },
            {
                numberSlots: 3,
                price: "249.00",
            },
        ],
    },
    {
        name: "DevOps Fundamentals with Docker",
        description:
            "Understand DevOps principles and learn how to containerize applications using Docker.",
        open: false,
        slots: [
            {
                start: new Date("2026-04-02T10:00:00.000Z"),
                end: new Date("2026-04-02T16:00:00.000Z"),
                capacity: 12,
                available: 0,
            },
            {
                start: new Date("2026-04-09T10:00:00.000Z"),
                end: new Date("2026-04-09T16:00:00.000Z"),
                capacity: 12,
                available: 5,
            },
        ],
        priceOptions: [
            {
                numberSlots: 1,
                price: "79.00",
            },
            {
                numberSlots: 2,
                price: "139.00",
            },
        ],
    }
];

module.exports = courses;
