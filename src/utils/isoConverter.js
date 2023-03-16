const fs = require('fs').promises
const path = require('path')

async function init() {
  const d3 = await import('d3')
  const filePath = path.join(__dirname, './iso.tsv')

  const data = await fs.readFile(filePath, { encoding: 'utf-8', })

  const parsed = d3.tsvParse(data)

  const isoTable = {}
  parsed.forEach((item) => {
    isoTable[item['Ref_Name'].split(' (')[0]] = {
      alpha2: item['Part1'],
      alpha3: item['Id']
    }
  })

  const formatted = JSON.stringify(isoTable, null, 2)

  await fs.writeFile('./iso.json', formatted)
}

init()
