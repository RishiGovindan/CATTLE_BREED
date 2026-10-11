const ROWS = [
  { key: 'type', label: 'Animal Type', format: (breed) => (breed.type === 'cattle' ? 'Cattle' : 'Buffalo') },
  { key: 'origin', label: 'Origin' },
  { key: 'purpose', label: 'Primary Purpose' },
  { key: 'climate', label: 'Climate Adaptability' },
  { key: 'milkYield', label: 'Milk Production' },
  { key: 'size', label: 'Average Size / Build' },
  { key: 'temperament', label: 'Temperament' },
  {
    key: 'characteristics',
    label: 'Key Characteristics',
    format: (breed) => breed.characteristics.join(' · '),
  },
  {
    key: 'physicalFeatures',
    label: 'Physical Features',
    format: (breed) => breed.physicalFeatures.join(' · '),
  },
]

export default function ComparisonTable({ breedA, breedB }) {
  return (
    <div className="comparison-table-wrap">
      <table className="comparison-table">
        <thead>
          <tr>
            <th scope="col" className="comparison-table-label-col">
              Attribute
            </th>
            <th scope="col">{breedA.name}</th>
            <th scope="col">{breedB.name}</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => {
            const valueA = row.format ? row.format(breedA) : breedA[row.key]
            const valueB = row.format ? row.format(breedB) : breedB[row.key]
            const isDifferent = valueA !== valueB
            return (
              <tr key={row.key} className={isDifferent ? 'is-different' : ''}>
                <th scope="row">{row.label}</th>
                <td>{valueA}</td>
                <td>{valueB}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
