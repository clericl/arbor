import iso639_1 from './iso639-1.json'
import iso639_3 from './iso639-3.json'
import iso639AllCodes from './iso639AllCodes.json'

class Language {
  constructor(code) {
    if (code[0] === code[0].toUpperCase()) {
      this.refName = code
      this.alpha2 = iso639AllCodes[this.refName].alpha2
      this.alpha3 = iso639AllCodes[this.refName].alpha3
    } else {
      if (code.length === 2) {
        this.alpha2 = code
        this.refName = iso639_1[this.alpha2]
        this.alpha3 = iso639AllCodes[this.refName].alpha3
      } else {
        this.alpha3 = code
        this.refName = iso639_3[this.alpha3]
        this.alpha2 = iso639AllCodes[this.refName].alpha2
      }
    }

    if (!this.refName) {
      throw new Error(`Could not identify the given language code or name: ${code}`)
    }
  }
}

export default Language
