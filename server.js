const app = require('./app');

const PORT = process.env.PORT || 3000;
console.log("Hallo Devialdi Maisa Putra!");

app.listen(PORT, () => {
    console.log(`Server berjalan pada port ${PORT}`);
});
