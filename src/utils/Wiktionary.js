// Based on PalmerAL's "wiktionary-parser", acknowledgements:
// Copyright 2015 PalmerAL.
// https://github.com/PalmerAL/wiktionary-parser

class Wiktionary {
  static constructUrl(word) {
    return `https://en.wiktionary.org/w/api.php?format=json&action=query&titles=${word}&rvprop=content&prop=revisions&redirects=1&origin=*&callback=?`
  }

  static normalizeWikiData(text) {
		const linkRegex = /(\[+)([\w\s-]+)(\]+)/g;
		const type2LinkRegex = /(\[+)(\w+)([#|]+)(\w+)(\]+)/g;
		const wikipediaArticleRegex = /(\[+)(:?w:)([\w\s]+)\|([\w\s]+)(\]+)/g;
		const contextDataRegex = /(\[+)([\w\W]+)(\]+)|({+)([\w\W]+)(}+)/g;

    const normalizedText = text
      .replace(linkRegex, '$2')
      .replace(type2LinkRegex, '$4')
      .replace(wikipediaArticleRegex, '$4')
      .replace(contextDataRegex, '')

    return normalizedText
  }

  static parseTextFromApi(content, lang) {
    const definitions = []
    const parsedLang = lang.split(" (")[0]

    const text = content.split('\n')

    let heading1, heading2, heading3

    const heading1Regex = /^(==)([\w\s]+)(==)$/g;
		const heading2Regex = /^(===)([\w\s]+)(===)$/g;
		const heading3Regex = /^(====)([\w\s]+)(====)$/g;
		const startingAndTrailingCommasRegex = /(^, )|(,$)/g;
    const startingAndTrailingWhitespaceRegex = /^\s+|\s+$/g;
		const italicsRegex = /''/g;
		const wordCharactersRegex = /\w/g;

    for (const line of text) {
      if (heading1Regex.test(line)) {
        heading1 = line.replace(heading1Regex, '$2')
      }
      if (heading2Regex.test(line)) {
        heading2 = line.replace(heading2Regex, '$2')
      }
      if (heading3Regex.test(line)) {
        heading3 = line.replace(heading3Regex, '$2')
      }

      if (line.indexOf('# ') === 0 && heading1 === parsedLang) {
        let newDefinition = line.replace('# ', '')
        newDefinition = Wiktionary.normalizeWikiData(newDefinition)
        newDefinition = newDefinition.replace(startingAndTrailingCommasRegex, '')
        newDefinition = newDefinition.replace(startingAndTrailingWhitespaceRegex, '')
        newDefinition = newDefinition.replace(italicsRegex, '')

        if (wordCharactersRegex.test(newDefinition)) {
          let heading = heading2

          if (heading.toLowerCase().indexOf('etymology') !== -1 || heading.toLowerCase().indexOf('pronunciation') !== -1) {
            heading = heading3
          }

          definitions.push({
            meaning: newDefinition,
            type: heading
          })
        }
      }
    }

    return definitions
  }

  constructor(baseLang) {
    this.baseLang = baseLang
  }  

  async query(word, lang) {
    const url = Wiktionary.constructUrl(word)
    const res = await fetch(url)

    const body = await res.text()
    const data = JSON.parse(body.slice(5, -1))

    const pages = data?.query?.pages

    if (!Object.keys(pages).length) return false

    const results = {
      title: '',
      definitions: [],
    }

    let title, content

    for (const page in pages) {
      title = data.query.pages[page].title
      content = data.query.pages[page].revisions[0]['*']
    }

    results.title = title
    results.definitions = Wiktionary.parseTextFromApi(content, lang || "English")

    return results
  }
}

export default Wiktionary
