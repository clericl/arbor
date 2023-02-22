const fs = require('fs').promises
const path = require('path')

async function init() {
  const d3 = await import('d3')
  const filePath = path.join(__dirname, '/src/assets/etymwn.tsv')

  const data = await fs.readFile(filePath, { encoding: 'utf-8', })

  const parsed = d3.tsvParseRows(data)

  const formatted = d3.csvFormatRows(parsed, ['source', 'relation', 'target'])

  await fs.writeFile('./db.csv', formatted)
}

init()
