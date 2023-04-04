import $ from 'jquery'
import ArborNode from './ArborNode'
import Language from './Language'

class Wiktionary {
  static async getDefinitionRes(title) {
    const url = `https://en.wiktionary.org/api/rest_v1/page/definition/${title}?redirect=false`
    const res = await fetch(url)
    return await res.json()
  }

  static async getHtmlRes(title) {
    const url = `https://en.wiktionary.org/api/rest_v1/page/html/${title}`
    
    const res = await fetch(url)
    if (res.ok) {
      return await res.text()
    }

    return false
  }

  static parseDefinitionRes(res, lang) {
    const parsedLang = new Language(lang).refName

    // const htmlTagRegex = /(<a .*Appendix:Glossary[^>]*>)([^<]+)(<\/a>)/g
    const hrefRegex = /href="([^(")]+)"/g
    const trimWhitespaceRegex = /^\s+|\s+$/g

    let allGroups = []

    for (const group in res) {
      allGroups = allGroups.concat(res[group])
    }

    const byPartsOfSpeech = new Map()

    for (const group of allGroups) {
      const {
        definitions,
        language,
        partOfSpeech,
      } = group

      if (language === parsedLang) {
        const prevEntries = byPartsOfSpeech.get(partOfSpeech) || []

        byPartsOfSpeech.set(
          partOfSpeech,
          prevEntries.concat(definitions.map(({ definition }) => {
            // const parsed = definition.replace(htmlTagRegex, '$2')
            const relativeToAbsolute = definition.replace(hrefRegex, 'href="https://en.wiktionary.org$1" target="__blank" rel="noopener noreferrer"')
            return relativeToAbsolute.replace(trimWhitespaceRegex, '')
          }))
        )
      }
    }

    return byPartsOfSpeech
  }

  static async getTopDefinition(word, langRefName) {
    const res = await Wiktionary.getDefinitionRes(word)    

    let allGroups = []

    for (const group in res) {
      allGroups = allGroups.concat(res[group])
    }

    const langDefinitions = allGroups?.find((group) => group.language === langRefName)?.definitions || []

    for (const langDefinition of langDefinitions) {
      const { definition } = langDefinition

      if (definition) return definition
    }

    return ''
  }

  static async getBaseForm(word, langRefName) {
    const topDefinitionHtml = await Wiktionary.getTopDefinition(word, langRefName)

    // create jQuery object from the HTML-type response
    const formOfDefinitionLinkText = $($.parseHTML(topDefinitionHtml))
      // select the element that would hold the base form
      .find('.form-of-definition-link')
      // get its innerText (empty string if no such element is found)
      .text()

    return formOfDefinitionLinkText || word
  }

  static async getEtymologies(word, langRefName = 'English', filterHomographs = true, filterAffixes = false) {
    const parsedLangRefName = langRefName.replace(/ /g,"_")
    const targetWord = word.replace(/^\*/g, `Reconstruction%3A${parsedLangRefName}%2F`)

    const htmlRes = await Wiktionary.getHtmlRes(targetWord)

    if (!htmlRes) return []

    // create jQuery object from the HTML-type response
    const $langSection = $($.parseHTML(htmlRes))
      // select the section that matches the target language
      .has(`h2#${parsedLangRefName}`)

    // select the etymology header(s)
    let $etymologyHeaders = $langSection.find('h3[id^=Etymology]')

    // take only the first header if filtering homographs
    if (filterHomographs) {
      $etymologyHeaders = $etymologyHeaders.first()
    }

    let $etymologies = $()

    $etymologyHeaders.each((_, domObj) => {
      // for each header, select section content that may contain target information
      const $targetEtymology = $(domObj).nextUntil('h3, h4, h5')
        // select items likely to be an etymology reference
        .find('i.mention:not(.e-example)')
        // select the first such item
        .first()
  
      // consider etymology structures that are separated by morpheme (prefix, suffix)
      let $nextPiece = $targetEtymology
      let $morphemes = $($nextPiece)
      
      // these are generally marked with a "+" in a subsequent <span>
      while ($nextPiece.nextUntil('i').text().includes('+')) {
        // add the next etymology item to the selection if it follows this structure
        $nextPiece = $nextPiece.nextAll('i.mention:not(.e-example)').first()
        $morphemes = $morphemes.add($nextPiece)
      }
  
      $etymologies = $etymologies.add($morphemes)
    })

    // also look for a primary base form of the word, e.g. is the first definition
    // in the language section
    $etymologies = $etymologies.add(
      $langSection.find('ol > li span.form-of-definition-link > i.mention')
        .first()
    )

    if (filterAffixes) {
      $etymologies = $etymologies.filter((_, domObj) => $(domObj).find('a').text().match(/(^-)|(-$)/g) === null)
    }

    const targetSource = `${new Language(langRefName).alpha3}: ${word}`

    const etymologyNodes = $etymologies.map((_, domObj) => {
      let sourceTitle = domObj.innerText

      const $domObj = $(domObj).find('a').first()

      if ($domObj.length) {
        sourceTitle = $domObj.attr('title').replace(/((Reconstruction:)+(\w|\W)+){1}(\/)([\w\W]+$)/g, '*$5').split(',')[0]
      }

      return new ArborNode(`${new Language(domObj.lang).alpha3}: ${sourceTitle}`, targetSource, 'rel:etymological_origin_of')
    }).get()

    // consider etymologies that have a failing redirect
    // in these cases, add the next one found
    for await (const domObjToTest of $etymologies.get()) {
      const $domObjToTest = $(domObjToTest)
      const definitionRes = await Wiktionary.getDefinitionRes(encodeURIComponent($domObjToTest.find('a').attr('title')))
      const parsedDefinitionRes = Wiktionary.parseDefinitionRes(definitionRes, $domObjToTest.attr('lang'))
      
      if (parsedDefinitionRes.size === 0) {

        const $nextItem = $(domObjToTest).nextAll('i.mention:not(.e-example)').first()

        if ($nextItem.length) {
          let sourceTitle = $nextItem.text()
  
          const $domObj = $nextItem.find('a').first()
    
          if ($domObj.length) {
            sourceTitle = $domObj.attr('title').replace(/((Reconstruction:)+(\w|\W)+){1}(\/)([\w\W]+$)/g, '*$5').split(',')[0]
          }

          if (!etymologyNodes.find((existingNode) => existingNode.source === `${new Language($nextItem.attr('lang')).alpha3}: ${sourceTitle}`)) {
            const targetSource = $domObjToTest.find('a').attr('title') || $domObjToTest.text()

            etymologyNodes.push(new ArborNode(
              `${new Language($nextItem.attr('lang')).alpha3}: ${sourceTitle}`,
              `${new Language($domObjToTest.attr('lang')).alpha3}: ${targetSource.replace(/((Reconstruction:)+(\w|\W)+){1}(\/)([\w\W]+$)/g, '*$5')}`,
              'rel:etymological_origin_of'
            ))
          }
        }
      }
    }

    return etymologyNodes
  }
}

export default Wiktionary
