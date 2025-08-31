const express = require('express')
const app = express()
const main = require("./main.cjs")

const port = 3000

app.get('/', async (req, res) => {
  res.json(
      await main(
        req.query.search,
        numberOfPages = req.query?.num || 10,
        BUFFER = req.query?.buffer || 3,
      )
  )
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})