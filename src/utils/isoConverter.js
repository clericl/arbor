const fs = require('fs').promises
const path = require('path')

async function init() {
  const d3 = await import('d3')
  const filePath = path.join(__dirname, '../assets/iso.tsv')

  const data = await fs.readFile(filePath, { encoding: 'utf-8', })

  const parsed = d3.tsvParse(data)

  const isoTable = {}
  parsed.forEach((item) => {
    isoTable[item.Id] = item['Print_Name']
  })

  const formatted = JSON.stringify(isoTable, null, 2)

  await fs.writeFile('./iso.json', formatted)
}

init()
