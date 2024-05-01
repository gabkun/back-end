const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

const userRouter = require('./routes/users')
const productRouter = require('./routes/products')
app.use('/users', userRouter);
app.use('/products', productRouter);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
}); 