import en from '../en.json'
import pt from '../pt.json'

const enKeys = Object.keys(en)
const ptKeys = Object.keys(pt)

describe('locale JSON files', () => {
  it('en.json is not empty', () => {
    expect(enKeys.length).toBeGreaterThan(0)
  })

  it('pt.json is not empty', () => {
    expect(ptKeys.length).toBeGreaterThan(0)
  })

  it('all en.json values are strings', () => {
    Object.values(en).forEach((value) => {
      expect(typeof value).toBe('string')
    })
  })

  it('all pt.json values are strings', () => {
    Object.values(pt).forEach((value) => {
      expect(typeof value).toBe('string')
    })
  })

  it('en.json contains core auth keys', () => {
    expect(en).toHaveProperty(['login.button'])
    expect(en).toHaveProperty(['login.email'])
    expect(en).toHaveProperty(['register.title'])
  })

  it('pt.json contains core auth keys', () => {
    expect(pt).toHaveProperty(['login.button'])
    expect(pt).toHaveProperty(['login.email'])
    expect(pt).toHaveProperty(['register.title'])
  })

  it('pt.json has all keys that en.json has', () => {
    enKeys.forEach((key) => {
      expect(ptKeys).toContain(key)
    })
  })
})
