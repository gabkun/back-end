const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

const userRouter = require('./routes/users')
const productRouter = require('./routes/products')
const accountRouter = require('./routes/accounts')
app.use('/users', userRouter);
app.use('/products', productRouter);
app.use('/account', accountRouter);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
}); 