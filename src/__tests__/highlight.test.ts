import { computeMatches } from '../components/utils/ExpandableText'

describe('computeMatches', () => {
  it('finds first occurrence of each term', () => {
    const content = 'Independência do Brasil ocorreu em 1822. Brasil é um país.'
    const terms = [{ term: 'Brasil' }, { term: '1822' }]
    const res = computeMatches(content, terms)
    expect(res).toHaveLength(2)
    expect(res[0].start).toBe(content.toLowerCase().indexOf('brasil'))
    expect(res[1].start).toBe(content.toLowerCase().indexOf('1822'))
  })

  it('ignores duplicates', () => {
    const content = 'AAA BBB AAA BBB'
    const terms = [{ term: 'AAA' }, { term: 'AAA' }]
    const res = computeMatches(content, terms)
    expect(res).toHaveLength(1)
  })

  it('drops overlaps', () => {
    const content = 'abcdef'
    const terms = [{ term: 'abc' }, { term: 'bc' }]
    const res = computeMatches(content, terms)
    expect(res).toHaveLength(1)
    expect(res[0].start).toBe(0)
  })
})
